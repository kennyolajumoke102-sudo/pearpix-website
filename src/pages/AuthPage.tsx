import React, { useState } from 'react';
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
import { loginWithPearl, signupWithPearl, forgotPasswordWithPearl } from '../services/pearlAuth';
import { PearlUser } from '../types';

interface AuthPageProps {
  onBack: () => void;
  onLoginSuccess: (user: PearlUser) => void;
  onNavigateToSubscription?: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
  noticeMessage?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBack,
  onLoginSuccess,
  onNavigateToSubscription,
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
          if (onNavigateToSubscription) {
            onNavigateToSubscription();
          } else {
            onBack();
          }
        }, 600);
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
          if (onNavigateToSubscription) {
            onNavigateToSubscription();
          } else {
            onBack();
          }
        }, 600);
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
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

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
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
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
              disabled={loading}
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
                    {mode === 'login' && 'Sign In'}
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
