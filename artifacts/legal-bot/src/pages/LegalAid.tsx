import { useState, useEffect } from 'react';
import { 
  Scale, 
  PhoneCall, 
  CheckCircle, 
  ExternalLink, 
  ShieldCheck, 
  HelpCircle,
  MapPin,
  Building2,
  Mail,
  ChevronRight
} from 'lucide-react';
import { VERIFIED_LEGAL_AID_CENTRES } from '../data/legalAid';
import { getStoredLocation, UserLocationState } from '../data/location';
import { LocationSelectorModal } from '../components/LocationSelectorModal';
import { LegalAidEligibilityModal } from '../components/LegalAidEligibilityModal';

interface LegalAidProps {
  onNavigateTab?: (tab: string) => void;
}

export function LegalAid({ onNavigateTab }: LegalAidProps) {
  const [userLocation, setUserLocation] = useState<UserLocationState>(getStoredLocation());
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);

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

  const eligiblePersons = [
    'Women and Children',
    'Members of Scheduled Castes (SC) and Scheduled Tribes (ST)',
    'Industrial workmen facing unfair labor disputes',
    'Victims of mass disasters, violence, flood, drought, or earthquake',
    'Disabled persons and persons with mental illness',
    'Persons in custody or under-trial prisoners',
    'Citizens whose annual income does not exceed ₹3,00,000 (varies by State)',
  ];

  // Match legal aid centre by user's state or city
  const matchedCentre = VERIFIED_LEGAL_AID_CENTRES.find(
    (c) =>
      c.state.toLowerCase() === userLocation.state.toLowerCase() ||
      c.district.toLowerCase().includes(userLocation.city.toLowerCase()) ||
      c.name.toLowerCase().includes(userLocation.city.toLowerCase())
  ) || VERIFIED_LEGAL_AID_CENTRES[0]; // fallback to Delhi SLSA

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <Scale className="w-7 h-7 text-blue-700 dark:text-blue-400" />
          <span>Free Legal Aid & NALSA Services</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Constitutional guarantee of free legal representation for eligible Indian citizens under Article 39A and Section 341 BNSS (Section 304 CrPC).
        </p>
      </div>

      {/* Toll free banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white space-y-4 border border-emerald-800 shadow-md">
        <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>National Legal Services Authority (NALSA)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
          Need a Free Defense Lawyer for Court Representation?
        </h2>
        <p className="text-sm text-emerald-100 leading-relaxed max-w-3xl">
          The State is constitutionally mandated to provide free advocate services, legal drafting, court fees exemption, and certified copy expenses to eligible citizens without any financial burden.
        </p>
        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setEligibilityModalOpen(true)}
            className="py-2.5 px-6 rounded-xl bg-white text-emerald-950 font-bold text-sm transition-colors flex items-center gap-2 shadow-sm hover:bg-emerald-50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Check Free Legal Aid Eligibility</span>
          </button>
          <a
            href="tel:15100"
            className="py-2.5 px-5 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 border border-emerald-700"
          >
            <PhoneCall className="w-4 h-4 text-emerald-300" />
            <span>NALSA Helpline: 15100 (Toll-Free)</span>
          </a>
          <a
            href="https://nalsa.gov.in"
            target="_blank"
            rel="noreferrer"
            className="py-2.5 px-5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 border border-emerald-700"
          >
            <span>Official NALSA Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Nearby Legal Aid Center Matched to User's Selected Location */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-400">
                Nearest Matched Authority ({userLocation.city}, {userLocation.state})
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {matchedCentre.name}
              </h3>
            </div>
          </div>

          <button
            onClick={() => setLocationModalOpen(true)}
            className="py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Change Location</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="text-slate-600 dark:text-slate-400">
              <strong className="text-slate-800 dark:text-slate-200 block text-[11px] uppercase font-semibold mb-0.5">
                Physical Office Address:
              </strong>
              <span>{matchedCentre.address}</span>
            </div>

            <div className="pt-2 flex flex-wrap gap-4 text-xs">
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Contact Number:</strong>
                <a href={`tel:${matchedCentre.phone.split('/')[0].trim()}`} className="text-blue-700 dark:text-blue-400 hover:underline font-semibold">
                  {matchedCentre.phone}
                </a>
              </div>
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block text-[11px]">Official Email:</strong>
                <a href={`mailto:${matchedCentre.email}`} className="text-blue-700 dark:text-blue-400 hover:underline">
                  {matchedCentre.email}
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <strong className="text-slate-800 dark:text-slate-200 block text-xs font-semibold">
              Free Services Available at this Centre:
            </strong>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
              {matchedCentre.services.map((svc, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{svc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Eligibility criteria */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Who is Entitled to Free Legal Aid under Section 12 of Legal Services Authorities Act?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          If you belong to any of the following categories, you are entitled to free advocate services irrespective of your financial capacity:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
          {eligiblePersons.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Directory of other state centres */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          State Legal Services Authorities Across India
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {VERIFIED_LEGAL_AID_CENTRES.map((c) => (
            <div key={c.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
              <span className="text-[11px] text-slate-500 block">{c.state} ({c.district})</span>
              <div className="text-[11px] text-blue-700 dark:text-blue-400 font-mono pt-1">
                {c.phone}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What free legal aid covers */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          What Services Are Covered Free of Cost?
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside leading-relaxed">
          <li>Appointment of an advocate from the Legal Services Authority panel for Sessions Court, High Court, or Supreme Court.</li>
          <li>Payment of Court fees, process fees, and other expenses in connection with legal proceedings.</li>
          <li>Free certified copies of judgments, FIR, charge-sheets, and deposition records.</li>
          <li>Preparation of appeal memos, revision petitions, and bail applications.</li>
        </ul>
      </div>

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
