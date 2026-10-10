import { useState } from 'react';
import { 
  Scale, 
  Search, 
  Bot, 
  FileText, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  PhoneCall, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle,
  Landmark,
  FileCheck
} from 'lucide-react';
import { ACTS } from '../data/acts';
import { SECTIONS } from '../data/sections';
import { CITIZEN_RIGHTS } from '../data/rights';

interface HomeProps {
  onNavigateTab: (tab: string, filterSection?: string) => void;
}

export function Home({ onNavigateTab }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateTab('assistant');
    }
  };

  const featureCards = [
    {
      tab: 'assistant',
      icon: Bot,
      title: 'AI Legal Assistant',
      desc: 'Ask complex legal questions in plain language and receive statutory guidance cross-referenced with BNS and IPC.',
      color: 'bg-blue-600',
    },
    {
      tab: 'upload',
      icon: FileCheck,
      title: 'Contract & Document Audit',
      desc: 'Upload rental agreements, employment contracts, and NDAs to identify ambiguous clauses and legal risks.',
      color: 'bg-emerald-600',
    },
    {
      tab: 'acts',
      icon: BookOpen,
      title: 'Statutory Database',
      desc: 'Explore the complete Bharatiya Nyaya Sanhita (BNS 2023), BNSS, BSA, IT Act, and Negotiable Instruments Act.',
      color: 'bg-indigo-600',
    },
    {
      tab: 'lawyers',
      icon: Users,
      title: 'Verified Advocate Directory',
      desc: 'Connect with advocates registered with State Bar Councils across Delhi, Mumbai, Bengaluru, and Chennai.',
      color: 'bg-purple-600',
    },
    {
      tab: 'rights',
      icon: ShieldCheck,
      title: 'Citizen Rights & Protections',
      desc: 'Understand your constitutional protections during police interrogation, arrest, and consumer disputes.',
      color: 'bg-amber-600',
    },
    {
      tab: 'documents',
      icon: FileText,
      title: 'Standard Legal Drafts',
      desc: 'Access verified draft templates for Rental Agreements, Mutual NDAs, Cheque Bounce Notices, and GPAs.',
      color: 'bg-rose-600',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white p-8 sm:p-12 overflow-hidden border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
        
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800 text-blue-300 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5 text-blue-400" />
            <span>Legal_Bot</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Accessible Legal Intelligence for Every Indian Citizen
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Navigate the Indian legal framework with statutory citations, procedural bail guidelines, AI contract risk assessment, and verified advocate consultations.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-2xl pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask a legal query (e.g. cheque bounce 138, anticipatory bail, cyber fraud)..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-2"
            >
              <span>Consult AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Tag Links */}
          <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-300">Trending Topics:</span>
            <button onClick={() => onNavigateTab('assistant')} className="hover:text-blue-400 underline">Section 138 Cheque Bounce</button>
            <span>·</span>
            <button onClick={() => onNavigateTab('acts')} className="hover:text-blue-400 underline">BNS vs IPC Section Converter</button>
            <span>·</span>
            <button onClick={() => onNavigateTab('rights')} className="hover:text-blue-400 underline">FIR & Arrest Rights</button>
            <span>·</span>
            <button onClick={() => onNavigateTab('cyber')} className="hover:text-blue-400 underline">Cyber Helpline 1930</button>
          </div>
        </div>
      </section>

      {/* Core Feature Matrix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Legal Capabilities & Tools
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive modules built specifically for the Indian judicial and statutory landscape.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigateTab(feat.tab)}
                className="group p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col"
              >
                <div className={`w-10 h-10 rounded-lg ${feat.color} text-white flex items-center justify-center mb-4 shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>{feat.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-2 flex-1">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Emergency & Citizen Safeguards Strip */}
      <section className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                Facing an Urgent Legal Crisis or Arbitrary Detention?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Every citizen has the right to free state defense counsel under Article 39A and Section 341 BNSS (Section 304 CrPC).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('legal-aid')}
              className="py-2 px-4 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
            >
              Free Legal Aid (NALSA)
            </button>
            <button
              onClick={() => onNavigateTab('emergency')}
              className="py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
            >
              Emergency Contacts
            </button>
          </div>
        </div>
      </section>

      {/* Stat Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-200 dark:border-slate-800 text-center">
        <div>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">358+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">BNS 2023 Penal Sections</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">531+</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">BNSS Procedural Articles</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">24x7</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Helpline Verification</div>
        </div>
        <div>
          <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">100%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Free Citizen Access</div>
        </div>
      </section>
    </div>
  );
}
