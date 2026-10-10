import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Scale, 
  HelpCircle, 
  ExternalLink, 
  PhoneCall, 
  Building2, 
  MapPin, 
  X,
  ChevronRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { VERIFIED_LEGAL_AID_CENTRES } from '../data/legalAid';
import { UserLocationState, INDIAN_STATES } from '../data/location';

interface LegalAidEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocationState;
  onNavigateTab?: (tab: string) => void;
}

export function LegalAidEligibilityModal({
  isOpen,
  onClose,
  userLocation,
  onNavigateTab,
}: LegalAidEligibilityModalProps) {
  // Question states
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [incomeBand, setIncomeBand] = useState<string>('');
  const [inCustody, setInCustody] = useState<string>('no');
  const [matterType, setMatterType] = useState<string>('civil_criminal');
  const [stateOverride, setStateOverride] = useState<string>(userLocation.state || 'Delhi');

  // Evaluation outcome state
  const [hasEvaluated, setHasEvaluated] = useState(false);

  if (!isOpen) return null;

  // Find nearest DLSA/SLSA for selected state
  const matchedCentre = VERIFIED_LEGAL_AID_CENTRES.find(
    (c) =>
      c.state.toLowerCase() === stateOverride.toLowerCase() ||
      c.district.toLowerCase().includes(userLocation.city.toLowerCase()) ||
      c.name.toLowerCase().includes(stateOverride.toLowerCase())
  ) || VERIFIED_LEGAL_AID_CENTRES[0];

  // Specific automatic statutory categories under Section 12 of Legal Services Authorities Act, 1987:
  // (a) member of SC or ST
  // (b) victim of trafficking in human beings or begar
  // (c) woman or a child
  // (d) person with disability
  // (e) person under circumstances of underserved want (mass disaster, violence, flood, drought, industrial disaster)
  // (f) an industrial workman
  // (g) in custody (including protective home, juvenile home, psychiatric hospital)
  // (h) annual income below statutory ceiling (typically <= ₹3,00,000 for High Court / District Court, varies slightly by state)
  const isDirectlyEligibleCategory = [
    'woman_child',
    'sc_st',
    'disability',
    'industrial_workman',
    'disaster_victim',
    'trafficking_victim'
  ].includes(selectedCategory);

  const isCustodyEligible = inCustody === 'yes';
  const isIncomeEligible = incomeBand === 'below_3l';

  const isLikelyEligible = isDirectlyEligibleCategory || isCustodyEligible || isIncomeEligible;

  const handleEvaluate = (e: React.FormEvent) => {
    e.preventDefault();
    setHasEvaluated(true);
  };

  const handleReset = () => {
    setSelectedCategory('');
    setIncomeBand('');
    setInCustody('no');
    setMatterType('civil_criminal');
    setHasEvaluated(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Check Free Legal Aid Eligibility</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Sec 12 LSA Act 1987
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guaranteed by National Legal Services Authority (NALSA) & State Legal Services Authorities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Important Statutory Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Official Assessment Notice:</strong> Legal Bot provides preliminary guidance based on Section 12 of the Legal Services Authorities Act, 1987. Final eligibility is determined exclusively by the respective District Legal Services Authority (DLSA) or State Legal Services Authority (SLSA) upon document verification. Approval cannot be guaranteed automatically.
            </div>
          </div>

          {!hasEvaluated ? (
            <form onSubmit={handleEvaluate} className="space-y-5 text-xs">
              {/* Question 1: Jurisdiction / State */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  1. Jurisdiction State / UT (For State Legal Services Authority Rules)
                </label>
                <select
                  value={stateOverride}
                  onChange={(e) => setStateOverride(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st} {st === userLocation.state ? '(Your Location)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Matched District/State Authority will be based on this jurisdiction.
                </p>
              </div>

              {/* Question 2: Statutory Category */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                  2. Do you or the applicant belong to any of these protected categories under Sec 12? *
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'woman_child', label: 'Woman or Child (Below 18 years) — Automatic Entitlement' },
                    { id: 'sc_st', label: 'Member of Scheduled Caste (SC) or Scheduled Tribe (ST)' },
                    { id: 'disability', label: 'Person with Disability (under Rights of Persons with Disabilities Act)' },
                    { id: 'industrial_workman', label: 'Industrial Workman in labour / employment dispute' },
                    { id: 'disaster_victim', label: 'Victim of disaster, flood, riot, violence, or caste atrocity' },
                    { id: 'trafficking_victim', label: 'Victim of trafficking in human beings or bonded labour' },
                    { id: 'general', label: 'None of the above / General category' },
                  ].map((cat) => (
                    <label
                      key={cat.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        selectedCategory === cat.id
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        required
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(cat.id)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 3: Annual Household Income */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                  3. What is the applicant's annual household income? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'below_3l', label: 'Up to ₹3,00,000 per year (Eligible in most States)' },
                    { id: 'above_3l', label: 'Above ₹3,00,000 per year' },
                  ].map((inc) => (
                    <label
                      key={inc.id}
                      className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        incomeBand === inc.id
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="income"
                        required
                        checked={incomeBand === inc.id}
                        onChange={() => setIncomeBand(inc.id)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{inc.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Question 4: Custody status */}
              <div>
                <label className="font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">
                  4. Is the person in police custody, judicial custody, or under-trial detention? *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'yes', label: 'Yes, in custody or jail (Entitled to free remand/bail advocate)' },
                    { id: 'no', label: 'No, not in custody' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        inCustody === opt.id
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="custody"
                        required
                        checked={inCustody === opt.id}
                        onChange={() => setInCustody(opt.id)}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>Evaluate Free Legal Aid Eligibility</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Results Screen */
            <div className="space-y-6">
              {isLikelyEligible ? (
                <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200 font-bold text-base">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <span>Likely Eligible for Free Government Legal Aid</span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                    Based on your selected profile under <strong>Section 12 of the Legal Services Authorities Act, 1987</strong>, you qualify to apply for free legal services, including an assigned panel advocate, court fee waivers, and drafting assistance.
                  </p>
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1 pt-1">
                    <div>
                      ● <strong>Basis of Qualification:</strong> {
                        isDirectlyEligibleCategory
                          ? 'Protected statutory category (Women, Children, SC/ST, Disability, Workmen, or Disaster Victims)'
                          : isCustodyEligible
                          ? 'Person in custody / under-trial detention (Sec 12(g))'
                          : 'Household income within statutory ceiling (Sec 12(h))'
                      }
                    </div>
                    <div>
                      ● <strong>What you receive:</strong> Free court representation, drafting of petitions/bail, and exemption from court fees.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 font-bold text-base">
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    <span>General Category — May Require DLSA Discretionary Review</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Under standard statutory ceilings, annual income above ₹3,00,000 generally falls outside automatic free legal aid panels. However, you can still approach your local District Legal Services Authority (DLSA) for special circumstances, or consult verified private advocates.
                  </p>
                </div>
              )}

              {/* Nearest Matched DLSA/SLSA */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Your Nearest Matched Legal Services Authority ({stateOverride})</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {matchedCentre.name}
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{matchedCentre.address}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Phone: {matchedCentre.phone}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href="tel:15100"
                    className="py-2 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call National Helpline: 15100 (Toll-Free)</span>
                  </a>
                  <a
                    href="https://nalsa.gov.in/"
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-4 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Apply on NALSA Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Documents to Bring / Submit to DLSA Front Office:</span>
                </div>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300 list-disc list-inside text-[11px]">
                  <li>Aadhaar Card / Voter ID / Govt ID proof</li>
                  <li>Income Certificate (if applying under income criteria) or Self-Declaration affidavit</li>
                  <li>Copy of court summons, notice, FIR, or order in dispute</li>
                  <li>Caste / Disability certificate (if applying under protected category)</li>
                </ul>
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
                >
                  Check Again / Reset Answers
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateTab?.('legal-aid');
                    }}
                    className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs"
                  >
                    View All State Authorities
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
