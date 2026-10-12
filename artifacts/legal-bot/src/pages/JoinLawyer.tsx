import { useState } from 'react';
import { submitPublicRequest } from '../lib/api';
import { ShieldCheck, Check, AlertCircle, ArrowLeft } from 'lucide-react';

interface JoinLawyerProps {
  onNavigateTab?: (tab: string) => void;
}

export function JoinLawyer({ onNavigateTab }: JoinLawyerProps) {
  const [name, setName] = useState('');
  const [barNumber, setBarNumber] = useState('');
  const [stateBar, setStateBar] = useState('Bar Council of Delhi');
  const [city, setCity] = useState('');
  const [court, setCourt] = useState('');
  const [experience, setExperience] = useState('5');
  const [specializations, setSpecializations] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fee, setFee] = useState('₹2,000 / Consultation');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const stateBars = [
    'Bar Council of Delhi',
    'Bar Council of Maharashtra & Goa',
    'Karnataka State Bar Council',
    'Bar Council of Tamil Nadu & Puducherry',
    'Bar Council of West Bengal',
    'Bar Council of Punjab & Haryana',
    'Bar Council of Uttar Pradesh',
    'Bar Council of Gujarat',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const lawyerData = {
        name,
        barCouncilNumber: barNumber,
        state: stateBar,
        city,
        court,
        experienceYears: parseInt(experience, 10) || 5,
        specializations: specializations.split(',').map((s) => s.trim()).filter(Boolean),
        phone,
        email,
        feeEstimate: fee,
        bio,
      };

      await submitPublicRequest('lawyer-applications', lawyerData);
      setSuccess(true);
    } catch (err) {
      console.error('Error registering lawyer:', err);
      setSubmitError('We could not submit your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => onNavigateTab?.('lawyers')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Advocate Directory</span>
      </button>

      <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-700 dark:text-blue-400" />
            <span>Advocate Verification & Directory Enrollment</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Register your chamber to assist citizens in criminal, civil, cyber, and matrimonial matters. Enrollment is strictly verified against State Bar Council registries.
          </p>
        </div>

        {success ? (
          <div className="p-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Application received for review
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              <>Your application for Bar Enrollment ID <strong>{barNumber}</strong> has been received. Your profile will not appear as verified until its credentials are reviewed.</>
            </p>
            <div className="pt-3">
              <button
                onClick={() => onNavigateTab?.('lawyers')}
                className="py-2.5 px-6 rounded-lg bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors"
              >
                Return to Advocate Directory
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
                {submitError}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Advocate Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bar Council Enrollment Number
                </label>
                <input
                  type="text"
                  required
                  value={barNumber}
                  onChange={(e) => setBarNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  State Bar Council
                </label>
                <select
                  value={stateBar}
                  onChange={(e) => setStateBar(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {stateBars.map((bar) => (
                    <option key={bar} value={bar}>
                      {bar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Primary Practice City
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Designated Courts / Tribunals
                </label>
                <input
                  type="text"
                  required
                  value={court}
                  onChange={(e) => setCourt(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Years of Courtroom Practice
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="50"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Specializations (comma separated)
              </label>
              <input
                type="text"
                required
                value={specializations}
                onChange={(e) => setSpecializations(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Chamber Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Professional Bio & Achievements
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 leading-relaxed">
              By submitting, you certify that you are an enrolled advocate under the Advocates Act 1961 with an active license to practice law in India.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              {isSubmitting ? 'Registering with Directory...' : 'Submit Advocate Enrollment'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
