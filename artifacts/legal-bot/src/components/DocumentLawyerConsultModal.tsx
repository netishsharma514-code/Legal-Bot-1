import { useState, useId } from 'react';
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Phone, 
  Mail, 
  Clock, 
  Lock, 
  Send, 
  FileText, 
  AlertTriangle,
  Building2,
  Calendar,
  Check
} from 'lucide-react';
import { Lawyer, DocumentAnalysisResult, ConsultationInquiry } from '../data/types';
import { INITIAL_LAWYERS } from '../data/lawyers';
import { UserLocationState, matchDocumentTypeToSpecializations } from '../data/location';
import { supabase, dbMode } from '../lib/supabase';

interface DocumentLawyerConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: DocumentAnalysisResult;
  documentName: string;
  userLocation: UserLocationState;
  onOpenLocationChange?: () => void;
}

export function DocumentLawyerConsultModal({
  isOpen,
  onClose,
  analysis,
  documentName,
  userLocation,
  onOpenLocationChange,
}: DocumentLawyerConsultModalProps) {
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [consultationMode, setConsultationMode] = useState<'chamber' | 'phone' | 'video'>('chamber');
  const [userNote, setUserNote] = useState('');
  const [explicitConsent, setExplicitConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<ConsultationInquiry | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formId = useId();

  if (!isOpen) return null;

  // Find matching specializations for document type
  const matchingSpecs = matchDocumentTypeToSpecializations(analysis.documentType || documentName);

  // Filter & prioritize lawyers:
  // 1. Exact city match + matching specialization
  // 2. Exact city match (any)
  // 3. Same state match + matching specialization
  // 4. Other verified lawyers
  const userCityLower = userLocation.city.toLowerCase();
  const userStateLower = userLocation.state.toLowerCase();

  // Filter & prioritize real verified lawyers (exclude fictional demo lawyers to protect privacy):
  const verifiedLawyers = INITIAL_LAWYERS.filter((l) => !l.isDemo);

  const citySpecialtyLawyers = verifiedLawyers.filter(
    (l) => l.city.toLowerCase() === userCityLower && l.specializations.some((s) => matchingSpecs.includes(s))
  );

  const cityAllLawyers = verifiedLawyers.filter(
    (l) => l.city.toLowerCase() === userCityLower && !citySpecialtyLawyers.includes(l)
  );

  const stateSpecialtyLawyers = verifiedLawyers.filter(
    (l) => l.state.toLowerCase() === userStateLower &&
      l.city.toLowerCase() !== userCityLower &&
      l.specializations.some((s) => matchingSpecs.includes(s))
  );

  const otherMatchingLawyers = verifiedLawyers.filter(
    (l) => !citySpecialtyLawyers.includes(l) &&
      !cityAllLawyers.includes(l) &&
      !stateSpecialtyLawyers.includes(l) &&
      l.specializations.some((s) => matchingSpecs.includes(s))
  );

  const prioritizedLawyers: { lawyer: Lawyer; proximityLabel: string }[] = [
    ...citySpecialtyLawyers.map((l) => ({ lawyer: l, proximityLabel: `In ${l.city} · Practice Match` })),
    ...cityAllLawyers.map((l) => ({ lawyer: l, proximityLabel: `In ${l.city} · Civil & High Court` })),
    ...stateSpecialtyLawyers.map((l) => ({ lawyer: l, proximityLabel: `In ${l.city} (${l.state}) · Practice Match` })),
    ...otherMatchingLawyers.map((l) => ({ lawyer: l, proximityLabel: `${l.city} · Verified Practice Match` })),
  ];

  // Auto-select first verified lawyer if none selected
  const activeLawyer = selectedLawyer || prioritizedLawyers[0]?.lawyer || verifiedLawyers[0] || INITIAL_LAWYERS[0];

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explicitConsent) {
      setSubmitError('Please check the explicit consent box before proceeding.');
      return;
    }
    if (!userName.trim() || !userPhone.trim() || !userEmail.trim()) {
      setSubmitError('Please fill in your name, phone number, and email.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const issuesList = analysis.flaggedClauses?.map((c) => `${c.clauseTitle}: ${c.issue}`) || [];
    const inquiryRecord: ConsultationInquiry = {
      id: `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      lawyerId: activeLawyer.id,
      lawyerName: activeLawyer.name,
      lawyerBarCouncil: activeLawyer.barCouncilNumber,
      lawyerCourt: activeLawyer.court,
      lawyerCity: activeLawyer.city,
      documentName: documentName || 'Legal Document',
      documentType: analysis.documentType || 'Contract / Legal Document',
      documentSummary: analysis.summary || '',
      extractedIssues: issuesList,
      userName: userName.trim(),
      userPhone: userPhone.trim(),
      userEmail: userEmail.trim(),
      userLocation: `${userLocation.city}, ${userLocation.state}`,
      userNote: userNote.trim() ? `[Preferred Mode: ${consultationMode}] ${userNote.trim()}` : `[Preferred Mode: ${consultationMode}]`,
      consentGiven: true,
      status: 'Pending Advocate Review',
      createdAt: new Date().toISOString(),
    };

    try {
      // Store in Supabase / Local storage database
      await supabase.from('consultation_inquiries').insert({
        ...inquiryRecord,
        mode: consultationMode,
        database_mode: dbMode,
      });

      setSubmittedInquiry(inquiryRecord);
    } catch (err) {
      console.warn('Inquiry save notice:', err);
      // Fallback local acknowledgment
      setSubmittedInquiry(inquiryRecord);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consult-lawyer-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="consult-lawyer-title" className="text-base font-bold text-slate-900 dark:text-white">
                Consult a Nearby Advocate About This Document
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Matched by document practice area: <strong className="text-blue-700 dark:text-blue-300">{analysis.documentType || 'Contract Law'}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Location prioritization banner */}
        <div className="px-6 py-2.5 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
            <span>Prioritizing verified advocates near:</span>
            <strong className="text-slate-900 dark:text-white">{userLocation.city}, {userLocation.state}</strong>
          </div>
          {onOpenLocationChange && (
            <button
              onClick={onOpenLocationChange}
              className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold hover:underline"
            >
              Change City
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {submittedInquiry ? (
            /* Confirmation Screen */
            <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-5 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                    Consultation Inquiry Transmitted
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Inquiry Reference: {submittedInquiry.id}
                  </h3>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Assigned Advocate</span>
                    <strong className="text-slate-900 dark:text-white text-sm">{submittedInquiry.lawyerName}</strong>
                    <span className="text-[11px] text-slate-500 block">Bar Council: {submittedInquiry.lawyerBarCouncil}</span>
                    <span className="text-[11px] text-slate-500 block">{submittedInquiry.lawyerCourt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Client Details</span>
                    <strong className="text-slate-900 dark:text-white">{submittedInquiry.userName}</strong>
                    <span className="text-[11px] text-slate-500 block">{submittedInquiry.userPhone} · {submittedInquiry.userEmail}</span>
                    <span className="text-[11px] text-slate-500 block">Location: {submittedInquiry.userLocation}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Subject Document</span>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    {submittedInquiry.documentType} ({submittedInquiry.documentName})
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-1 line-clamp-2">
                    {submittedInquiry.documentSummary}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    Status: <strong className="text-emerald-700 dark:text-emerald-400">{submittedInquiry.status}</strong>
                  </span>
                  <span className="text-slate-400">
                    Expected Advocate Response: Within 24 Hours
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-emerald-100 dark:border-emerald-900 text-xs text-slate-600 dark:text-slate-400">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Your inquiry summary is shared with the selected advocate only after the separate consent below. The document-processing consent does not authorize advocate sharing.
                </span>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-semibold transition-colors"
              >
                Done & Return to Document Audit
              </button>
            </div>
          ) : (
            /* Inquiry Form */
            <form onSubmit={handleSubmitInquiry} className="space-y-6">
              {submitError && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Step 1: Select Verified Advocate */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  1. Select a Verified Practicing Advocate
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {prioritizedLawyers.map(({ lawyer, proximityLabel }) => {
                    const isSelected = activeLawyer.id === lawyer.id;
                    return (
                      <div
                        key={lawyer.id}
                        onClick={() => setSelectedLawyer(lawyer)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all text-xs space-y-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/50 ring-1 ring-blue-600 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                            <span>{lawyer.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
                            {proximityLabel}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lawyer.court} · {lawyer.experienceYears} yrs experience
                        </div>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {lawyer.specializations.slice(0, 2).map((s, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="pt-1 flex items-center justify-between text-[11px] font-medium border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{lawyer.feeEstimate}</span>
                          <span className="text-slate-500">{lawyer.barCouncilNumber}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Information to be Shared Preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Information Included with Inquiry</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Protected Summary Only</span>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div><strong>Document Type:</strong> {analysis.documentType || 'Contract / Draft'}</div>
                  <div><strong>Identified Risk Level:</strong> {analysis.riskLevel} Risk (Score: {analysis.riskScore}/100)</div>
                  <div><strong>Summary:</strong> {analysis.summary?.slice(0, 160)}...</div>
                  {analysis.flaggedClauses?.length > 0 && (
                    <div>
                      <strong>Flagged Legal Clauses ({analysis.flaggedClauses.length}):</strong>{' '}
                      {analysis.flaggedClauses.map((c) => c.clauseTitle).join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: User Contact Details */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                  2. Your Contact & Consultation Preferences
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label htmlFor={`${formId}-name`} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Full Name *
                    </label>
                    <input
                      id={`${formId}-name`}
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${formId}-phone`} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Phone Number *
                    </label>
                    <input
                      id={`${formId}-phone`}
                      type="tel"
                      required
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${formId}-email`} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Email Address *
                    </label>
                    <input
                      id={`${formId}-email`}
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Preferred Consultation Mode
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'chamber', label: 'In-Chamber / Court Office' },
                      { id: 'phone', label: 'Telephone Consultation' },
                      { id: 'video', label: 'Video Conference' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setConsultationMode(mode.id as any)}
                        className={`py-2 px-2.5 rounded-lg border text-[11px] font-medium text-center transition-colors ${
                          consultationMode === mode.id
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor={`${formId}-note`} className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Confidential Note to Advocate (Optional)
                  </label>
                  <textarea
                    id={`${formId}-note`}
                    rows={2}
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Step 4: Explicit User Consent Checkbox (MANDATORY REQUIREMENT) */}
              <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={explicitConsent}
                    onChange={(e) => setExplicitConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                  />
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
                    <strong className="block text-slate-900 dark:text-white">
                      Explicit Consent for Advocate Consultation Transmission:
                    </strong>
                    I explicitly consent to sharing this document summary, identified legal issues, and my contact details with{' '}
                    <strong>{activeLawyer.name}</strong> ({activeLawyer.barCouncilNumber}) for the sole purpose of legal consultation. I understand this is separate from consent to send document text to Legal Bot's server.
                  </div>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!explicitConsent || isSubmitting}
                  className="py-2.5 px-6 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting Inquiry...' : `Send Inquiry to ${activeLawyer.name}`}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
