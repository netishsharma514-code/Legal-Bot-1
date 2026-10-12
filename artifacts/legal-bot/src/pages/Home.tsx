import { useState } from 'react';
import { 
  Search, 
  Bot, 
  FileText, 
  Users, 
  BookOpen, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface HomeProps {
  onNavigateTab: (tab: string, filterSection?: string) => void;
  onAskQuestion: (query: string) => void;
}

export function Home({ onNavigateTab, onAskQuestion }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAskQuestion(searchQuery.trim());
    }
  };

  const featureCards = [
    {
      tab: 'assistant',
      icon: Bot,
      title: 'AI Legal Assistant',
      desc: 'Ask complex legal questions in plain language and receive statutory guidance cross-referenced with BNS and IPC.',
      color: 'bg-[#e6ece7]',
    },
    {
      tab: 'upload',
      icon: FileCheck,
      title: 'Contract & Document Audit',
      desc: 'Upload rental agreements, employment contracts, and NDAs to identify ambiguous clauses and legal risks.',
      color: 'bg-[#e6ece7]',
    },
    {
      tab: 'acts',
      icon: BookOpen,
      title: 'Statutory Database',
      desc: 'Explore the complete Bharatiya Nyaya Sanhita (BNS 2023), BNSS, BSA, IT Act, and Negotiable Instruments Act.',
      color: 'bg-[#e6ece7]',
    },
    {
      tab: 'lawyers',
      icon: Users,
      title: 'Verified Advocate Directory',
      desc: 'Connect with advocates registered with State Bar Councils across Delhi, Mumbai, Bengaluru, and Chennai.',
      color: 'bg-[#e6ece7]',
    },
    {
      tab: 'rights',
      icon: ShieldCheck,
      title: 'Citizen Rights & Protections',
      desc: 'Understand your constitutional protections during police interrogation, arrest, and consumer disputes.',
      color: 'bg-[#e6ece7]',
    },
    {
      tab: 'documents',
      icon: FileText,
      title: 'Standard Legal Drafts',
      desc: 'Access verified draft templates for Rental Agreements, Mutual NDAs, Cheque Bounce Notices, and GPAs.',
      color: 'bg-[#e6ece7]',
    },
  ];

  return (
    <div className="home-page space-y-12">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <p className="home-eyebrow">LEGAL INFORMATION · INDIA</p>
          <h1>The law, made easier to understand.</h1>
          <p className="home-hero-copy">
            Clear starting points for Indian law. Explore statutes, understand
            your rights, and find practical next steps.
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="home-search">
            <div className="home-search-field">
              <Search className="w-4 h-4" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search a legal question or topic"
              />
            </div>
            <button type="submit" className="home-search-button">
              <span>Ask a question</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Tag Links */}
          <div className="home-topics">
            <span>Popular:</span>
            <button onClick={() => onNavigateTab('assistant')}>Cheque bounce</button>
            <button onClick={() => onNavigateTab('acts')}>BNS & IPC</button>
            <button onClick={() => onNavigateTab('rights')}>Arrest rights</button>
            <button onClick={() => onNavigateTab('cyber')}>Cyber fraud</button>
          </div>
        </div>
        <aside className="home-hero-note">
          <span>START HERE</span>
          <p>Good legal decisions begin with reliable information.</p>
          <button type="button" onClick={() => onNavigateTab('rights')}>
            Know your rights <ArrowRight aria-hidden="true" />
          </button>
        </aside>
      </section>

      {/* Core Feature Matrix */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Find the right place to start
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Practical guides and tools for common legal questions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feat) => {
            const Icon = feat.icon;
            return (
              <button
                type="button"
                key={feat.tab}
                onClick={() => onNavigateTab(feat.tab)}
                className="home-tool-card group p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col text-left"
              >
                <div className={`home-tool-icon w-10 h-10 rounded-lg ${feat.color} flex items-center justify-center mb-4 shadow-xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
                  <span>{feat.title}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 mt-2 flex-1">
                  {feat.desc}
                </p>
              </button>
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
