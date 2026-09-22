import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight,
  Film
} from 'lucide-react';
import { 
  loginWithPearl, 
  signupWithPearl, 
  forgotPasswordWithPearl,
  loginOrRegisterWithGoogle,
  parseGoogleJwt
} from '../services/pearlAuth';
import { PearlUser } from '../types';

interface AuthPageProps {
  onBack: () => void;
  onLoginSuccess: (user: PearlUser) => void;
  initialMode?: 'login' | 'signup' | 'reset';
  noticeMessage?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

// Official Google 'G' Icon Component
const GoogleGIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({
  onBack,
  onLoginSuccess,
  initialMode = 'login',
  noticeMessage
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hiddenGsiBtnRef = useRef<HTMLDivElement>(null);

  const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '137958708754-g8hl5d0odndg1fmve9oajok83m1m0gli.apps.googleusercontent.com';

  // Initialize Google Identity Services (GSI)
  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true
          });

          // Render a hidden Google Button so we can also trigger native click if needed
          if (hiddenGsiBtnRef.current) {
            hiddenGsiBtnRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(hiddenGsiBtnRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              width: 280
            });
          }
        } catch (e) {
          console.warn('GSI init notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setTimeout(initGsi, 800);
      return () => clearTimeout(timer);
    }
  }, [GOOGLE_CLIENT_ID]);

  const handleGoogleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      setGoogleLoading(false);
      setErrorMsg('Could not receive Google credentials. Please try again.');
      return;
    }

    const profile = parseGoogleJwt(response.credential);
    if (!profile || !profile.email) {
      setGoogleLoading(false);
      setErrorMsg('Unable to retrieve your Google profile details.');
      return;
    }

    await executeGoogleAuth(profile.name, profile.email, profile.sub, profile.picture);
  };

  const executeGoogleAuth = async (
    gName: string, 
    gEmail: string, 
    sub?: string, 
    picture?: string
  ) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    try {
      const res = await loginOrRegisterWithGoogle({
        name: gName,
        email: gEmail,
        sub,
        picture
      });

      setGoogleLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onBack();
        }, 500);
      } else {
        setErrorMsg(res.message || 'Google sign-in could not be completed. Please try again.');
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setErrorMsg(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleContinueWithGoogleClick = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGoogleLoading(true);

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Prompt Google Account Chooser
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            // Attempt to trigger the native rendered button if available
            const nativeBtn = hiddenGsiBtnRef.current?.querySelector('div[role="button"]') as HTMLElement;
            if (nativeBtn) {
              nativeBtn.click();
            } else {
              setGoogleLoading(false);
              setErrorMsg('Google Sign-In prompt could not be opened. Please ensure your domain is added to Authorized JavaScript Origins in Google Cloud.');
            }
          } else if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
            setGoogleLoading(false);
          }
        });
        return;
      } catch (e: any) {
        console.warn('GSI prompt error:', e);
        setGoogleLoading(false);
        setErrorMsg('Failed to initialize Google Sign-In: ' + (e?.message || 'Please try again.'));
        return;
      }
    }

    // Google script not ready yet
    setTimeout(() => {
      setGoogleLoading(false);
      setErrorMsg('Google Sign-In is initializing. Please tap again in a moment.');
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (mode === 'reset') {
      setLoading(true);
      const res = await forgotPasswordWithPearl(email);
      setLoading(false);
      setSuccessMsg(res.message);
      return;
    }

    if (!password || password.length < 5) {
      setErrorMsg('Password must be at least 5 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name or username.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Please agree to the PearlPix Terms & Privacy Policy.');
        return;
      }

      setLoading(true);
      const res = await signupWithPearl(name, email, password);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg('Account created successfully! Welcome to PearlPix.');
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onBack();
        }, 500);
      } else {
        setErrorMsg(res.message || 'Signup failed. Please try again.');
      }
    } else {
      // Login mode
      setLoading(true);
      const res = await loginWithPearl(email, password);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onBack();
        }, 500);
      } else {
        setErrorMsg(res.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-[#262626] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#262626] text-xs sm:text-sm font-bold transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Browse</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#E50914] flex items-center justify-center font-black text-white text-xs shadow-md">
            P
          </div>
          <span className="text-base font-black tracking-wider text-white">
            PEARL<span className="text-[#E50914]">PIX</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#4285F4]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Headline */}
          <div className="text-center mb-6 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] mb-3 shadow-lg">
              <Film className="w-7 h-7" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {mode === 'login' && 'Sign In to PearlPix'}
              {mode === 'signup' && 'Create Free Account'}
              {mode === 'reset' && 'Reset Password'}
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              {noticeMessage || (
                mode === 'login' 
                  ? 'Access your watchlist, resume progress, and active passes.' 
                  : mode === 'signup' 
                    ? 'Get instant access to Ugandan translated movies and series.' 
                    : 'Enter your email to receive recovery instructions.'
              )}
            </p>
          </div>

          {/* Mode Tabs */}
          {mode !== 'reset' && (
            <div className="flex rounded-xl bg-[#141414] p-1 border border-[#262626] mb-6">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-[#E50914] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/50 border border-red-800/50 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* 1. GOOGLE SIGN-IN BUTTON WITH ACTIVE LOADING STATE */}
          {mode !== 'reset' && (
            <div className="mb-5 space-y-3">
              <button
                type="button"
                id="google-login-btn"
                onClick={handleContinueWithGoogleClick}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-[0.98] cursor-pointer disabled:opacity-75 select-none border border-white"
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-[#4285F4]" />
                    <span className="text-gray-800 font-bold">Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleGIcon />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Hidden container for Google GSI DOM rendering */}
              <div ref={hiddenGsiBtnRef} className="hidden" aria-hidden="true" />

              {/* Divider */}
              <div className="relative flex items-center justify-center pt-2">
                <div className="border-t border-[#262626] w-full" />
                <span className="bg-[#0D0D0D] px-3 text-[10px] font-bold uppercase tracking-wider text-[#64748B] absolute">
                  or sign in with email
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                  Full Name / Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John K."
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setErrorMsg(null); setSuccessMsg(null); }}
                      className="text-[11px] text-[#E50914] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-[#262626] text-[#E50914] focus:ring-[#E50914] cursor-pointer"
                />
                <label htmlFor="agreeTerms" className="text-[11px] text-[#94A3B8] leading-tight cursor-pointer">
                  I agree to PearlPix's <span className="text-white font-semibold">Terms of Service</span> and <span className="text-white font-semibold">Privacy Policy</span>.
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In with Email'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'reset' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Reset password return */}
          {mode === 'reset' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                Back to <span className="text-[#E50914] font-bold">Sign In</span>
              </button>
            </div>
          )}

          {/* Quick Note */}
          <div className="mt-6 pt-4 border-t border-[#262626] text-center text-[11px] text-[#64748B]">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Account Benefits</span>
            </div>
            <span>Sync continue watching, save favorite movies, and request localized VJ titles.</span>
          </div>
        </div>
      </main>
    </div>
  );
};
