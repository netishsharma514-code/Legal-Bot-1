import { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileCheck, 
  Loader2, 
  Scale, 
  ArrowRight,
  Info,
  Download,
  Copy,
  Check,
  Users,
  MapPin,
  ExternalLink,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import { 
  DocumentAnalysisResult
} from '../data/types';
import { getStoredLocation, UserLocationState } from '../data/location';
import { DocumentLawyerConsultModal } from '../components/DocumentLawyerConsultModal';
import { LocationSelectorModal } from '../components/LocationSelectorModal';
import { INITIAL_LAWYERS } from '../data/lawyers';
import {
  useAnalyzeLegalDocument,
  useExtractLegalDocumentText,
} from '@workspace/api-client-react';
import { generateDocumentAnalysisFallback } from '@workspace/api-zod';

const hasVerifiedLawyers = INITIAL_LAWYERS.some((lawyer) => lawyer.isVerified && !lawyer.isDemo);

interface UploadProps {
  onNavigateTab?: (tab: string) => void;
}

export function Upload({ onNavigateTab }: UploadProps) {
  const [documentText, setDocumentText] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DocumentAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocationState>(getStoredLocation());
  const [documentConsent, setDocumentConsent] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<'gemini-2.5-flash' | 'statutory-engine' | 'local-rule-audit' | null>(null);
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);
  const extractDocumentText = useExtractLegalDocumentText();
  const analyzeDocument = useAnalyzeLegalDocument();

  useEffect(() => {
    const handleLocationChange = (e: Event) => {
      const customEvt = e as CustomEvent<UserLocationState>;
      if (customEvt.detail) {
        setUserLocation(customEvt.detail);
      }
    };
    window.addEventListener('legalbot-location-changed', handleLocationChange);
    return () => window.removeEventListener('legalbot-location-changed', handleLocationChange);
  }, []);

  const sampleContracts = [
    {
      name: 'High-Risk Employment Agreement (Sample)',
      type: 'Employment Agreement',
      text: `EMPLOYMENT AND SERVICE AGREEMENT
This Agreement is entered into on 1st March 2026 by and between NexaTech Solutions Pvt Ltd ("Company") and Rahul Verma ("Employee").
1. TERM & COMMENCEMENT: The Employee's services commence on 1st April 2026 for a probationary period of 6 months.
2. EXCLUSIVITY & POST-TERMINATION NON-COMPETE: The Employee agrees that upon termination of this Agreement for any reason, the Employee shall not work for, consult with, or establish any competing business anywhere in India for a period of 3 (Three) years following termination.
3. UNILATERAL INDEMNITY: The Employee shall indemnify, hold harmless and defend the Company and its directors from any and all claims, financial losses, regulatory penalties, or customer disputes arising directly or indirectly during employment, irrespective of negligence.
4. TERMINATION AT WILL: The Company reserves the unilateral right to terminate the Employee immediately without cause and without any notice period or severance pay.
5. ARBITRATION & COSTS: All disputes shall be referred to a sole arbitrator appointed solely by the Company. All arbitration costs shall be borne entirely by the Employee.
6. JURISDICTION: This agreement shall be subject to the exclusive jurisdiction of courts outside the territory of India.`,
    },
    {
      name: 'Standard 11-Month Residential Rental Agreement (Sample)',
      type: 'Residential Rental Agreement',
      text: `RESIDENTIAL LEASE AGREEMENT
This Rent Agreement is made on 15th January 2026 between Ramesh Chandra ("Landlord") and Anita Sen ("Tenant").
1. TERM: The tenancy shall be for an 11-month period from 1st February 2026 to 31st December 2026.
2. RENT: Monthly rent of Rs. 28,000/- payable before the 5th of each calendar month into Landlord's bank account.
3. SECURITY DEPOSIT: Tenant has deposited an interest-free refundable deposit of Rs. 84,000/-. Deposit shall be refunded within 15 days of vacation after verifying utility bills.
4. NOTICE PERIOD: Either party may terminate with 1 month prior written notice.
5. LOCK-IN PERIOD: A lock-in period of 3 months applies from the commencement date.
6. UTILITIES: Electricity and water shall be paid directly by the Tenant as per meter readings.
7. GOVERNING LAW & JURISDICTION: Governed by the laws of India and civil courts of New Delhi.`,
    },
    {
      name: 'Mutual Non-Disclosure Agreement (Sample)',
      type: 'Non-Disclosure Agreement (NDA)',
      text: `MUTUAL NON-DISCLOSURE AGREEMENT
This Agreement is made on 10th February 2026 between Alpha Digital Ltd ("Disclosing Party") and Beta Ventures LLP ("Receiving Party").
1. PURPOSE: The parties wish to explore a potential strategic commercial partnership.
2. CONFIDENTIAL INFORMATION: Includes all technical, proprietary, and commercial information disclosed in written or digital form.
3. EXCLUSIONS: Information publicly known, independently developed, or rightfully obtained from third parties is excluded.
4. PERPETUAL OBLIGATION: The Receiving Party shall protect Confidential Information indefinitely with no sunset expiration date.
5. GOVERNING LAW & ARBITRATION: Governed by laws of India. Any dispute shall be resolved through arbitration under the Arbitration and Conciliation Act 1996 seated in Mumbai.`,
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!documentConsent) {
      setErrorMsg('Please provide document-processing consent before uploading a document.');
      e.target.value = '';
      return;
    }
    setErrorMsg(null);
    setAnalysisResult(null);
    setAnalysisSource(null);
    setAnalysisNotice(null);

    // 1. Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 10MB limit. Please upload a smaller document.');
      return;
    }

    // 2. Validate file type
    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
    const isDocx = lowerName.endsWith('.docx') || file.type.includes('wordprocessingml');
    const isTxt = lowerName.endsWith('.txt') || file.type === 'text/plain';

    if (!isPdf && !isDocx && !isTxt) {
      setErrorMsg('Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text file (.txt).');
      return;
    }

    setDocumentName(file.name);
    setIsExtracting(true);

    try {
      if (isTxt) {
        const text = await file.text();
        if (!text.trim()) {
          setErrorMsg('The uploaded text file is empty. Please provide a document with text.');
        } else {
          setDocumentText(text.trim());
        }
        setIsExtracting(false);
        return;
      }

      // PDF and DOCX readable text extraction runs on the server after consent.
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = (reader.result as string) || '';
          const base64Data = dataUrl.includes(',') ? dataUrl.slice(dataUrl.indexOf(',') + 1) : dataUrl;
          const data = await extractDocumentText.mutateAsync({
            data: { base64: base64Data, filename: file.name, mimeType: file.type || undefined },
          });
          if (data.success && data.text) {
            setDocumentText(data.text);
          } else {
            setErrorMsg('Unable to extract readable text. The document may be scanned (image-only), password-protected, or corrupted. Please provide a searchable file or paste the text directly.');
          }
        } catch (extractErr) {
          console.error('Error during file extraction:', extractErr);
          setErrorMsg('Failed to process file on server. Please try pasting the text directly into the audit box.');
        } finally {
          setIsExtracting(false);
        }
      };

      reader.onerror = () => {
        setIsExtracting(false);
        setErrorMsg('Failed to read file from disk. Please try again or paste text directly.');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setIsExtracting(false);
      setErrorMsg('Error processing file. Please paste text directly.');
      console.error(err);
    }
  };

  const handleRunAudit = async () => {
    if (!documentConsent) {
      setErrorMsg('Please confirm document-processing consent before running an audit.');
      return;
    }
    if (!documentText.trim()) {
      setErrorMsg('Please paste or upload document text to audit.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setAnalysisResult(null);
    setAnalysisSource(null);
    setAnalysisNotice(null);

    try {
      const response = await analyzeDocument.mutateAsync({
        data: {
          documentText,
          documentName: documentName || 'Legal Document Audit',
        },
      });
      if (response.analysis?.summary) {
        setAnalysisResult(formatOrEnrichResult(response.analysis));
        setAnalysisSource(response.source);
        setAnalysisNotice(response.notice || null);
      } else {
        runLocalRuleAudit(documentText);
      }
    } catch (analysisErr) {
      console.error('Document analysis request failed; using local rule audit.', analysisErr);
      runLocalRuleAudit(documentText);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatOrEnrichResult = (raw: any): DocumentAnalysisResult => ({
    ...raw,
    extractedFacts: {
      documentType: raw.extractedFacts?.documentType || raw.documentType || 'Not available in supplied text',
      subject: raw.extractedFacts?.subject || raw.subject || 'Not available in supplied text',
      parties: raw.extractedFacts?.parties || [],
      importantDates: raw.extractedFacts?.importantDates || [],
      keyObligations: raw.extractedFacts?.keyObligations || [],
      importantClauses: raw.extractedFacts?.importantClauses || [],
    },
    flaggedClauses: raw.flaggedClauses || [],
    missingProtections: raw.missingProtections || [],
    positiveAspects: raw.positiveAspects || [],
    recommendedNextSteps: raw.recommendedNextSteps || [],
    officialSources: raw.officialSources || [],
  });

  const runLocalRuleAudit = (text: string) => {
    const result = generateDocumentAnalysisFallback(text);
    setAnalysisResult(result);
    setAnalysisSource('local-rule-audit');
    setAnalysisNotice('Gemini did not produce this result. The local keyword fallback scanned the complete supplied text for selected patterns only; legal effects and citations were not verified.');
  };

  const generateReportText = (): string => {
    if (!analysisResult) return '';
    const r = analysisResult;
    return `=====================================================
LEGAL BOT — INDIAN CONTRACT & DOCUMENT AUDIT REPORT
Document: ${documentName || 'Document Audit'}
Generated: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}
Risk Score: ${r.riskScore !== undefined ? `${r.riskScore}/100 (${r.riskLevel || 'Unrated'} Risk)` : 'Not assessed'}
=====================================================

1. DOCUMENT SUMMARY
${r.summary}

Plain Language Explanation:
${r.plainLanguageExplanation}

-----------------------------------------------------
2. EXTRACTED FACTS (FROM TEXT)
Document Type: ${r.extractedFacts?.documentType}
Subject: ${r.extractedFacts?.subject}

Identified Parties:
${r.extractedFacts?.parties?.length ? r.extractedFacts.parties.map((p) => `- ${p.role}: ${p.name}`).join('\n') : 'Not available in supplied text'}

Important Dates & Deadlines:
${r.extractedFacts?.importantDates?.length ? r.extractedFacts.importantDates.map((d) => `- ${d.label}: ${d.dateOrPeriod}`).join('\n') : 'Not available in supplied text'}

Key Obligations:
${r.extractedFacts?.keyObligations?.length ? r.extractedFacts.keyObligations.map((o) => `- ${o}`).join('\n') : 'Not available in supplied text'}

-----------------------------------------------------
3. FLAGGED LEGAL ISSUES & RISKS (${r.flaggedClauses?.length || 0})
${r.flaggedClauses?.map((c, idx) => `
[Passage ${idx + 1}] ${c.clauseTitle}${c.severity ? ` (Severity: ${c.severity})` : ''}
Evidence: ${c.evidenceSnippet}
Issue: ${c.issue}
Suggested next step: ${c.recommendation}
`).join('\n') || 'No evidence-backed passage was retained; this does not establish that the document is safe.'}

-----------------------------------------------------
4. MISSING CLAUSES & SAFEGUARDS
${r.missingProtections?.length ? r.missingProtections.map((p) => `- ${p}`).join('\n') : 'Not available in supplied text'}

-----------------------------------------------------
5. RECOMMENDED NEXT STEPS
${r.recommendedNextSteps?.length ? r.recommendedNextSteps.map((s) => `- ${s}`).join('\n') : 'Not available'}

-----------------------------------------------------
6. OFFICIAL SOURCES & STATUTORY CITATIONS
${r.officialSources?.length ? r.officialSources.map((s) => `- ${s.title} (${s.statute}): ${s.relevance}\n  Link: ${s.url}`).join('\n\n') : 'Not available'}

-----------------------------------------------------
DISCLAIMER: This preliminary audit is for educational and legal risk awareness under Indian law. It does not replace registered advocate counsel.
`;
  };

  const handleCopyAnalysis = () => {
    const report = generateReportText();
    navigator.clipboard.writeText(report);
    setCopiedAnalysis(true);
    setTimeout(() => setCopiedAnalysis(false), 2000);
  };

  const handleDownloadAnalysis = () => {
    const report = generateReportText();
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Legal_Bot_Audit_${(documentName || 'Document').replace(/\.[^/.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>Document Upload & Legal Audit</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Upload PDF, DOCX, or TXT agreements to extract readable text, identify risks under Indian law, separate facts from legal interpretations, and connect with verified advocates.
          </p>
        </div>

        {/* Location badge in header */}
        <button
          onClick={() => setLocationModalOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 transition-colors shadow-2xs self-start sm:self-center"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Location: {userLocation.city}, {userLocation.state}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload & Input Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600" />
              <span>Upload Document (PDF, DOCX, TXT)</span>
            </h2>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-100 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={documentConsent}
                onChange={(e) => setDocumentConsent(e.target.checked)}
                className="mt-0.5 accent-blue-700"
              />
              <span>
                <strong>Required consent:</strong> I agree that document bytes or pasted text will be sent to the Legal Bot server for extraction and audit. If Gemini is configured, the text may also be sent to Gemini for analysis. Sharing an inquiry with an advocate is separate and requires its own consent.
              </span>
            </label>

            {/* Dropzone */}
            <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition-colors group">
              <FileText className="w-9 h-9 text-slate-400 group-hover:text-blue-600 transition-colors mb-2" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
                Click to browse or drop PDF, DOCX, or TXT file
              </span>
              <span className="text-[11px] text-slate-400 mt-1 text-center">
                Max 10MB · Searchable text
              </span>
              <input
                type="file"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileUpload}
                disabled={!documentConsent}
                className="hidden"
              />
            </label>

            {isExtracting && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Extracting readable text from document...</span>
              </div>
            )}

            {documentName && !isExtracting && (
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                <div className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">Active: {documentName}</span>
                </div>
                <button
                  onClick={() => {
                    setDocumentName('');
                    setDocumentText('');
                    setAnalysisResult(null);
                  }}
                  className="text-slate-400 hover:text-red-500 text-[11px] shrink-0 ml-2"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Paste Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Or Paste Agreement Text Directly
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {documentText.length.toLocaleString()} characters
                </span>
              </div>
              <textarea
                rows={8}
                value={documentText}
                onChange={(e) => setDocumentText(e.target.value)}
                disabled={!documentConsent}
                aria-label="Document text to analyze"
                className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 leading-relaxed"
              />
            </div>

            {/* Pre-loaded Sample Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 font-medium block mb-2">
                Try Pre-loaded Test Drafts:
              </span>
              <div className="flex flex-col gap-1.5">
                {sampleContracts.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDocumentName(s.name);
                      setDocumentText(s.text);
                      setErrorMsg(null);
                    }}
                    className="p-2 rounded-lg text-left text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                  >
                    <span className="font-medium truncate">{s.name}</span>
                    <span className="text-[10px] text-blue-600 uppercase font-semibold shrink-0 ml-2">Load</span>
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-xs text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Processing Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handleRunAudit}
              disabled={!documentConsent || isAnalyzing || isExtracting || !documentText.trim()}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 shadow-xs cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing Clauses under Indian Law...</span>
                </>
              ) : (
                <>
                  <Scale className="w-4 h-4" />
                  <span>Run Legal Risk Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Detailed Audit Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {analysisResult ? (
            <div className="space-y-6 animate-in fade-in">
              {(analysisNotice || analysisSource === 'statutory-engine' || analysisSource === 'local-rule-audit') && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  {analysisSource === 'statutory-engine' && (
                    <p className="font-semibold">Statutory-engine response: this is a deterministic fallback, not a Gemini-generated analysis.</p>
                  )}
                  {analysisNotice && <p>Analysis scope: {analysisNotice}</p>}
                </div>
              )}
              {/* Top Banner: Composite Risk Score + Quick Actions */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                      Detected Classification
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {analysisResult.documentType}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {analysisResult.subject}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-6 shrink-0">
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium">Composite Risk</div>
                      <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {analysisResult.riskScore ?? 'Not assessed'}
                        {analysisResult.riskScore !== undefined && (
                          <span className="text-xs font-normal text-slate-400"> / 100</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider ${
                        analysisResult.riskLevel === 'High'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200'
                          : analysisResult.riskLevel === 'Medium'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200'
                          : analysisResult.riskLevel === 'Low'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {analysisResult.riskLevel ? `${analysisResult.riskLevel} Risk` : 'Not assessed'}
                    </span>
                  </div>
                </div>

                {/* Toolbar: Copy Analysis, Download Analysis, and Lawyer Consult Button */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyAnalysis}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      {copiedAnalysis ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAnalysis ? 'Copied' : 'Copy Analysis'}</span>
                    </button>
                    <button
                      onClick={handleDownloadAnalysis}
                      className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report</span>
                    </button>
                  </div>

                  {/* Connect to Nearby Lawyer CTA */}
                  <button
                    onClick={() => setConsultModalOpen(true)}
                    disabled={!hasVerifiedLawyers}
                    title={hasVerifiedLawyers ? undefined : 'Consultations are unavailable until advocate profiles are verified'}
                    className="py-2 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs cursor-pointer ml-auto"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>{hasVerifiedLawyers ? 'Consult a Nearby Lawyer About This Document' : 'No verified advocate profiles available'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION 1: Document Summary & Plain-Language Explanation */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Document Summary & Citizen Plain-Language Guide
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Executive Summary:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysisResult.summary}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2 text-xs">
                  <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>What This Means For You (Simple Language):</span>
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysisResult.plainLanguageExplanation}
                  </p>
                </div>
              </div>

              {/* SECTION 2: EXTRACTED FACTS (Clearly distinguished from AI interpretations) */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Extracted Document Facts
                      </h3>
                      <p className="text-[11px] text-slate-400">
                      Details supplied by analysis; verify them against the original text. Unsupported details are marked not available.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Extracted Facts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Parties */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Identified Contracting Parties:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      {analysisResult.extractedFacts?.parties?.length ? analysisResult.extractedFacts.parties.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">• {p.role}:</span>
                          <span>{p.name}</span>
                        </li>
                      )) : <li>Not available in supplied text</li>}
                    </ul>
                  </div>

                  {/* Important Dates */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Important Dates & Timelines:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      {analysisResult.extractedFacts?.importantDates?.length ? analysisResult.extractedFacts.importantDates.map((d, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">• {d.label}:</span>
                          <span>{d.dateOrPeriod}</span>
                        </li>
                      )) : <li>Not available in supplied text</li>}
                    </ul>
                  </div>
                </div>

                {/* Key Obligations */}
                {analysisResult.extractedFacts?.keyObligations?.length ? (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Primary Contractual Obligations:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                      {analysisResult.extractedFacts.keyObligations.map((o, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-600">✓</span>
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    Key obligations: Not available in supplied text.
                  </div>
                )}
              </div>

              {/* SECTION 3: EVIDENCE-LINKED REVIEW PASSAGES */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Potential Passages for Review ({analysisResult.flaggedClauses?.length || 0})
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Each item must include an exact excerpt; legal effects and citations are not verified.
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                    Evidence-linked review
                  </span>
                </div>

                <div className="space-y-3">
                  {analysisResult.flaggedClauses?.length ? analysisResult.flaggedClauses.map((clause, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between font-bold text-red-900 dark:text-red-200">
                        <span>{clause.clauseTitle}</span>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-300 font-semibold">
                          {clause.severity ? `${clause.severity} Severity` : 'Needs review'}
                        </span>
                      </div>

                      <blockquote className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-slate-800 dark:text-slate-200 leading-relaxed">
                        <strong className="text-slate-700 dark:text-slate-300">Exact passage:</strong>{' '}
                        “{clause.evidenceSnippet}”
                      </blockquote>

                      <p className="text-red-900 dark:text-red-300 leading-relaxed">
                        <strong>Potential review point:</strong> {clause.issue}
                      </p>

                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-slate-800 dark:text-slate-200 leading-relaxed">
                        <strong className="text-blue-700 dark:text-blue-400">Suggested next step:</strong>{' '}
                        {clause.recommendation}
                      </div>

                      {clause.relevantLaw && (
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-blue-600" />
                          <span>Statutory Authority: {clause.relevantLaw}</span>
                        </div>
                      )}
                    </div>
                  )) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No evidence-backed passage was retained. This does not establish that the document is safe.
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 4: Missing Safeguards & Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Safeguards */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Missing Clauses & Safeguards</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {analysisResult.missingProtections?.length ? analysisResult.missingProtections.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{p}</span>
                      </li>
                    )) : <li>Not available in supplied text.</li>}
                  </ul>
                </div>

                {/* Recommended Next Steps */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Recommended Next Steps</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    {analysisResult.recommendedNextSteps?.length ? analysisResult.recommendedNextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    )) : <li>Not available.</li>}
                  </ul>
                </div>
              </div>

              {/* SECTION 5: Official Statutory Sources & India Code Links */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Official Sources & Statutory Links</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {analysisResult.officialSources?.length ? analysisResult.officialSources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 transition-colors block group"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                        <span>{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{src.statute}</div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {src.relevance}
                      </p>
                    </a>
                  )) : <p className="text-xs text-slate-500">Not available from this analysis.</p>}
                </div>
              </div>

              {/* Connect to Nearby Lawyer Banner (Bottom) */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <span className="text-blue-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Advocate Connection</span>
                  </span>
                  <h4 className="text-lg font-extrabold text-white mt-1">
                    Ready to resolve these flagged clauses?
                  </h4>
                  <p className="text-xs text-blue-100 max-w-xl mt-0.5 leading-relaxed">
                    {hasVerifiedLawyers
                      ? `Connect with verified advocates practicing in ${userLocation.city} who specialize in ${analysisResult.documentType}. Sharing this inquiry requires separate, explicit consent.`
                      : 'Private advocate profiles are hidden until their identities and contact details can be independently verified. Your document review will not be shared.'}
                  </p>
                </div>

                <button
                  onClick={() => setConsultModalOpen(true)}
                  disabled={!hasVerifiedLawyers}
                  title={hasVerifiedLawyers ? undefined : 'Consultations are unavailable until advocate profiles are verified'}
                  className="py-2.5 px-5 rounded-xl bg-white text-blue-950 font-bold text-xs hover:bg-blue-50 disabled:bg-slate-300 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors shadow-xs whitespace-nowrap self-start sm:self-center"
                >
                  {hasVerifiedLawyers ? 'Consult Nearby Advocate' : 'No verified profiles'}
                </button>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full min-h-[440px] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center bg-white/40 dark:bg-slate-900/40 space-y-3">
              <FileCheck className="w-14 h-14 text-slate-300 dark:text-slate-700" />
              <div className="max-w-md space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Comprehensive Legal Audit Ready
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Upload a PDF, DOCX, or TXT file or load a pre-loaded agreement on the left. The auditor will extract clauses, flag void terms under Indian statutes, separate facts from interpretations, and connect you with verified advocates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connect Lawyer Modal */}
      {analysisResult && hasVerifiedLawyers && (
        <DocumentLawyerConsultModal
          isOpen={consultModalOpen}
          onClose={() => setConsultModalOpen(false)}
          analysis={analysisResult}
          documentName={documentName || 'Document Audit'}
          userLocation={userLocation}
          onOpenLocationChange={() => setLocationModalOpen(true)}
        />
      )}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelected={(loc) => setUserLocation(loc)}
      />
    </div>
  );
}
