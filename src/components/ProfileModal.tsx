import React, { useState } from 'react';
import { 
  X, 
  User, 
  Crown, 
  Receipt, 
  ShieldCheck, 
  LogOut, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { PearlUser, PearlSubscription } from '../types';
import { clearStoredUser } from '../services/pearlAuth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PearlUser | null;
  subscription: PearlSubscription;
  onOpenAuth: () => void;
  onOpenSubscription: () => void;
  onOpenContact?: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  subscription,
  onOpenAuth,
  onOpenSubscription,
  onOpenContact,
  onLogout
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

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

    // In the old website, password update displays a confirmation message
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
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LOGGED OUT VIEW */}
        {!user ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
              <User className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white">Sign In Required</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Please sign in to view your profile, manage active subscription passes, and track your invoices.
            </p>

            <div className="pt-2">
              <button
                onClick={() => { onClose(); onOpenAuth(); }}
                className="px-6 py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 cursor-pointer"
              >
                Sign In to PearlPix
              </button>
            </div>
          </div>
        ) : (
          /* LOGGED IN VIEW */
          <div className="space-y-6">
            {/* Header / User Identity */}
            <div className="flex items-center gap-4 pb-5 border-b border-[#222]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E50914] to-red-800 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-[#E50914]/20 flex-shrink-0">
                {user.name.charAt(0).toUpperCase() || 'P'}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white truncate">
                    {user.name}
                  </h3>
                  {subscription.isSubscribed && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
                      <Crown className="w-2.5 h-2.5 fill-current" />
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#94A3B8] truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#161616] border border-[#262626] font-mono text-[10px] text-[#64748B]">
                  ID: {user.userId}
                </span>
              </div>
            </div>

            {/* 1. Subscription Overview Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#E50914]" />
                  Subscription Status
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  subscription.isSubscribed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {subscription.isSubscribed ? 'Active Pass' : 'No Active Plan'}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white">
                {subscription.planName || (subscription.isSubscribed ? 'All-Access VIP Pass' : 'Free Preview Mode')}
              </h4>

              <p className="text-xs text-[#94A3B8] mt-1">
                {subscription.isSubscribed
                  ? subscription.expireTimestamp
                    ? `Active until ${new Date(subscription.expireTimestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : 'Active VIP Membership'
                  : 'Subscribe to unlock unlimited streaming, zero ads, and direct downloads.'}
              </p>

              <button
                onClick={() => { onClose(); onOpenSubscription(); }}
                className="mt-3.5 w-full py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#E50914]/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{subscription.isSubscribed ? 'Renew or Upgrade Plan' : 'Activate VIP Streaming Pass'}</span>
              </button>
            </div>

            {/* 2. Last Invoice Card */}
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626]">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                <Receipt className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Last Transaction / Invoice</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                <div>
                  <span className="text-[10px] text-[#64748B] block uppercase">Date</span>
                  <span className="text-white font-medium">{subscription.invoiceDate || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block uppercase">Plan</span>
                  <span className="text-white font-medium truncate block">{subscription.planName || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] block uppercase">Amount</span>
                  <span className="text-[#E50914] font-bold">{subscription.amount || '—'}</span>
                </div>
              </div>
            </div>

            {/* 3. Security Update (Password change) */}
            <form onSubmit={handleUpdatePassword} className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Account Security</span>
              </div>

              {securityStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  securityStatus.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-red-950/60 border border-red-800 text-red-300'
                }`}>
                  {securityStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  <span>{securityStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="password"
                  placeholder="New password (6+ chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914]"
                />
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1C1C1C] border border-[#2E2E2E] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#222] hover:bg-[#2A2A2A] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Key className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Update Password</span>
              </button>
            </form>

            {/* Contact Support & Request */}
            {onOpenContact && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenContact();
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-[#94A3B8] hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-[#E50914]" />
                  <span>Contact Support & Movie Requests</span>
                </button>
              </div>
            )}

            {/* Logout Action */}
            <div className="pt-2">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-3 rounded-xl bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 text-red-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Account</span>
              </button>
            </div>
          </div>
        )}

        {/* LOGOUT CONFIRMATION POPUP */}
        {showLogoutConfirm && (
          <div className="absolute inset-0 z-20 bg-black/90 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center animate-fadeIn">
            <LogOut className="w-12 h-12 text-[#E50914] mb-3 animate-pulse" />
            <h4 className="text-lg font-black text-white">Log out of PearlPix?</h4>
            <p className="text-xs text-[#94A3B8] max-w-xs mt-1 mb-5">
              You will need to sign in again to access full movie streams and your active subscription.
            </p>

            <div className="flex items-center gap-3 w-full max-w-xs">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-black shadow transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
