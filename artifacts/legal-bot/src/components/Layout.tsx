import { useState, useEffect } from 'react';
import { LegalBotAuthPanel } from './LegalBotAuthPanel';
import { LocationSelectorModal } from './LocationSelectorModal';
import { supabase } from '../lib/supabase';
import { getStoredLocation, UserLocationState } from '../data/location';
import { 
  Scale, 
  Menu, 
  X, 
  PhoneCall, 
  User, 
  FileText, 
  BookOpen, 
  Users, 
  UploadCloud, 
  Landmark, 
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  MapPin
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onBack?: () => void;
}

export function Layout({ children, activeTab, onTabChange, onBack }: LayoutProps) {
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<UserLocationState>(getStoredLocation());

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    const handleLocationChange = (e: Event) => {
      const customEvt = e as CustomEvent<UserLocationState>;
      if (customEvt.detail) {
        setUserLocation(customEvt.detail);
      }
    };
    window.addEventListener('legalbot-location-changed', handleLocationChange);

    return () => {
      authListener?.subscription?.unsubscribe();
      window.removeEventListener('legalbot-location-changed', handleLocationChange);
    };
  }, []);


  const navLinks = [
    { id: 'assistant', label: 'AI Assistant' },
    { id: 'acts', label: 'Statutes & Sections' },
    { id: 'lawyers', label: 'Advocates' },
    { id: 'upload', label: 'Doc Audit' },
    { id: 'rights', label: 'Citizen Rights' },
    { id: 'constitution', label: 'Constitution' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased">
      {/* 1. Universal Top Bar Contract: [Brand / Back] — [4-5 Nav Links] — [Location + Primary Action] */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Back Navigation + Brand Wordmark */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {activeTab !== 'home' && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-2xs group cursor-pointer"
                title="Go back to previous page"
                aria-label="Back to previous page"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 transition-transform group-hover:-translate-x-0.5" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              onClick={() => { onTabChange('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2.5 text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md py-1"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center shadow-xs">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
                Legal Bot
              </span>
            </button>
          </div>

          {/* Zone 2: 4-6 concise single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors py-1 hover:text-slate-900 dark:hover:text-white relative ${
                    isActive ? 'text-blue-700 dark:text-blue-400 font-semibold' : ''
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-5 left-0 right-0 h-0.5 bg-blue-700 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Location Selector + 1 Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Location selector trigger */}
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs group cursor-pointer"
              title="Change your Indian location for nearby advocates and legal aid"
              aria-label={`Current location: ${userLocation.city}, ${userLocation.state}. Click to change.`}
            >
              <MapPin className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
              <span className="max-w-[85px] sm:max-w-[130px] truncate">{userLocation.city}</span>
            </button>

            <button
              onClick={() => setAuthOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors shadow-xs whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>{currentUser ? currentUser.user_metadata?.full_name || 'My Account' : 'Sign In'}</span>
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 rounded-lg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Operational Utility Ribbon (Emergency Helplines) */}
      <aside aria-label="National Emergency Helplines" className="bg-slate-900 text-slate-300 text-xs border-b border-slate-800 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-white tracking-wide">National 24x7 Helplines:</span>
            <div className="flex items-center gap-2 flex-wrap text-slate-300">
              <span>Emergency <strong>112</strong></span>
              <span aria-hidden="true">·</span>
              <span>Cyber Fraud <strong>1930</strong></span>
              <span aria-hidden="true">·</span>
              <span>Women Helpline <strong>1090</strong></span>
              <span aria-hidden="true">·</span>
              <span>Childline <strong>1098</strong></span>
              <span aria-hidden="true">·</span>
              <span>NALSA Legal Aid <strong>15100</strong></span>
            </div>
          </div>
          <button
            onClick={() => onTabChange('emergency')}
            className="text-amber-400 hover:text-amber-300 underline font-medium text-xs whitespace-nowrap ml-auto"
          >
            Emergency Directory
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in fade-in duration-150">
          {/* Mobile Location bar */}
          <button
            type="button"
            onClick={() => { setLocationModalOpen(true); setMobileMenuOpen(false); }}
            className="w-full p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>Location: <strong>{userLocation.city}, {userLocation.state}</strong></span>
            </div>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 underline">Change</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            {navLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => { onTabChange(item.id); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <button onClick={() => { onTabChange('documents'); setMobileMenuOpen(false); }} className="p-2 text-left hover:text-blue-600">Standard Drafts</button>
            <button onClick={() => { onTabChange('precedents'); setMobileMenuOpen(false); }} className="p-2 text-left hover:text-blue-600">Landmark Judgments</button>
            <button onClick={() => { onTabChange('procedure'); setMobileMenuOpen(false); }} className="p-2 text-left hover:text-blue-600">Court Procedures</button>
            <button onClick={() => { onTabChange('legal-aid'); setMobileMenuOpen(false); }} className="p-2 text-left hover:text-blue-600">Free Legal Aid</button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
              className="w-full py-2.5 rounded-lg bg-blue-700 text-white font-medium text-sm text-center flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{currentUser ? currentUser.user_metadata?.full_name || 'My Account' : 'Sign In / Register'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Institutional Legal Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded bg-blue-700 text-white flex items-center justify-center">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white text-base">Legal Bot</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                AI-assisted legal awareness platform for Indian citizens, advocates, and students. Grounded in the Bharatiya Nyaya Sanhita, BNSS, and Indian statutory jurisprudence.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs tracking-wider uppercase">
                Core Modules
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => onTabChange('assistant')} className="hover:text-blue-600 dark:hover:text-blue-400">AI Legal Q&A Assistant</button></li>
                <li><button onClick={() => onTabChange('acts')} className="hover:text-blue-600 dark:hover:text-blue-400">BNS & IPC Section Database</button></li>
                <li><button onClick={() => onTabChange('upload')} className="hover:text-blue-600 dark:hover:text-blue-400">Contract & Document Audit</button></li>
                <li><button onClick={() => onTabChange('lawyers')} className="hover:text-blue-600 dark:hover:text-blue-400">Verified Advocates Directory</button></li>
                <li><button onClick={() => onTabChange('documents')} className="hover:text-blue-600 dark:hover:text-blue-400">Standard Legal Drafts Library</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs tracking-wider uppercase">
                Citizen Rights & Procedures
              </h4>
              <ul className="space-y-2">
                <li><button onClick={() => onTabChange('rights')} className="hover:text-blue-600 dark:hover:text-blue-400">Arrest & FIR Safeguards</button></li>
                <li><button onClick={() => onTabChange('constitution')} className="hover:text-blue-600 dark:hover:text-blue-400">Constitution of India Articles</button></li>
                <li><button onClick={() => onTabChange('cyber')} className="hover:text-blue-600 dark:hover:text-blue-400">Cyber Crime & IT Act Guide</button></li>
                <li><button onClick={() => onTabChange('precedents')} className="hover:text-blue-600 dark:hover:text-blue-400">Supreme Court Precedents</button></li>
                <li><button onClick={() => onTabChange('deadlines')} className="hover:text-blue-600 dark:hover:text-blue-400">Limitation Act Deadlines</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3 text-xs tracking-wider uppercase">
                Official Indian Portals
              </h4>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.indiacode.nic.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <span>India Code (Statutes)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://main.sci.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <span>Supreme Court of India</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://ecourts.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <span>eCourts Services Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <span>National Cyber Crime Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <a href="https://nalsa.gov.in" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400">
                    <span>NALSA Legal Services</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center sm:flex sm:justify-between sm:text-left text-slate-500 dark:text-slate-400 space-y-2 sm:space-y-0">
            <div>
              © 2026 Legal Bot (Nyaya Sahayak). All rights reserved.
            </div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => onTabChange('disclaimer')} className="hover:underline">Legal Disclaimer</button>
              <button onClick={() => onTabChange('about')} className="hover:underline">About Project</button>
              <button onClick={() => onTabChange('emergency')} className="hover:underline">Emergency Helpline 112</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <LegalBotAuthPanel
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onAuthSuccess={() => {}}
      />

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelected={(loc) => setUserLocation(loc)}
      />
    </div>
  );
}
