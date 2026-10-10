import { AlertTriangle, ShieldCheck, Scale } from 'lucide-react';

export function Disclaimer() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          <span>Statutory Legal Disclaimer</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Important terms regarding legal advice, advocate-client relationship, and courtroom litigation representation.
        </p>
      </div>

      <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 font-medium">
          <strong>Non-Attorney Privilege Notice:</strong> Legal Bot is an artificial intelligence-assisted legal awareness platform and statutory information index. It does NOT constitute a law firm and does NOT provide formal legal advice, representation, or advocate-client privilege.
        </div>

        <h3 className="font-bold text-slate-900 dark:text-white text-base">1. Informational Awareness Only</h3>
        <p className="text-xs">
          All statutory summaries, section analyses, penalty details, and contract audit observations provided by Legal Bot are generated strictly for academic, informational, and preliminary awareness purposes under Indian law. The information may not reflect the very latest judicial amendments, state-level rule modifications, or local court notifications.
        </p>

        <h3 className="font-bold text-slate-900 dark:text-white text-base">2. No Advocate-Client Relationship</h3>
        <p className="text-xs">
          Your interaction with this platform, including asking queries to the AI Assistant or analyzing uploaded document drafts, does not create an advocate-client relationship under the Advocates Act, 1961 or the Bar Council of India Rules.
        </p>

        <h3 className="font-bold text-slate-900 dark:text-white text-base">3. Courtroom Litigation Representation</h3>
        <p className="text-xs">
          For formal legal opinions, filing criminal complaints, regular or anticipatory bail applications before the Sessions Court or High Court, drafting civil suits, or defending matrimonial matters, you must consult an advocate enrolled with the Bar Council of your respective State.
        </p>

        <h3 className="font-bold text-slate-900 dark:text-white text-base">4. Free State Counsel Right</h3>
        <p className="text-xs">
          If you are unable to afford private legal counsel, you are constitutionally entitled to free defense counsel provided by the State through the <strong>National Legal Services Authority (NALSA)</strong> and District Legal Services Authorities (DLSA) under Article 39A of the Constitution of India.
        </p>
      </div>
    </div>
  );
}
