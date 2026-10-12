import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ShieldCheck, UserCheck, Lock, Mail, AlertCircle, X } from 'lucide-react';

interface LegalBotAuthPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export function LegalBotAuthPanel({ isOpen, onClose, onAuthSuccess }: LegalBotAuthPanelProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'citizen' | 'lawyer'>('citizen');
  const [barNumber, setBarNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data?.user || null);
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password || 'defaultpass123',
        });
        if (error) throw error;
        setCurrentUser(data.user);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 600);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password || 'defaultpass123',
          options: {
            data: {
              full_name: fullName || email.split('@')[0],
              role,
              bar_council_number: role === 'lawyer' ? barNumber : null,
            },
          },
        });
        if (error) throw error;
        setCurrentUser(data.user);
        setSuccessMsg('Account registered successfully!');
        setTimeout(() => {
          onAuthSuccess?.();
          onClose();
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSuccessMsg('Signed out successfully.');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleQuickDemo = async (demoRole: 'citizen' | 'lawyer') => {
    setLoading(true);
    const demoEmail = demoRole === 'lawyer' ? 'advocate.demo@delhibar.org' : 'citizen.demo@india.org';
    try {
      await supabase.auth.signUp({
        email: demoEmail,
        password: 'demopassword123',
        options: {
          data: {
            full_name: demoRole === 'lawyer' ? 'Adv. Vikramaditya (Demo)' : 'Aarav Sharma (Citizen)',
            role: demoRole,
            bar_council_number: demoRole === 'lawyer' ? 'D/9981/2016' : null,
          },
        },
      });
      setSuccessMsg(`Entered demo mode as ${demoRole}!`);
      setTimeout(() => {
        onAuthSuccess?.();
        onClose();
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {currentUser ? 'Your Legal Account' : isLogin ? 'Sign In to Legal Bot' : 'Register for Legal Bot'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="my-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Mode: {isSupabaseConfigured ? 'Live Supabase Cloud' : 'Local Storage Storage'}</span>
          <span className="font-medium text-emerald-600 dark:text-emerald-400">Secure Session</span>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        {currentUser ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Signed in as</div>
              <div className="font-semibold text-slate-900 dark:text-white">{currentUser.email}</div>
              <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                Role: <span className="capitalize font-medium">{currentUser.user_metadata?.role || 'Citizen'}</span>
              </div>
              {currentUser.user_metadata?.bar_council_number && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Bar Enrollment: <span className="font-mono">{currentUser.user_metadata.bar_council_number}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('citizen')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        role === 'citizen'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Citizen / User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('lawyer')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                        role === 'lawyer'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Practicing Advocate
                    </button>
                  </div>
                  {role === 'lawyer' && (
                    <div className="mt-2">
                      <input
                        type="text"
                        required
                        value={barNumber}
                        onChange={(e) => setBarNumber(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Quick Demo Access Buttons */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-center text-slate-400 dark:text-slate-500 mb-2">
                Quick Dev / Demo Access
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('citizen')}
                  className="py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Demo Citizen</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo('lawyer')}
                  className="py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo Advocate</span>
                </button>
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
