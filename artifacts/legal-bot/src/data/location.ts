export interface CityLocation {
  city: string;
  state: string;
  highCourt: string;
  lat: number;
  lng: number;
}

export const INDIAN_CITIES: CityLocation[] = [
  { city: 'New Delhi', state: 'Delhi', highCourt: 'Delhi High Court', lat: 28.6139, lng: 77.2090 },
  { city: 'Mumbai', state: 'Maharashtra', highCourt: 'Bombay High Court', lat: 19.0760, lng: 72.8777 },
  { city: 'Bengaluru', state: 'Karnataka', highCourt: 'Karnataka High Court', lat: 12.9716, lng: 77.5946 },
  { city: 'Chennai', state: 'Tamil Nadu', highCourt: 'Madras High Court', lat: 13.0827, lng: 80.2707 },
  { city: 'Kolkata', state: 'West Bengal', highCourt: 'Calcutta High Court', lat: 22.5726, lng: 88.3639 },
  { city: 'Chandigarh', state: 'Punjab & Haryana', highCourt: 'Punjab and Haryana High Court', lat: 30.7333, lng: 76.7794 },
  { city: 'Hyderabad', state: 'Telangana', highCourt: 'Telangana High Court', lat: 17.3850, lng: 78.4867 },
  { city: 'Pune', state: 'Maharashtra', highCourt: 'Bombay High Court (Bench)', lat: 18.5204, lng: 73.8567 },
  { city: 'Ahmedabad', state: 'Gujarat', highCourt: 'Gujarat High Court', lat: 23.0225, lng: 72.5714 },
  { city: 'Jaipur', state: 'Rajasthan', highCourt: 'Rajasthan High Court (Jaipur Bench)', lat: 26.9124, lng: 75.7873 },
  { city: 'Lucknow', state: 'Uttar Pradesh', highCourt: 'Allahabad High Court (Lucknow Bench)', lat: 26.8467, lng: 80.9462 },
  { city: 'Kochi', state: 'Kerala', highCourt: 'Kerala High Court', lat: 9.9312, lng: 76.2673 },
];

export interface UserLocationState {
  city: string;
  state: string;
  source: 'detected' | 'manual' | 'default';
  lat?: number;
  lng?: number;
}

const STORAGE_KEY = 'legalbot_user_location';

export function getStoredLocation(): UserLocationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Error reading location from localStorage:', e);
  }
  return {
    city: 'New Delhi',
    state: 'Delhi',
    source: 'default',
  };
}

export function saveStoredLocation(loc: UserLocationState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    window.dispatchEvent(new CustomEvent('legalbot-location-changed', { detail: loc }));
  } catch (e) {
    console.warn('Error saving location to localStorage:', e);
  }
}

// Haversine distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestIndianCity(lat: number, lng: number): CityLocation {
  let minDistance = Infinity;
  let nearestCity = INDIAN_CITIES[0];

  for (const c of INDIAN_CITIES) {
    const dist = calculateDistance(lat, lng, c.lat, c.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = c;
    }
  }

  return nearestCity;
}

export async function requestBrowserGeolocation(): Promise<{
  success: boolean;
  location?: UserLocationState;
  permissionDenied?: boolean;
  error?: string;
}> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser.',
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const matched = findNearestIndianCity(latitude, longitude);
        const locState: UserLocationState = {
          city: matched.city,
          state: matched.state,
          source: 'detected',
          lat: latitude,
          lng: longitude,
        };
        saveStoredLocation(locState);
        resolve({
          success: true,
          location: locState,
        });
      },
      (error) => {
        const isDenied = error.code === error.PERMISSION_DENIED;
        resolve({
          success: false,
          permissionDenied: isDenied,
          error: isDenied
            ? 'Location permission was denied. You can select your city manually from the list.'
            : 'Unable to retrieve location. Please choose your city manually.',
        });
      },
      {
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

export const INDIAN_STATES: string[] = [
  'Delhi',
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'West Bengal',
  'Punjab & Haryana',
  'Telangana',
  'Gujarat',
  'Rajasthan',
  'Uttar Pradesh',
  'Kerala',
  'Madhya Pradesh',
  'Bihar',
  'Odisha',
  'Andhra Pradesh',
  'Assam',
  'Jharkhand',
  'Chhattisgarh',
  'Uttarakhand',
  'Himachal Pradesh',
  'Goa',
  'Jammu & Kashmir',
  'Chandigarh',
];

export function matchDocumentTypeToSpecializations(docType: string): string[] {
  const dt = (docType || '').toLowerCase();
  if (dt.includes('rent') || dt.includes('lease') || dt.includes('property') || dt.includes('tenan') || dt.includes('flat') || dt.includes('rera') || dt.includes('land')) {
    return ['Property Law & RERA', 'Tenancy Disputes', 'Rental Agreements', 'Civil Litigation'];
  }
  if (dt.includes('employ') || dt.includes('service') || dt.includes('salary') || dt.includes('labour') || dt.includes('labor') || dt.includes('hr')) {
    return ['Employment & Labour', 'Corporate Law', 'Contract Audit'];
  }
  if (dt.includes('nda') || dt.includes('confidential') || dt.includes('tech') || dt.includes('data') || dt.includes('ip') || dt.includes('privacy') || dt.includes('software')) {
    return ['IT & Data Privacy', 'Corporate Law', 'Contract Audit', 'Cyber Crime'];
  }
  if (dt.includes('cheque') || dt.includes('138') || dt.includes('promissory') || dt.includes('debt') || dt.includes('loan') || dt.includes('recovery')) {
    return ['Cheque Bounce 138', 'Commercial Arbitration', 'Civil Litigation'];
  }
  if (dt.includes('arbitrat') || dt.includes('commercial') || dt.includes('vendor') || dt.includes('partner') || dt.includes('business') || dt.includes('master service')) {
    return ['Commercial Arbitration', 'Corporate Law', 'Contract Audit'];
  }
  if (dt.includes('divorce') || dt.includes('marriage') || dt.includes('custody') || dt.includes('matrimonial') || dt.includes('family') || dt.includes('domestic')) {
    return ['Family Law', 'Matrimonial Disputes', 'Child Custody', 'Domestic Violence PWDVA'];
  }
  if (dt.includes('consumer') || dt.includes('defect') || dt.includes('deficiency') || dt.includes('claim')) {
    return ['Consumer Protection', 'Civil Litigation'];
  }
  if (dt.includes('cyber') || dt.includes('fraud') || dt.includes('phishing') || dt.includes('hacking')) {
    return ['Cyber Crime', 'Cyber Financial Fraud', 'IT Act 66D'];
  }
  if (dt.includes('fir') || dt.includes('bail') || dt.includes('police') || dt.includes('criminal') || dt.includes('complaint')) {
    return ['Criminal Law', 'Anticipatory Bail', 'Criminal Defense'];
  }
  return ['Contract Audit', 'Civil Litigation', 'Corporate Law'];
}

