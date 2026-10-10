import { ShieldAlert, PhoneCall, AlertTriangle, CheckCircle, ExternalLink, Lock } from 'lucide-react';

export function Cyber() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldAlert className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Cyber Crime & Digital Safety Guide</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Indian legal recourse against online financial scams, identity theft, unauthorized UPI transactions, and cyber stalking under the IT Act 2000.
        </p>
      </div>

      {/* Golden Hour Action Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-4 border border-blue-800 shadow-lg">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>The Critical Golden Hour Rule</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white">
          Victim of an Online Financial Scam or Unauthorized Debit?
        </h2>
        <p className="text-sm text-blue-100 leading-relaxed">
          Reporting to the National Cyber Financial Fraud Helpline within the first 2 hours allows cyber law enforcement to place an immediate electronic lien/freeze on the beneficiary bank accounts before fraudsters withdraw funds at ATMs.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <a
            href="tel:1930"
            className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Cyber Helpline 1930</span>
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 border border-blue-700"
          >
            <span>File on cybercrime.gov.in</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Step by step checklist */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Immediate 5-Step Action Protocol
        </h3>
        <ol className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">1</span>
            <div>
              <strong>Call 1930 Helpline:</strong> Provide your bank account number, victim phone number, and beneficiary transaction UTR/reference number.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">2</span>
            <div>
              <strong>Block Compromised Cards & SIM:</strong> Immediately contact your bank branch and mobile telecom operator to freeze SIM and Netbanking access.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">3</span>
            <div>
              <strong>Preserve Digital Evidence:</strong> Screenshot bank debit SMS, transaction IDs, WhatsApp messages, APK links, and phone numbers without modifying them.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">4</span>
            <div>
              <strong>File Formal Cyber Complaint:</strong> Submit an incident report on cybercrime.gov.in and download the acknowledgment PDF with NCRB tracking token.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0">5</span>
            <div>
              <strong>Bank Zero Liability Claim:</strong> Under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18, customers have zero liability for unauthorized third-party transactions when reported within 3 working days.
            </div>
          </li>
        </ol>
      </div>

      {/* Offence Matrix under IT Act */}
      <div className="space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Relevant Sections under Information Technology Act, 2000
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-400">Section 66C IT Act — Identity Theft</div>
            <p className="text-slate-600 dark:text-slate-400">Punishes unauthorized use of electronic signatures, passwords, or biometric authentication with imprisonment up to 3 years and fine up to ₹1 Lakh.</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-400">Section 66D IT Act — Cheating by Personation</div>
            <p className="text-slate-600 dark:text-slate-400">Covers phishing, fake bank official impersonation, and fraudulent social media lottery calls. Punishable with up to 3 years imprisonment.</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-400">Section 66E IT Act — Violation of Privacy</div>
            <p className="text-slate-600 dark:text-slate-400">Capturing, publishing or transmitting images of private area of any person without consent. Punishable with imprisonment up to 3 years.</p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-400">Section 78 IT Act — Investigation Powers</div>
            <p className="text-slate-600 dark:text-slate-400">Empowers police officers of the rank of Inspector and above to investigate cyber offences with digital forensics.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
