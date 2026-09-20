import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { loginWithPearl, signupWithPearl, forgotPasswordWithPearl } from '../services/pearlAuth';
import { PearlUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: PearlUser) => void;
  onLoginSuccess?: (user: PearlUser) => void;
  onOpenSubscription?: () => void;
  initialMode?: 'login' | 'signup' | 'reset';
  customTitle?: string;
  customSubtitle?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onLoginSuccess,
  onOpenSubscription,
  initialMode = 'signup',
  customTitle,
  customSubtitle
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

  if (!isOpen) return null;

  const notifyAuthSuccess = (u: PearlUser) => {
    if (onLoginSuccess) onLoginSuccess(u);
    if (onSuccess) onSuccess(u);
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
          notifyAuthSuccess(res.user!);
          onClose();
          if (onOpenSubscription) onOpenSubscription();
        }, 800);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please check your credentials.');
      }
    } else {
      // Login mode
      setLoading(true);
      const res = await loginWithPearl(email, password);
      setLoading(false);

      if (res.success && res.user) {
        setSuccessMsg('Welcome back! Signed in successfully.');
        setTimeout(() => {
          notifyAuthSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message || 'Incorrect email or password. Please try again.');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#E50914]/15 border border-[#E50914]/40 text-[#E50914] mb-3 shadow-lg shadow-[#E50914]/20">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {customTitle || (
              mode === 'signup' ? 'Create PearlPix Account' :
              mode === 'login' ? 'Welcome Back to PearlPix' :
              'Reset Password'
            )}
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            {customSubtitle || (
              mode === 'signup' ? 'Sign up to stream Uganda’s best Luganda translated cinema.' :
              mode === 'login' ? 'Enter your credentials to access your movies & subscription.' :
              'Enter your account email to receive reset instructions.'
            )}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'reset' && (
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#161616] rounded-xl border border-[#262626] mb-6">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Full Name / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. John Bosco"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#161616] border border-[#262626] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full pl-10 pr-4 py-3 bg-[#161616] border border-[#262626] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
              />
            </div>
          </div>

          {/* Password Field (Login & Signup) */}
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
                    className="text-[11px] font-bold text-[#E50914] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-11 py-3 bg-[#161616] border border-[#262626] rounded-xl text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Terms Agreement (Signup only) */}
          {mode === 'signup' && (
            <label className="flex items-center gap-2.5 text-xs text-[#CBD5E1] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-[#262626] text-[#E50914] focus:ring-0 accent-[#E50914] cursor-pointer"
              />
              <span>I agree to PearlPix Terms and Privacy Policy</span>
            </label>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] disabled:opacity-50 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/20 transition-all cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'signup' ? 'Create Account & Access' :
                   mode === 'login' ? 'Sign In to PearlPix' :
                   'Send Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-[#1F1F1F] text-center text-xs text-[#94A3B8]">
          {mode === 'reset' ? (
            <div>
              <span>Remembered your password? </span>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="font-bold text-[#E50914] hover:underline ml-1 cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : mode === 'login' ? (
            <div>
              <span>Don't have an account yet? </span>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                className="font-bold text-[#E50914] hover:underline ml-1 cursor-pointer"
              >
                Sign Up Now
              </button>
            </div>
          ) : (
            <div>
              <span>Already registered? </span>
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                className="font-bold text-[#E50914] hover:underline ml-1 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
