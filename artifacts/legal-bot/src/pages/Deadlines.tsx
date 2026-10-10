import { LIMITATION_DEADLINES } from '../data/rights';
import { Clock, AlertTriangle, Scale, Calendar } from 'lucide-react';

export function Deadlines() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Clock className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Statutory Limitation Deadlines & Timelines</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Crucial limitation periods under the Limitation Act 1963, Negotiable Instruments Act 1881, and Consumer Protection Act 2019. Missing a statutory deadline may bar your legal remedy forever.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LIMITATION_DEADLINES.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                {item.statute}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-mono">
                {item.limitationPeriod}
              </span>
            </div>

            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {item.matter}
            </h3>

            <div className="text-xs text-slate-600 dark:text-slate-400">
              <strong>Starting Point of Time: </strong> {item.startingPoint}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
              Statutory Provision: {item.provision}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Important Rule of Law:</strong> Under Section 3 of the Limitation Act, every suit instituted, appeal preferred, and application made after the prescribed period shall be dismissed, even though limitation has not been set up as a defense. While Section 5 allows condonation of delay in appeals and applications for sufficient cause, it does NOT apply to original civil suits.
        </span>
      </div>
    </div>
  );
}
