import { EMERGENCY_CONTACTS } from '../data/rights';
import { PhoneCall, ShieldAlert, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

export function Emergency() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>National 24x7 Emergency Services</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Emergency Legal & Distress Helplines
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Toll-free, government-operated emergency numbers available 24 hours a day across all States and Union Territories of India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {EMERGENCY_CONTACTS.map((contact) => (
          <div
            key={contact.id}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {contact.category}
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{contact.availableHours}</span>
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {contact.service}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {contact.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-2xl font-black text-red-600 dark:text-red-400 font-mono tracking-tight">
                {contact.number}
              </div>
              <a
                href={`tel:${contact.number}`}
                className="py-2 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call {contact.number}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-xl bg-slate-900 text-slate-300 text-xs space-y-2 border border-slate-800">
        <h3 className="font-bold text-white text-sm">Online Incident Portals</h3>
        <p className="text-slate-400">
          In addition to dial-in phone hotlines, complaints can be registered online through verified Government of India portals:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-between transition-colors"
          >
            <span>National Cyber Crime Portal</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center justify-between transition-colors"
          >
            <span>NALSA Free Legal Services</span>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
