import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  Building2, 
  ShieldCheck 
} from 'lucide-react';
import { 
  INDIAN_CITIES, 
  INDIAN_STATES, 
  UserLocationState, 
  getStoredLocation, 
  saveStoredLocation, 
  requestBrowserGeolocation 
} from '../data/location';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelected?: (location: UserLocationState) => void;
}

export function LocationSelectorModal({
  isOpen,
  onClose,
  onLocationSelected,
}: LocationSelectorModalProps) {
  const [currentLocation, setCurrentLocation] = useState<UserLocationState>(getStoredLocation());
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState(INDIAN_STATES[0]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loc = getStoredLocation();
      setCurrentLocation(loc);
      setCustomCity(loc.source === 'manual' ? loc.city : '');
      setCustomState(loc.state || INDIAN_STATES[0]);
      setDetectionError(null);
      setFeedbackMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPredefinedCity = (c: typeof INDIAN_CITIES[0]) => {
    const loc: UserLocationState = {
      city: c.city,
      state: c.state,
      source: 'manual',
      lat: c.lat,
      lng: c.lng,
    };
    saveStoredLocation(loc);
    setCurrentLocation(loc);
    setFeedbackMsg(`Location updated to ${c.city}, ${c.state}`);
    onLocationSelected?.(loc);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDetectGPS = async () => {
    setIsDetecting(true);
    setDetectionError(null);
    setFeedbackMsg(null);

    const res = await requestBrowserGeolocation();
    setIsDetecting(false);

    if (res.success && res.location) {
      setCurrentLocation(res.location);
      setFeedbackMsg(`Detected nearest city: ${res.location.city}, ${res.location.state}`);
      onLocationSelected?.(res.location);
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setDetectionError(
        res.error || 'Could not retrieve your location. Please select your city manually.'
      );
    }
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity.trim()) return;

    const loc: UserLocationState = {
      city: customCity.trim(),
      state: customState,
      source: 'manual',
    };
    saveStoredLocation(loc);
    setCurrentLocation(loc);
    setFeedbackMsg(`Location saved: ${loc.city}, ${loc.state}`);
    onLocationSelected?.(loc);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-modal-title"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                Select Your Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used to find verified advocates and NALSA legal aid centres nearby
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Banner */}
        <div className="px-6 py-3 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Currently Selected:</span>
            <span className="font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 inline" />
              {currentLocation.city}, {currentLocation.state}
            </span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {currentLocation.source === 'detected' ? 'GPS Detected' : currentLocation.source === 'manual' ? 'Manual' : 'Default'}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Feedback or error notification */}
          {feedbackMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {detectionError && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block">Browser Location Note</span>
                <span>{detectionError}</span>
              </div>
            </div>
          )}

          {/* Option 1: Browser Geolocation Button */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  <span>Browser Geolocation</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Detect your nearest Indian metro or High Court seat using your browser. Permission is requested only upon clicking.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGPS}
                disabled={isDetecting}
                className="py-2 px-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50 shadow-xs"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Detecting...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Detect Location</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Quick Predefined Indian Metros */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Major Indian Metros & High Court Jurisdictions
              </h3>
              <span className="text-[10px] text-slate-400">12 Verified Hubs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INDIAN_CITIES.map((c) => {
                const isSelected = currentLocation.city.toLowerCase() === c.city.toLowerCase();
                return (
                  <button
                    key={c.city}
                    type="button"
                    onClick={() => handleSelectPredefinedCity(c)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 ring-1 ring-blue-600 text-blue-950 dark:text-blue-100'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{c.city}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {c.state}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 3: Manual City and State Entry */}
          <form onSubmit={handleSaveManual} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Or Enter Custom City & State Manually
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  City Name
                </label>
                <input
                  type="text"
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="e.g. Gurugram, Noida, Indore, Bhopal..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  State / Union Territory
                </label>
                <select
                  value={customState}
                  onChange={(e) => setCustomState(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!customCity.trim()}
              className="w-full py-2 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 text-xs font-semibold transition-colors disabled:opacity-40"
            >
              Save Manual City
            </button>
          </form>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Location permission is never mandatory. Your chosen city is saved locally on your device to personalize advocate search and legal aid centres.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
