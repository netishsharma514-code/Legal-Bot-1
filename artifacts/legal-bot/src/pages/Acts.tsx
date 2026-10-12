import { useState } from 'react';
import { ACTS } from '../data/acts';
import { SECTIONS } from '../data/sections';
import { Search, BookOpen, Scale, ArrowRight, ShieldCheck, Filter } from 'lucide-react';

interface ActsProps {
  initialSectionId?: string;
}

export function Acts({ initialSectionId }: ActsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedActId, setSelectedActId] = useState<string>('all');

  const categories = ['All', 'Criminal', 'Commercial', 'Cyber', 'Family', 'Labour', 'Civil', 'Constitutional'];

  const filteredActs = ACTS.filter((act) => {
    const matchesCat = selectedCategory === 'All' || act.category === selectedCategory;
    const matchesSearch =
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.keyTopics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const filteredSections = SECTIONS.filter((section) => {
    const matchesAct =
      selectedActId === 'all' ||
      (selectedActId === 'bns-2023' && section.act.includes('BNS')) ||
      (selectedActId === 'bnss-2023' && section.act.includes('BNSS')) ||
      (selectedActId === 'it-act-2000' && section.act.includes('Information Technology')) ||
      (selectedActId === 'ni-act-1881' && section.act.includes('Negotiable Instruments'));

    const matchesSearch =
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (section.ipcNumber && section.ipcNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      section.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAct && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Statutes & Section Database</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Search codified Indian penal and civil laws with cross-references between the new criminal codes (BNS, BNSS, BSA 2023) and previous laws (IPC, CrPC, Evidence Act).
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search acts and statutory sections"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Statutes Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Codified Indian Acts ({filteredActs.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActs.map((act) => {
            const isSelected = selectedActId === act.id;
            return (
              <div
                key={act.id}
                onClick={() => setSelectedActId(isSelected ? 'all' : act.id)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-600'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    {act.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Year {act.year}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {act.shortName}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1.5">
                  {act.description}
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{act.totalSections} Total Sections</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {isSelected ? 'Viewing Sections' : 'Filter Sections'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual Statutory Sections Explorer */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Indexed Statutory Sections ({filteredSections.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing statutory details, bail classifications, and punishments.
            </p>
          </div>
          {selectedActId !== 'all' && (
            <button
              onClick={() => setSelectedActId('all')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Show all statutes
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                      {sec.act} Sec {sec.number}
                    </span>
                    {sec.ipcNumber && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        IPC {sec.ipcNumber}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-1">
                    {sec.title}
                  </h3>
                </div>
              </div>

              {/* Classifications Badges */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    sec.cognizable
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
                >
                  {sec.cognizable ? 'Cognizable' : 'Non-Cognizable'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    sec.bailable
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {sec.bailable ? 'Bailable' : 'Non-Bailable'}
                </span>
                {sec.triableBy && (
                  <span className="text-slate-500 dark:text-slate-400">
                    Triable by: {sec.triableBy}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {sec.description}
              </p>

              {sec.penalty && (
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Prescribed Punishment: </span>
                  <span className="text-slate-900 dark:text-white font-medium">{sec.penalty}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
