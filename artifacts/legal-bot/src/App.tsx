import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Assistant } from './pages/Assistant';
import { Acts } from './pages/Acts';
import { Upload } from './pages/Upload';
import { Lawyers } from './pages/Lawyers';
import { JoinLawyer } from './pages/JoinLawyer';
import { Documents } from './pages/Documents';
import { Constitution } from './pages/Constitution';
import { Rights } from './pages/Rights';
import { Emergency } from './pages/Emergency';
import { Cyber } from './pages/Cyber';
import { LegalAid } from './pages/LegalAid';
import { Deadlines } from './pages/Deadlines';
import { Procedure } from './pages/Procedure';
import { Evidence } from './pages/Evidence';
import { About } from './pages/About';
import { Disclaimer } from './pages/Disclaimer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      if (hash) return hash;
    }
    return 'home';
  });
  const [historyStack, setHistoryStack] = useState<string[]>(['home']);
  const [selectedSectionId, setSelectedSectionId] = useState<string | undefined>();

  // Synchronize browser native Back and Forward buttons
  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      if (e.state?.tab) {
        setActiveTab(e.state.tab);
        if (e.state.sectionId) {
          setSelectedSectionId(e.state.sectionId);
        }
      } else if (window.location.hash) {
        const hash = window.location.hash.replace('#', '');
        if (hash) setActiveTab(hash);
      } else {
        setActiveTab('home');
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = (tab: string, sectionId?: string) => {
    if (tab !== activeTab) {
      setHistoryStack((prev) => [...prev, tab]);
      window.history.pushState({ tab, sectionId }, '', `#${tab}`);
    }
    setActiveTab(tab);
    if (sectionId) {
      setSelectedSectionId(sectionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      const updated = [...historyStack];
      updated.pop(); // remove current
      const previous = updated[updated.length - 1] || 'home';
      setHistoryStack(updated);
      setActiveTab(previous);
      window.history.pushState({ tab: previous }, '', `#${previous}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Fallback to homepage if no previous history
      setHistoryStack(['home']);
      setActiveTab('home');
      window.history.pushState({ tab: 'home' }, '', '#home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigateTab={handleNavigate} />;
      case 'assistant':
        return <Assistant onNavigateTab={handleNavigate} />;
      case 'acts':
        return <Acts initialSectionId={selectedSectionId} />;
      case 'upload':
        return <Upload onNavigateTab={handleNavigate} />;
      case 'lawyers':
        return <Lawyers onNavigateTab={handleNavigate} />;
      case 'join-lawyer':
        return <JoinLawyer onNavigateTab={handleNavigate} />;
      case 'documents':
        return <Documents />;
      case 'constitution':
      case 'precedents':
        return <Constitution />;
      case 'rights':
        return <Rights />;
      case 'emergency':
        return <Emergency />;
      case 'cyber':
        return <Cyber />;
      case 'legal-aid':
        return <LegalAid onNavigateTab={handleNavigate} />;
      case 'deadlines':
        return <Deadlines />;
      case 'procedure':
        return <Procedure />;
      case 'evidence':
        return <Evidence />;
      case 'about':
        return <About />;
      case 'disclaimer':
        return <Disclaimer />;
      default:
        return <Home onNavigateTab={handleNavigate} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleNavigate} onBack={handleBack}>
      {renderContent()}
    </Layout>
  );
}
