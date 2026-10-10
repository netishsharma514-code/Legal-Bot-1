import { BookOpen, ShieldCheck, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export function Evidence() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Electronic Evidence & Bharatiya Sakshya Adhiniyam</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Admissibility standards for WhatsApp chats, emails, CDRs, and CCTV recordings under Section 63 BSA 2023 (formerly Section 65B Indian Evidence Act 1872).
        </p>
      </div>

      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Why Does Electronic Evidence Require a Statutory Certificate?
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Because digital files can be easily doctored, edited, or deleted, Indian courts require secondary electronic records (printouts, CDs, hard drives, USB drives) to be accompanied by a mandatory certificate at the time of filing evidence. In <em>Arjun Panditrao Khotkar (2020)</em>, the Supreme Court held that production of a certificate under Section 65B (now Section 63 BSA) is a condition precedent to the admissibility of electronic evidence.
        </p>

        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 space-y-2">
          <div className="font-bold">What Must the Section 63 BSA Certificate State?</div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
            <li>Identification of the electronic record containing the statement (e.g. printout of WhatsApp chats).</li>
            <li>Description of the computer device (phone, server, laptop) producing the electronic record.</li>
            <li>Confirmation that the computer was operating properly during the period the records were generated.</li>
            <li>Signed by a person occupying a responsible official position in relation to the device or management of activities.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp & SMS Chats</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Export chat history with full timestamps and sender phone numbers. Take screenshots showing profile information and mobile number, not merely display names.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Audio & Voice Recordings</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Preserve original handset device. Provide a certified transcript of the audio recording highlighting the exact conversation along with the Section 63 BSA certificate.
          </p>
        </div>
      </div>
    </div>
  );
}
