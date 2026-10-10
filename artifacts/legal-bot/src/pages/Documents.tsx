import { useState } from 'react';
import { DOCUMENT_TEMPLATES } from '../data/documents';
import { DocumentTemplate } from '../data/types';
import { FileText, Copy, Check, Download, BookOpen, AlertCircle } from 'lucide-react';

export function Documents() {
  const [selectedDoc, setSelectedDoc] = useState<DocumentTemplate>(DOCUMENT_TEMPLATES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedDoc.sampleDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([selectedDoc.sampleDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDoc.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Standard Legal Drafts & Formats</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Verified Indian contract templates, statutory demand notices, and lease formats compliant with the Indian Contract Act 1872 and Negotiable Instruments Act 1881.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Selector Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Available Templates
          </h2>
          <div className="space-y-2">
            {DOCUMENT_TEMPLATES.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider block mb-1">
                    {doc.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {doc.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Document Details & Draft Preview */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase">
                  {selectedDoc.category}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedDoc.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Draft' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="py-1.5 px-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            {/* Required Checklist & Essential Clauses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white">Required Details:</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {selectedDoc.requiredFields.map((field, idx) => (
                    <li key={idx}>{field}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white">Key Statutory Safeguards:</h4>
                <ul className="space-y-1 text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {selectedDoc.keyClauses.map((clause, idx) => (
                    <li key={idx}>{clause}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Raw Text Preview */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Full Draft Text Format
                </h4>
                <span className="text-[11px] text-slate-400">Ready to fill bracketed fields [ ]</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[460px] border border-slate-800">
                {selectedDoc.sampleDraft}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
