import { Scale, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export function Procedure() {
  const steps = [
    {
      title: 'Stage 1: Registration of First Information Report (FIR)',
      law: 'Section 173 BNSS (Section 154 CrPC)',
      desc: 'Mandatory registration for cognizable offences. Free copy must be provided to the informant immediately. Zero FIR must be registered if crime occurred outside jurisdiction.',
    },
    {
      title: 'Stage 2: Investigation & Evidence Collection',
      law: 'Section 176 BNSS (Section 156-173 CrPC)',
      desc: 'Police officer collects witness statements under Section 180 BNSS (161 CrPC), seizes material objects, and must conduct videography of search and seizure under new BNSS provisions.',
    },
    {
      title: 'Stage 3: Bail Application (Regular / Anticipatory)',
      law: 'Section 480 & 482 BNSS (Section 437 & 438 CrPC)',
      desc: 'Bailable offences: bail is a statutory right. Non-bailable offences: court exercises discretion considering gravity, flight risk, and evidence tampering possibilities.',
    },
    {
      title: 'Stage 4: Police Final Report / Charge-Sheet',
      law: 'Section 193 BNSS (Section 173(2) CrPC)',
      desc: 'Mandatory completion within 60 or 90 days. If police fail to file charge-sheet within this statutory deadline, accused is entitled to Default Bail under Section 187 BNSS (167(2) CrPC).',
    },
    {
      title: 'Stage 5: Framing of Charges & Plea',
      law: 'Sections 251-260 BNSS (CrPC Chapters XVIII & XIX)',
      desc: 'Magistrate or Sessions Judge examines records. If prima facie grounds exist, formal charges are read over and explained to the accused.',
    },
    {
      title: 'Stage 6: Prosecution & Defense Evidence',
      law: 'Bharatiya Sakshya Adhiniyam, 2023',
      desc: 'Prosecution witnesses examined (Examination-in-chief) and cross-examined by defense counsel. Accused statement recorded under Section 351 BNSS (313 CrPC).',
    },
    {
      title: 'Stage 7: Final Arguments & Judgment',
      law: 'Section 392 BNSS (Section 353 CrPC)',
      desc: 'Counsel argue legal propositions and factual contradictions. Court pronounces judgment of conviction or acquittal in open court.',
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Criminal Trial Procedure in India</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Chronological breakdown of the criminal justice process under the Bharatiya Nagarik Suraksha Sanhita (BNSS 2023).
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-4"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center shrink-0 text-sm">
              {idx + 1}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400">
                  {step.law}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
