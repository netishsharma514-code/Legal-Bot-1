import { Scale, ShieldCheck, HeartHandshake, BookOpen } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>About Legal Bot (Nyaya Sahayak)</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Bridging the legal literacy divide across India through accessible technology and statutory transparency.
        </p>
      </div>

      <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Our Mission</h2>
        <p>
          In a country of over 1.4 billion citizens, navigating penal statutes, court jurisdictions, and police procedures can be overwhelming. <strong>Legal Bot (Nyaya Sahayak)</strong> was engineered to empower common citizens, small businesses, and law students with instantaneous statutory cross-references, citizen rights awareness, and initial guidance.
        </p>
        <p>
          With the historic replacement of the Indian Penal Code 1860 by the <strong>Bharatiya Nyaya Sanhita (BNS 2023)</strong>, the CrPC by the <strong>BNSS</strong>, and the Evidence Act by the <strong>BSA</strong>, millions of citizens and practitioners need clear cross-referencing between old and new section numbers. Legal Bot bridges this transition.
        </p>

        <h3 className="text-base font-bold text-slate-900 dark:text-white pt-2">Key Principles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Statutory Accuracy</div>
            <div className="text-xs text-slate-500">Every response is grounded in codified Indian Acts and High Court/Supreme Court precedents.</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <HeartHandshake className="w-5 h-5 text-emerald-600" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Citizen Privacy</div>
            <div className="text-xs text-slate-500">Dual-mode architecture preserves privacy, running seamlessly with or without cloud storage.</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <div className="font-bold text-slate-900 dark:text-white text-xs">Free Legal Aid Advocacy</div>
            <div className="text-xs text-slate-500">Actively promotes NALSA free legal aid and 24x7 emergency toll-free helplines.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
