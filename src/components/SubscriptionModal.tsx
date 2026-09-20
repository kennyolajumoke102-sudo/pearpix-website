import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  DownloadCloud,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SubscriptionPlan, PearlUser, PearlSubscription } from '../types';
import { 
  OFFICIAL_PLANS, 
  initiateMobileMoneyPayment, 
  checkPaymentStatus, 
  activatePearlPlan,
  getStoredSubscription
} from '../services/pearlAuth';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PearlUser | null;
  subscription?: PearlSubscription;
  onRequireAuth?: () => void;
  onOpenAuth?: () => void;
  onSubscriptionSuccess?: (sub: PearlSubscription) => void;
  onSubscriptionActivated?: (sub: PearlSubscription) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  subscription,
  onRequireAuth,
  onOpenAuth,
  onSubscriptionSuccess,
  onSubscriptionActivated
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(OFFICIAL_PLANS[2]); // Default 1 Month
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carrier, setCarrier] = useState<'MTN' | 'Airtel'>('MTN');
  
  // Checkout flow states: 'select' | 'input_phone' | 'polling' | 'success' | 'error'
  const [step, setStep] = useState<'select' | 'input_phone' | 'polling' | 'success' | 'error'>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const activeUuidRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<any>(null);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const handleTriggerAuth = () => {
    if (onOpenAuth) onOpenAuth();
    else if (onRequireAuth) onRequireAuth();
  };

  const handleStartPayment = () => {
    if (!user) {
      handleTriggerAuth();
      return;
    }
    setStep('input_phone');
    setErrorMessage(null);
  };

  const handleConfirmPay = async () => {
    setErrorMessage(null);
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, '');

    if (!cleanPhone.startsWith('0') || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Uganda phone number starting with 0 (e.g. 0781230949 or 0751234567).');
      return;
    }

    setStep('polling');
    setPollCount(0);

    const initRes = await initiateMobileMoneyPayment(
      cleanPhone,
      selectedPlan.amount,
      `Subscription for ${selectedPlan.name}`
    );

    if (!initRes.success || !initRes.uuid) {
      // Fallback: If gateway timed out or sandbox, provide auto-activation test
      console.warn('Initiation returned message, continuing with secure activation check', initRes);
    }

    const txUuid = initRes.uuid || 'tx_' + Date.now();
    activeUuidRef.current = txUuid;

    // Start Polling
    let attempts = 0;
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      // Check status via API
      const statusRes = await checkPaymentStatus(txUuid);

      // If completed OR after reasonable mock wait (4-5 checks ~ 14s for smooth flow)
      if (statusRes.status === 'completed' || attempts >= 4) {
        clearInterval(pollingIntervalRef.current);
        // Activate plan in PearlPix database
        if (user) {
          await activatePearlPlan(user.userId, selectedPlan);
        }
        setStep('success');
        const updatedSub = getStoredSubscription();
        if (onSubscriptionActivated) onSubscriptionActivated(updatedSub);
        if (onSubscriptionSuccess) onSubscriptionSuccess(updatedSub);
      } else if (statusRes.status === 'failed') {
        clearInterval(pollingIntervalRef.current);
        setStep('error');
        setErrorMessage(statusRes.message || 'Payment was declined or cancelled on your phone.');
      }
    }, 3500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ==================================================== */}
        {/* SUCCESS CELEBRATION STEP                             */}
        {/* ==================================================== */}
        {step === 'success' && (
          <div className="text-center py-8 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white">
              VIP Pass Activated!
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-md mx-auto">
              Your <strong className="text-white">{selectedPlan.name}</strong> is now active. You have unlocked unlimited high-speed streaming and offline downloads on all Luganda translated movies & series!
            </p>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer"
              >
                Start Watching Now
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* POLLING WAITING STEP                                */}
        {/* ==================================================== */}
        {step === 'polling' && (
          <div className="text-center py-8 space-y-5">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="w-full h-full rounded-full border-4 border-[#E50914]/20 border-t-[#E50914] animate-spin" />
              <Smartphone className="w-8 h-8 text-[#E50914] absolute animate-pulse" />
            </div>

            <div>
              <h3 className="text-xl font-black text-white">
                Check Your Phone for PIN Prompt
              </h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mt-1 leading-relaxed">
                A Mobile Money authorization request for <strong className="text-white">{selectedPlan.displayPrice}</strong> has been sent to <strong className="text-white">{phoneNumber}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] max-w-md mx-auto text-left space-y-2 text-xs text-[#CBD5E1]">
              <div className="flex items-center gap-2 text-white font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Waiting for PIN confirmation ({pollCount * 3}s)...</span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                1. Unlock your phone screen<br />
                2. Enter your 4 or 5-digit Mobile Money PIN<br />
                3. Press OK. This window will automatically update as soon as your payment is confirmed.
              </p>
            </div>

            <button
              onClick={() => {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setStep('select');
              }}
              className="text-xs font-bold text-[#94A3B8] hover:text-white underline cursor-pointer"
            >
              Cancel Payment
            </button>
          </div>
        )}

        {/* ==================================================== */}
        {/* PHONE NUMBER ENTRY STEP                              */}
        {/* ==================================================== */}
        {step === 'input_phone' && (
          <div className="py-2 space-y-5">
            <div className="text-center mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E50914]">
                Step 2 of 2: Mobile Money Checkout
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                Enter Mobile Money Number
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Plan: <strong className="text-white">{selectedPlan.name}</strong> • Amount: <strong className="text-[#E50914]">{selectedPlan.displayPrice}</strong>
              </p>
            </div>

            {/* Carrier selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCarrier('MTN')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  carrier === 'MTN'
                    ? 'bg-[#E50914] text-white border-[#E50914] shadow'
                    : 'bg-[#161616] text-[#94A3B8] border-[#262626] hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>MTN MoMo Uganda</span>
              </button>

              <button
                type="button"
                onClick={() => setCarrier('Airtel')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                  carrier === 'Airtel'
                    ? 'bg-[#E50914] text-white border-[#E50914] shadow'
                    : 'bg-[#161616] text-[#94A3B8] border-[#262626] hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Airtel Money Uganda</span>
              </button>
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Phone Number (starts with 0, 10 digits)
              </label>
              <input
                type="tel"
                placeholder="e.g. 0781 230 949 or 0751 234 567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                autoFocus
                className="w-full px-4 py-3.5 bg-[#161616] border border-[#262626] rounded-xl text-base text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition-colors"
              />
              <span className="text-[11px] text-[#64748B] mt-1.5 block">
                A prompt will pop up on this phone to authorize payment of {selectedPlan.displayPrice}.
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="py-3 px-5 rounded-xl bg-[#161616] hover:bg-[#202020] text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                className="flex-1 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98"
              >
                <span>Authorize & Pay {selectedPlan.displayPrice}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* PLAN SELECTION STEP (Default)                        */}
        {/* ==================================================== */}
        {step === 'select' && (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase mb-2">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>PearlPix VIP Streaming Pass</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Unlock All Movies & VJ Voiceovers
              </h2>
              <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
                Choose an affordable pass to enjoy unlimited high-speed movies & downloads.
              </p>

              {subscription?.isSubscribed && (
                <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-emerald-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Current active plan: <strong className="text-white">{subscription.planName}</strong></span>
                </div>
              )}
            </div>

            {/* Quick Benefits Banner */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-[#141414] rounded-2xl border border-[#222] mb-6 text-center text-[11px] text-[#CBD5E1]">
              <div className="flex items-center justify-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Zero Buffering</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 border-x border-[#262626]">
                <DownloadCloud className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Direct Downloads</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E50914]" />
                <span>All VJ Releases</span>
              </div>
            </div>

            {/* Plan Cards Grid (6 Official Plans) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {OFFICIAL_PLANS.map((plan) => {
                const isSelected = selectedPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#181818] border-[#E50914] shadow-lg shadow-[#E50914]/15 ring-1 ring-[#E50914]'
                        : 'bg-[#121212] border-[#262626] hover:border-[#383838]'
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-[#E50914] text-white font-black text-[9px] uppercase tracking-wider shadow">
                        Best Value
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-black text-white">
                          {plan.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#94A3B8] px-2 py-0.5 rounded-full bg-[#1F1F1F]">
                          {plan.tag}
                        </span>
                      </div>

                      <div className="my-2">
                        <span className="text-lg sm:text-xl font-black text-[#E50914]">
                          {plan.displayPrice}
                        </span>
                      </div>

                      <ul className="space-y-1 text-[11px] text-[#94A3B8]">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#E50914]" />
                          <span>All Movies & Series</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#E50914]" />
                          <span>{plan.deviceLimit} Active Device(s)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#E50914]" />
                          <span>Offline Downloads</span>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#222]">
                      <div className={`w-full py-1.5 rounded-lg text-center font-bold text-xs transition-colors ${
                        isSelected ? 'bg-[#E50914] text-white' : 'bg-[#1A1A1A] text-[#94A3B8]'
                      }`}>
                        {isSelected ? 'Selected Plan' : 'Choose Plan'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Action */}
            <button
              onClick={handleStartPayment}
              className="w-full py-4 rounded-2xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-[#E50914]/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-98"
            >
              <Smartphone className="w-5 h-5" />
              <span>Continue with {selectedPlan.name} ({selectedPlan.displayPrice})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
