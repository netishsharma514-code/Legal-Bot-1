import { useState, useEffect } from 'react';
import { INITIAL_LAWYERS } from '../data/lawyers';
import { Lawyer, ConsultationInquiry } from '../data/types';
import { getStoredLocation, UserLocationState, INDIAN_CITIES } from '../data/location';
import { LocationSelectorModal } from '../components/LocationSelectorModal';
import { LegalAidEligibilityModal } from '../components/LegalAidEligibilityModal';
import { supabase, dbMode } from '../lib/supabase';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Filter, 
  PlusCircle, 
  Check, 
  X,
  Calendar,
  MessageSquare,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Info,
  DollarSign,
  Gift
} from 'lucide-react';

interface LawyersProps {
  onNavigateTab?: (tab: string) => void;
}

type FeeFilter = 'all' | 'free' | 'paid';
type DirectoryViewMode = 'all' | 'ai-guidance' | 'gov-aid' | 'private-lawyers';
type LanguageMode = 'en' | 'hi' | 'hinglish';

export function Lawyers({ onNavigateTab }: LawyersProps) {
  const [lawyers] = useState<Lawyer[]>(INITIAL_LAWYERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedSpec, setSelectedSpec] = useState<string>('All');
  const [feeFilter, setFeeFilter] = useState<FeeFilter>('all');
  const [userLocation, setUserLocation] = useState<UserLocationState>(getStoredLocation());
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [filterNearMeOnly, setFilterNearMeOnly] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<DirectoryViewMode>('all');
  const [languageMode, setLanguageMode] = useState<LanguageMode>('en');

  // Consultation booking modal state
  const [consultModalLawyer, setConsultModalLawyer] = useState<Lawyer | null>(null);
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultEmail, setConsultEmail] = useState('');
  const [consultSubject, setConsultSubject] = useState('');
  const [consultMode, setConsultMode] = useState<'chamber' | 'phone' | 'video'>('chamber');
  const [consultSuccessInquiry, setConsultSuccessInquiry] = useState<ConsultationInquiry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleLocationChange = (e: Event) => {
      const customEvt = e as CustomEvent<UserLocationState>;
      if (customEvt.detail) {
        setUserLocation(customEvt.detail);
      }
    };
    window.addEventListener('legalbot-location-changed', handleLocationChange);
    return () => window.removeEventListener('legalbot-location-changed', handleLocationChange);
  }, []);

  const availableCities = ['All', 'New Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Chandigarh', 'Pune', 'Hyderabad', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  const specs = ['All', 'Criminal Law', 'Cyber Crime', 'Family Law', 'Property Law & RERA', 'Corporate Law', 'Contract Audit', 'Consumer Protection'];

  // Sorting & Filtering
  const filteredLawyers = lawyers.filter((l) => {
    const matchesCity = filterNearMeOnly
      ? l.city.toLowerCase() === userLocation.city.toLowerCase()
      : selectedCity === 'All' || l.city === selectedCity;

    const matchesSpec = selectedSpec === 'All' || l.specializations.some((s) => s.includes(selectedSpec));
    
    const matchesFee =
      feeFilter === 'all'
        ? true
        : feeFilter === 'free'
        ? l.isFreeInitialConsultation === true
        : l.isFreeInitialConsultation !== true;

    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.barCouncilNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.court.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.specializations.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCity && matchesSpec && matchesFee && matchesSearch;
  });

  // Prioritize advocates in user's city first, then state
  const sortedLawyers = [...filteredLawyers].sort((a, b) => {
    const aIsCity = a.city.toLowerCase() === userLocation.city.toLowerCase() ? 1 : 0;
    const bIsCity = b.city.toLowerCase() === userLocation.city.toLowerCase() ? 1 : 0;
    if (aIsCity !== bIsCity) return bIsCity - aIsCity;

    const aIsState = a.state.toLowerCase() === userLocation.state.toLowerCase() ? 1 : 0;
    const bIsState = b.state.toLowerCase() === userLocation.state.toLowerCase() ? 1 : 0;
    return bIsState - aIsState;
  });

  const exactCityMatches = lawyers.filter(
    (l) => l.city.toLowerCase() === userLocation.city.toLowerCase()
  );

  const stateMatches = lawyers.filter(
    (l) => l.state.toLowerCase() === userLocation.state.toLowerCase() && l.city.toLowerCase() !== userLocation.city.toLowerCase()
  );

  const handleSendConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultModalLawyer) return;

    if (consultModalLawyer.isDemo) {
      // Demo profiles must not receive real consultation requests or private documents
      return;
    }

    setIsSubmitting(true);
    const inquiry: ConsultationInquiry = {
      id: `INQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      lawyerId: consultModalLawyer.id,
      lawyerName: consultModalLawyer.name,
      lawyerBarCouncil: consultModalLawyer.barCouncilNumber,
      lawyerCourt: consultModalLawyer.court,
      lawyerCity: consultModalLawyer.city,
      documentName: 'Direct Consultation Request',
      documentType: 'Legal Consultation',
      documentSummary: consultSubject.trim() || 'General Legal Consultation',
      extractedIssues: [consultSubject.trim() || 'General Consultation Inquiry'],
      userName: consultName.trim(),
      userPhone: consultPhone.trim(),
      userEmail: consultEmail.trim(),
      userLocation: `${userLocation.city}, ${userLocation.state}`,
      userNote: `[Mode: ${consultMode}] ${consultSubject.trim()}`,
      consentGiven: true,
      status: 'Pending Advocate Review',
      createdAt: new Date().toISOString(),
    };

    try {
      await supabase.from('consultation_inquiries').insert({
        ...inquiry,
        database_mode: dbMode,
      });
      setConsultSuccessInquiry(inquiry);
    } catch {
      setConsultSuccessInquiry(inquiry);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Multilingual UI strings
  const strings = {
    en: {
      pageTitle: 'Legal Counsel & Representation Directory',
      pageSub: 'Choose the right legal assistance for your situation: Free AI Guidance, Free Government Legal Aid, or Private Lawyers.',
      card1Title: '1. Free AI Legal Guidance',
      card1Badge: '100% Free · Instant',
      card1Desc: 'Ask Legal Bot queries regarding Indian laws, Bharatiya Nyaya Sanhita (BNS 2023), fundamental rights, and police procedures with official statutory citations.',
      card1Disclaimer: 'AI guidance is for educational and general information only and is NOT a substitute for an advocate.',
      card1Btn: 'Ask Legal Bot for Free',
      card2Title: '2. Free Government Legal Aid',
      card2Badge: 'Free for Eligible Citizens',
      card2Desc: 'Under Article 39A and Legal Services Authorities Act 1987, eligible individuals receive free court advocates, drafting, and court fee waivers through NALSA & State DLSAs.',
      card2Eligibility: 'Eligible: Women, Children, SC/ST, custody/under-trials, workmen, and income ≤ ₹3 Lakhs.',
      card2Btn: 'Check Free Legal Aid Eligibility',
      card2SlsaBtn: 'View Nearest DLSA / SLSA',
      card3Title: '3. Private Lawyers',
      card3Badge: 'Free or Paid Consultations',
      card3Desc: 'Browse practicing advocates registered with State Bar Councils across High Courts and District Courts. Filter by consultation fee type (free initial or paid).',
      card3Notice: 'Case-handling and litigation representation fees are determined separately by the advocate. We do not invent fees or credentials.',
      card3Btn: 'Browse Private Lawyers Below',
      demoBadge: 'DEMO PROFILE — NOT VERIFIED',
      demoNotice: 'Sample fee for UI testing only. Fictional profile — cannot receive requests.',
      verifiedBadge: 'Verified Advocate',
      sampleFeeNotice: 'Sample fee shown as UI example only, never a real price quotation.',
    },
    hi: {
      pageTitle: 'कानूनी सलाह एवं वकील डायरेक्टरी',
      pageSub: 'अपनी आवश्यकतानुसार कानूनी सहायता चुनें: मुफ़्त AI मार्गदर्शन, सरकारी मुफ़्त कानूनी सहायता (NALSA), या प्राइवेट वकील।',
      card1Title: '1. मुफ़्त AI कानूनी मार्गदर्शन',
      card1Badge: '100% मुफ़्त · तुरंत उत्तर',
      card1Desc: 'भारतीय कानूनों (BNS 2023), नागरिक अधिकारों, FIR और ज़मानत नियमों पर कानूनी धाराओं के साथ सवाल पूछें।',
      card1Disclaimer: 'AI मार्गदर्शन सामान्य जानकारी के लिए है और यह किसी वकील का कानूनी विकल्प नहीं है।',
      card1Btn: 'लीगल बॉट से मुफ़्त पूछें',
      card2Title: '2. सरकारी मुफ़्त कानूनी सहायता',
      card2Badge: 'पात्र नागरिकों के लिए पूरी तरह मुफ़्त',
      card2Desc: 'अनुच्छेद 39A और NALSA के तहत पात्र नागरिकों को सरकारी वकील, कोर्ट ड्राफ्टिंग और कोर्ट फीस माफ़ी मुफ़्त मिलती है।',
      card2Eligibility: 'पात्रता: महिलाएँ, बच्चे, SC/ST, जेल/कस्टडी में व्यक्ति, श्रमिक, और वार्षिक आय ₹3 लाख तक।',
      card2Btn: 'मुफ़्त कानूनी सहायता पात्रता जाँचें',
      card2SlsaBtn: 'निकटतम DLSA / SLSA देखें',
      card3Title: '3. प्राइवेट वकील (प्राइवेट एडवोकेट)',
      card3Badge: 'मुफ़्त या सशुल्क परामर्श',
      card3Desc: 'स्टेट बार काउंसिल में पंजीकृत वकीलों से संपर्क करें। पहली परामर्श मुफ़्त या सशुल्क के आधार पर फ़िल्टर करें।',
      card3Notice: 'केस लड़ने की फीस वकील द्वारा अलग से तय की जाती है। हम कोई नकली फीस नहीं दिखाते।',
      card3Btn: 'प्राइवेट वकील सूची देखें',
      demoBadge: 'डेमो प्रोफ़ाइल — असत्यापित (DEMO)',
      demoNotice: 'केवल UI टेस्टिंग हेतु काल्पनिक प्रोफ़ाइल। यह वास्तविक अनुरोध स्वीकार नहीं करता।',
      verifiedBadge: 'सत्यापित वकील',
      sampleFeeNotice: 'यह केवल उदाहरण शुल्क है, वास्तविक कोटेशन नहीं।',
    },
    hinglish: {
      pageTitle: 'Legal Advice & Lawyer Directory',
      pageSub: 'Apni zarurat ke hisaab se sahi option chunein: Free AI Guidance, Free Govt Legal Aid (NALSA), ya Private Lawyers.',
      card1Title: '1. Free AI Legal Guidance',
      card1Badge: '100% Free · Instant Advice',
      card1Desc: 'BNS 2023, Police rules, FIR, Bail aur Indian Kanoon ke sawal Legal Bot se puchein official sections ke sath.',
      card1Disclaimer: 'AI guidance general information ke liye hai, yeh advocate ka substitute nahi hai.',
      card1Btn: 'Legal Bot se Free Puchein',
      card2Title: '2. Free Government Legal Aid',
      card2Badge: 'Eligible citizens ke liye Free',
      card2Desc: 'Article 39A aur NALSA ke under eligible logo ko court me free sarkari advocate, drafting aur fee waiver milta hai.',
      card2Eligibility: 'Eligible: Women, Children, SC/ST, Custody me under-trials, workmen, aur income ≤ ₹3 Lakhs.',
      card2Btn: 'Check Free Legal Aid Eligibility',
      card2SlsaBtn: 'Nearest DLSA / SLSA Office',
      card3Title: '3. Private Lawyers',
      card3Badge: 'Free or Paid Consultations',
      card3Desc: 'High Court aur District Court ke verified advocates se connect karein. Free initial consultation filter karein.',
      card3Notice: 'Case-handling aur court fees advocate alag se tay karte hain. Koi fake price nahi.',
      card3Btn: 'Explore Private Lawyers',
      demoBadge: 'DEMO PROFILE — NOT VERIFIED',
      demoNotice: 'UI testing ke liye sample profile. Real requests send nahi hote.',
      verifiedBadge: 'Verified Advocate',
      sampleFeeNotice: 'Sample fee UI testing ke liye hai, real quotation nahi.',
    },
  }[languageMode];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Language Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Legal Bot · 3-Tier Access
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100/80 dark:bg-slate-900 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setLanguageMode('en')}
                className={`px-2 py-0.5 rounded-md transition-colors ${languageMode === 'en' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('hi')}
                className={`px-2 py-0.5 rounded-md transition-colors ${languageMode === 'hi' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguageMode('hinglish')}
                className={`px-2 py-0.5 rounded-md transition-colors ${languageMode === 'hinglish' ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-2xs font-bold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Hinglish
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-700 dark:text-blue-400" />
            <span>{strings.pageTitle}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            {strings.pageSub}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab?.('join-lawyer')}
          className="py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs whitespace-nowrap self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Advocate Registration</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 3 CLEAR OPTION CARDS: FREE AI, FREE GOVT AID, PRIVATE LAWYERS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: FREE AI LEGAL GUIDANCE */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/60 via-white to-white dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-blue-400 transition-all">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                {strings.card1Badge}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {strings.card1Title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {strings.card1Desc}
            </p>

            <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong>Statutory Notice:</strong> {strings.card1Disclaimer}
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onNavigateTab?.('assistant')}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <span>{strings.card1Btn}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CARD 2: FREE GOVERNMENT LEGAL AID (NALSA / SLSA) */}
        <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-500 transition-all">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                {strings.card2Badge}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {strings.card2Title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {strings.card2Desc}
            </p>

            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Article 39A & Sec 12 LSA Act 1987</span>
              </div>
              <div className="text-[10px] text-emerald-800 dark:text-emerald-300">
                {strings.card2Eligibility}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 pt-1">
              <span className="flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-emerald-600" />
                <span>NALSA Helpline: <strong>15100</strong> (Toll-Free)</span>
              </span>
              <a
                href="https://nalsa.gov.in/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold"
              >
                <span>nalsa.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => setEligibilityModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{strings.card2Btn}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab?.('legal-aid')}
              className="w-full py-2 px-3 rounded-lg border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-1"
            >
              <span>{strings.card2SlsaBtn}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 3: PRIVATE LAWYERS — FREE OR PAID */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/60 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-400 transition-all">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200">
                {strings.card3Badge}
              </span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {strings.card3Title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {strings.card3Desc}
            </p>

            <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 space-y-1">
              <div className="font-semibold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-indigo-600" />
                <span>Fee Transparency & Clarity</span>
              </div>
              <div className="text-[10px] text-indigo-800 dark:text-indigo-300 leading-snug">
                {strings.card3Notice}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 font-semibold">Filter fee:</span>
              <button
                type="button"
                onClick={() => setFeeFilter('free')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                  feeFilter === 'free'
                    ? 'border-emerald-600 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                Free Initial Only
              </button>
              <button
                type="button"
                onClick={() => setFeeFilter('paid')}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                  feeFilter === 'paid'
                    ? 'border-blue-600 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                Paid Only
              </button>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
            <a
              href="#lawyers-list"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
            >
              <span>{strings.card3Btn}</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* LOCATION SELECTOR & SUMMARY RIBBON */}
      {/* ========================================================= */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-800/80 text-blue-200 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-blue-200 font-medium">Your Selected Location:</div>
            <div className="text-base font-bold text-white flex items-center gap-2">
              <span>{userLocation.city}, {userLocation.state}</span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-800 text-blue-200">
                {exactCityMatches.length} Advocates in City
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              setFilterNearMeOnly(!filterNearMeOnly);
              setSelectedCity('All');
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterNearMeOnly
                ? 'bg-white text-blue-950 font-bold'
                : 'bg-blue-800 hover:bg-blue-700 text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{filterNearMeOnly ? 'Showing Near Me Only' : 'Filter Near Me'}</span>
          </button>

          <button
            type="button"
            onClick={() => setLocationModalOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-blue-950 hover:bg-blue-900 text-blue-200 text-xs font-semibold transition-colors border border-blue-800 cursor-pointer"
          >
            Change Location
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH AND FILTER BAR */}
      {/* ========================================================= */}
      <div id="lawyers-list" className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by advocate name, Bar Council ID (e.g. D/1842/2008), court, or specialty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="space-y-3 text-xs">
          {/* Fee Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-500 min-w-16">Consultation:</span>
            {[
              { id: 'all', label: 'All Fees' },
              { id: 'free', label: 'Free Initial Consultation' },
              { id: 'paid', label: 'Paid Consultation' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFeeFilter(f.id as FeeFilter)}
                className={`py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  feeFilter === f.id
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* City filter */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-500 min-w-16">City:</span>
            {availableCities.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setFilterNearMeOnly(false);
                }}
                className={`py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  selectedCity === city && !filterNearMeOnly
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Specialty filter */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-500 min-w-16">Practice:</span>
            {specs.map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpec(spec)}
                className={`py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
                  selectedSpec === spec
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notice if no advocate in user's exact city */}
      {exactCityMatches.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">No advocate currently registered directly in {userLocation.city}.</span>
            <span>
              Showing advocates across <strong>{userLocation.state}</strong> ({stateMatches.length} available) and High Court benches serving your jurisdiction. Or explore <strong>Free Government Legal Aid (DLSA)</strong> for your district.
            </span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LAWYERS GRID */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedLawyers.map((lawyer) => {
          const isUserCity = lawyer.city.toLowerCase() === userLocation.city.toLowerCase();
          const isUserState = lawyer.state.toLowerCase() === userLocation.state.toLowerCase();

          return (
            <div
              key={lawyer.id}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between shadow-xs ${
                lawyer.isDemo
                  ? 'border-dashed border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                  : isUserCity
                  ? 'border-blue-500/70 ring-1 ring-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Demo profile banner if fictional demo */}
                {lawyer.isDemo && (
                  <div className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-extrabold text-[10px] tracking-wide flex items-center justify-between">
                    <span className="uppercase">{strings.demoBadge}</span>
                    <span className="font-normal text-[9px] opacity-80">UI Test Only</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-base">
                      <span>{lawyer.name}</span>
                      {!lawyer.isDemo ? (
                        <span title="Verified Advocate"><ShieldCheck className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" /></span>
                      ) : (
                        <span title="Demo profile for UI testing"><HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" /></span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                      Bar Council: <strong>{lawyer.barCouncilNumber}</strong>
                    </div>
                  </div>

                  {isUserCity ? (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 shrink-0">
                      In Your City
                    </span>
                  ) : isUserState ? (
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                      {lawyer.state}
                    </span>
                  ) : null}
                </div>

                {/* Court and City */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{lawyer.city}, {lawyer.state}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{lawyer.court}</span>
                  </div>
                </div>

                {/* Experience & Free/Paid badge */}
                <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{lawyer.rating}</span>
                    <span className="text-slate-400 font-normal">({lawyer.reviewsCount})</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    <strong>{lawyer.experienceYears}</strong> Yrs Exp
                  </div>
                  <div className="ml-auto">
                    {lawyer.isFreeInitialConsultation ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <Gift className="w-3 h-3 text-emerald-600" />
                        <span>Free Initial</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        Paid Consult
                      </span>
                    )}
                  </div>
                </div>

                {/* Specializations */}
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 mb-1.5">
                    Practice Areas:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lawyer.specializations.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                {lawyer.bio && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {lawyer.bio}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Initial Consultation:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {lawyer.feeEstimate}
                  </span>
                </div>

                {/* Case handling disclaimer */}
                <div className="text-[10px] text-slate-400 dark:text-slate-500 italic leading-tight">
                  {lawyer.isDemo ? strings.demoNotice : 'Case-handling and court representation fees are separate.'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={lawyer.isDemo ? '#demo-warning' : `tel:${lawyer.phone.replace(/\s+/g, '')}`}
                    onClick={(e) => {
                      if (lawyer.isDemo) {
                        e.preventDefault();
                        alert('This is a DEMO PROFILE for UI testing. Demo lawyers do not receive real phone calls or requests.');
                      }
                    }}
                    className="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{lawyer.isDemo ? 'Demo Chamber' : 'Call Chamber'}</span>
                  </a>

                  <button
                    onClick={() => {
                      if (lawyer.isDemo) {
                        alert('DEMO PROFILE: This profile is for UI layout testing only and cannot receive consultation requests or private documents.');
                        return;
                      }
                      setConsultModalLawyer(lawyer);
                      setConsultSuccessInquiry(null);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                      lawyer.isDemo
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-blue-700 hover:bg-blue-800 text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{lawyer.isDemo ? 'Demo Consult' : 'Consult'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedLawyers.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            No Advocates Found Matching Filters
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try resetting your search query or selecting "All" cities / consultation fees to view available advocates.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCity('All');
              setSelectedSpec('All');
              setFeeFilter('all');
              setFilterNearMeOnly(false);
            }}
            className="py-2 px-4 rounded-xl bg-blue-700 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Consultation Modal */}
      {consultModalLawyer && !consultModalLawyer.isDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Book Consultation with {consultModalLawyer.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {consultModalLawyer.court} · {consultModalLawyer.barCouncilNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConsultModalLawyer(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {consultSuccessInquiry ? (
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                    Consultation Inquiry Sent
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Reference ID: <strong>{consultSuccessInquiry.id}</strong>. The advocate's chamber will contact you within 24 hours.
                  </p>
                  <button
                    onClick={() => setConsultModalLawyer(null)}
                    className="py-2 px-5 rounded-lg bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendConsultation} className="space-y-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={consultName}
                      onChange={(e) => setConsultName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={consultPhone}
                        onChange={(e) => setConsultPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={consultEmail}
                        onChange={(e) => setConsultEmail(e.target.value)}
                        placeholder="rahul@example.com"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Consultation Mode
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'chamber', label: 'In-Chamber' },
                        { id: 'phone', label: 'Phone Call' },
                        { id: 'video', label: 'Video Call' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setConsultMode(m.id as any)}
                          className={`py-2 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                            consultMode === m.id
                              ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold dark:bg-blue-950/60 dark:text-blue-300'
                              : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Brief Matter Subject / Description
                    </label>
                    <textarea
                      rows={2}
                      value={consultSubject}
                      onChange={(e) => setConsultSubject(e.target.value)}
                      placeholder="e.g. Need consultation on residential lease termination and security deposit dispute."
                      className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 text-[11px] text-slate-500">
                    <strong>Consultation fee disclosure:</strong> {consultModalLawyer.feeEstimate}. Case-handling and court fees are separate and mutually agreed upon with the advocate.
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setConsultModalLawyer(null)}
                      className="py-2 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2 px-5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Consultation Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onLocationSelected={(loc) => setUserLocation(loc)}
      />

      {/* Legal Aid Eligibility Modal */}
      <LegalAidEligibilityModal
        isOpen={eligibilityModalOpen}
        onClose={() => setEligibilityModalOpen(false)}
        userLocation={userLocation}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
