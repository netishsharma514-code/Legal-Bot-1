import { useState } from 'react';
import { CONSTITUTION_ARTICLES, PRECEDENTS } from '../data/constitution';
import { Landmark, BookOpen, Scale, Award, Search } from 'lucide-react';

export function Constitution() {
  const [activeTab, setActiveTab] = useState<'articles' | 'precedents'>('articles');
  const [search, setSearch] = useState('');

  const filteredArticles = CONSTITUTION_ARTICLES.filter(
    (a) =>
      a.article.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
  );

  const filteredPrecedents = PRECEDENTS.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.constitutionalIssue.toLowerCase().includes(search.toLowerCase()) ||
      p.keyRatio.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Landmark className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Constitution of India & Landmark Precedents</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Core constitutional articles safeguarding fundamental liberties, equality, writ jurisdiction, and Supreme Court constitutional bench rulings.
        </p>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('articles')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'articles'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Fundamental Rights & Articles
          </button>
          <button
            onClick={() => setActiveTab('precedents')}
            className={`py-2 px-4 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'precedents'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Landmark Precedents
          </button>
        </div>

        <div className="relative sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search constitutional articles and precedents"
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {activeTab === 'articles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.article}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div>
                <div className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  {art.part}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {art.article}: {art.title}
                </h3>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {art.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                  Core Jurisprudential Principles:
                </h4>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {art.keyPrinciples.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Cited in Landmark Cases: </span>
                <span className="text-slate-500 italic">{art.landmarkCases.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrecedents.map((prec) => (
            <div
              key={prec.id}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {prec.title}
                  </h3>
                  <div className="text-xs font-mono text-blue-700 dark:text-blue-400 mt-0.5">
                    {prec.citation} · Year {prec.year}
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Bench: {prec.bench}
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Ratio Decidendi:</div>
                <p className="text-slate-600 dark:text-slate-300">{prec.keyRatio}</p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <strong>Enduring Impact:</strong> {prec.impact}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
