import React, { useState } from 'react';
import { 
  ArrowLeft,
  User, 
  Crown, 
  ShieldCheck, 
  LogOut, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
  Bookmark,
  Play,
  Trash2
} from 'lucide-react';
import { PearlUser, PearlSubscription, Movie } from '../types';
import { clearStoredUser } from '../services/pearlAuth';

interface ProfilePageProps {
  onBack: () => void;
  user: PearlUser | null;
  subscription: PearlSubscription;
  savedMovies?: Movie[];
  onSelectMovie?: (movie: Movie) => void;
  onPlayQuick?: (movie: Movie) => void;
  onToggleSave?: (movie: Movie) => void;
  onNavigateToAuth: () => void;
  onNavigateToSubscription: () => void;
  onNavigateToContact: () => void;
  onNavigateToAbout: () => void;
  onNavigateToPrivacy: () => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  onBack,
  user,
  subscription,
  savedMovies = [],
  onSelectMovie,
  onPlayQuick,
  onToggleSave,
  onNavigateToAuth,
  onNavigateToSubscription,
  onNavigateToContact,
  onNavigateToAbout,
  onNavigateToPrivacy,
  onLogout
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatus(null);

    if (newPassword.length < 6) {
      setSecurityStatus({
        type: 'error',
        message: 'New password must be at least 6 characters long.'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityStatus({
        type: 'error',
        message: 'Password confirmation does not match.'
      });
      return;
    }

    setSecurityStatus({
      type: 'success',
      message: 'Password security updated successfully!'
    });
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleConfirmLogout = () => {
    clearStoredUser();
    setShowLogoutConfirm(false);
    onLogout();
    onBack();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-xl border-b border-[#262626] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-lg">
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
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {!user ? (
          /* Not Logged In View */
          <div className="text-center py-16 px-4 max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mb-4">
              <User className="w-8 h-8" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white">Account Required</h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 mb-6">
              Sign in or create a free PearlPix account to view your saved movies, manage subscriptions, and send movie requests.
            </p>

            <button
              onClick={onNavigateToAuth}
              className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In / Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Logged In Profile View */
          <div className="space-y-6">
            {/* Header User Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#E50914] to-[#B80710] text-white text-2xl font-black flex items-center justify-center shadow-lg shadow-[#E50914]/30 flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <h1 className="text-2xl font-black text-white">{user.name}</h1>
                  {subscription.isSubscribed ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-[#B80710] to-[#E50914] text-white shadow-md">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      VIP Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#1A1A1A] text-[#94A3B8] border border-[#333333]">
                      Free Account
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#94A3B8]">{user.email}</p>
                {user.phone && <p className="text-xs text-[#64748B]">{user.phone}</p>}
                
                <div className="pt-2 text-[11px] text-[#64748B] flex items-center justify-center sm:justify-start gap-3">
                  <span>Member Since: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}</span>
                  <span>•</span>
                  <span>Uganda Region</span>
                </div>
              </div>
            </div>

            {/* Membership & Subscription Status Block */}
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white">Membership Status</h2>
                    <p className="text-[11px] text-[#94A3B8]">Manage video streaming access & benefits</p>
                  </div>
                </div>
              </div>

              {subscription.isSubscribed ? (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141414] to-[#1C1C1C] border border-[#262626] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#94A3B8]">Active Plan</div>
                      <div className="text-base font-black text-white">{subscription.planName}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/30">
                      Unlimited VIP
                    </span>
                  </div>

                  {(subscription.expireTimestamp || subscription.expiresAt) && (
                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Clock className="w-4 h-4 text-[#E50914]" />
                      <span>Valid until: <strong className="text-white">{new Date(subscription.expireTimestamp || subscription.expiresAt || '').toLocaleDateString()}</strong></span>
                    </div>
                  )}

                  {subscription.invoiceDate && (
                    <div className="pt-2 border-t border-[#262626] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#64748B] block text-[10px] uppercase">Last Invoice Date</span>
                        <span className="text-white font-medium">{subscription.invoiceDate}</span>
                      </div>
                      {subscription.amount && (
                        <div>
                          <span className="text-[#64748B] block text-[10px] uppercase">Amount Paid</span>
                          <span className="text-white font-medium">{subscription.amount}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-[11px] text-[#64748B]">
                    Enjoy ad-free streaming, 1080p high definition, full VJ translations, and unlimited catalog access.
                  </p>
                </div>
              ) : (
                /* Free User -> Prominent Call to Action to open Subscription Page! */
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#170505] to-[#121212] border border-[#E50914]/40 space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#E50914]/20 text-[#E50914] text-[10px] font-black uppercase tracking-wider mb-2">
                      Upgrade Needed
                    </div>
                    <h3 className="text-base font-black text-white">Unlock Unlimited PearlPix VIP</h3>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      All movies require an active VIP plan. Upgrade to a Weekly, Monthly, or Annual VIP Pass to start watching instantly.
                    </p>
                  </div>

                  <button
                    onClick={onNavigateToSubscription}
                    className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Crown className="w-4 h-4 fill-current" />
                    <span>View Subscription Plans & Pay with MoMo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* My List Section (Horizontal Gridview) */}
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1F1F1F] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
                    <Bookmark className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white">My Saved List</h2>
                    <p className="text-[11px] text-[#94A3B8]">
                      {savedMovies.length > 0 
                        ? `${savedMovies.length} bookmarked title${savedMovies.length > 1 ? 's' : ''}` 
                        : 'Quick access to your bookmarked movies and series'}
                    </p>
                  </div>
                </div>
                {savedMovies.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#E50914] text-white text-[11px] font-black">
                    {savedMovies.length}
                  </span>
                )}
              </div>

              {savedMovies.length > 0 ? (
                <div className="relative">
                  <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x -mx-1 px-1">
                    {savedMovies.map((movie) => (
                      <div
                        key={movie.id}
                        className="group relative flex-shrink-0 w-28 sm:w-32 bg-[#141414] rounded-xl overflow-hidden border border-[#262626] hover:border-[#E50914] transition-all flex flex-col snap-start"
                      >
                        {/* Poster */}
                        <div 
                          className="relative aspect-[2/3] w-full overflow-hidden bg-[#1F1F1F] cursor-pointer"
                          onClick={() => onSelectMovie?.(movie)}
                        >
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* VJ Tag */}
                          {movie.vj && (
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-black text-[#E50914] uppercase tracking-wider border border-[#E50914]/40">
                              {movie.vj}
                            </div>
                          )}

                          {/* Quick Play Hover / Touch Action */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayQuick?.(movie);
                            }}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            title="Watch Now"
                          >
                            <div className="w-9 h-9 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </button>

                          {/* Remove from Saved Bookmark Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSave?.(movie);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/75 hover:bg-[#E50914] text-white transition-colors cursor-pointer"
                            title="Remove from My List"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Info */}
                        <div 
                          className="p-2 flex-1 flex flex-col justify-between cursor-pointer"
                          onClick={() => onSelectMovie?.(movie)}
                        >
                          <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-[#E50914] transition-colors">
                            {movie.title}
                          </h3>
                          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-1">
                            <span>{movie.year || ''}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#262626] font-semibold text-neutral-300">
                              {movie.isTvSeries ? 'SERIES' : 'MOVIE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-[#141414]/50 rounded-2xl border border-dashed border-[#262626] p-4">
                  <Bookmark className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-white">No saved movies yet</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    Tap the bookmark icon on any movie or series while browsing to save it here.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions & Community Services (from old site) */}
            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl space-y-3">
              <h2 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E50914]" />
                <span>Support & Information</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={onNavigateToContact}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] flex items-center gap-3 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors">Contact Support Desk</div>
                    <div className="text-[10px] text-[#64748B]">Official WhatsApp, Telegram & Phone</div>
                  </div>
                </button>

                <button
                  onClick={onNavigateToAbout}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] flex items-center gap-3 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center flex-shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors">About PearlPix</div>
                    <div className="text-[10px] text-[#64748B]">Platform version & features</div>
                  </div>
                </button>

                <button
                  onClick={onNavigateToPrivacy}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] flex items-center gap-3 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors">Privacy Policy</div>
                    <div className="text-[10px] text-[#64748B]">Data security & terms</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Password Update Form (Hidden for Google Sign-In users) */}
            {user.authProvider === 'google' || user.isGoogleUser ? (
              <div className="p-5 sm:p-6 rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Google Authenticated Account</h3>
                    <p className="text-[11px] text-[#94A3B8]">Your account security and sign-in are securely managed by Google.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Protected
                </span>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#262626] shadow-xl space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-white">Security & Password</h2>
                    <p className="text-[11px] text-[#94A3B8]">Update your account password</p>
                  </div>
                </div>

                {securityStatus && (
                  <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    securityStatus.type === 'success'
                      ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-300'
                      : 'bg-red-950/40 border border-red-800/40 text-red-300'
                  }`}>
                    {securityStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    )}
                    <span>{securityStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#94A3B8] mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-[#94A3B8] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Logout Row */}
            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 text-red-400 text-xs font-bold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">Sign Out?</h3>
            <p className="text-xs text-[#94A3B8]">
              You will need to sign in again to access your watchlist, continue watching progress, and subscription perks.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#262626] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
