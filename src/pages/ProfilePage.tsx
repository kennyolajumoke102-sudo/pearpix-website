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
  Send
} from 'lucide-react';
import { PearlUser, PearlSubscription } from '../types';
import { clearStoredUser } from '../services/pearlAuth';

interface ProfilePageProps {
  onBack: () => void;
  user: PearlUser | null;
  subscription: PearlSubscription;
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
                      Free users are limited to 3-second video previews. Upgrade to a Weekly, Monthly, or Annual VIP Pass to watch without interruptions.
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
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center flex-shrink-0">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors">Request a Movie / Series</div>
                    <div className="text-[10px] text-[#64748B]">Ask VJ to translate your requested title</div>
                  </div>
                </button>

                <button
                  onClick={onNavigateToContact}
                  className="p-3.5 rounded-2xl bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] flex items-center gap-3 transition-colors text-left cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#E50914] transition-colors">Contact & WhatsApp Support</div>
                    <div className="text-[10px] text-[#64748B]">Official Telegram & WhatsApp channels</div>
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

            {/* Password Update Form */}
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
                      onChange={(e) => setNewPassword(e.target.value)}
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
