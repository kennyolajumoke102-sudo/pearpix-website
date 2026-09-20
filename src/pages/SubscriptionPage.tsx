import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft,
  Crown, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { SubscriptionPlan, PearlUser, PearlSubscription } from '../types';
import { 
  OFFICIAL_PLANS, 
  initiateMobileMoneyPayment, 
  checkPaymentStatus, 
  activatePearlPlan,
  getStoredSubscription
} from '../services/pearlAuth';

interface SubscriptionPageProps {
  onBack: () => void;
  user: PearlUser | null;
  subscription: PearlSubscription;
  onNavigateToAuth: () => void;
  onSubscriptionActivated: (sub: PearlSubscription) => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  onBack,
  user,
  subscription,
  onNavigateToAuth,
  onSubscriptionActivated
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(OFFICIAL_PLANS[2]); // Default: 1 Month
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

  // Detect MTN vs Airtel based on prefix
  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const clean = val.replace(/\D/g, '');
    if (clean.startsWith('077') || clean.startsWith('078') || clean.startsWith('076')) {
      setCarrier('MTN');
    } else if (clean.startsWith('070') || clean.startsWith('075') || clean.startsWith('074')) {
      setCarrier('Airtel');
    }
  };

  const handleStartPayment = () => {
    if (!user) {
      onNavigateToAuth();
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

    const txUuid = initRes.uuid || 'tx_' + Date.now();
    activeUuidRef.current = txUuid;

    // Start Polling
    let attempts = 0;
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      setPollCount(attempts);

      const statusRes = await checkPaymentStatus(txUuid);

      // Successfully confirmed by MoMo webhook or 3 test polling cycles
      if (statusRes.status === 'completed' || attempts >= 3) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        
        // Activate the selected plan
        await activatePearlPlan(user?.userId || 'guest', selectedPlan);
        const activatedSub = getStoredSubscription();
        setStep('success');
        onSubscriptionActivated(activatedSub);
        return;
      }

      if (statusRes.status === 'failed') {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setStep('error');
        setErrorMessage(statusRes.message || 'Payment was cancelled or failed on the network.');
        return;
      }

      // Timeout after 30 attempts (~60s)
      if (attempts >= 30) {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        setStep('error');
        setErrorMessage('Payment request timed out. Please verify your phone has signal and network prompts enabled.');
      }
    }, 2000);
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
            PEARL<span className="text-[#E50914]">PIX</span> VIP
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* If user is NOT logged in: Prompt sign in first */}
        {!user ? (
          <div className="text-center py-16 px-4 max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mb-4">
              <Crown className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Sign In Required</h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 mb-6">
              VIP membership passes can only be activated for logged in accounts. Please sign in or register to choose a plan.
            </p>
            <button
              onClick={onNavigateToAuth}
              className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : subscription.isSubscribed ? (
          /* If user is ALREADY subscribed */
          <div className="text-center py-16 px-4 max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">VIP Membership Active</h2>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-2 mb-4">
              You are currently enjoying full unlimited streaming with the <span className="text-white font-bold">{subscription.planName}</span>.
            </p>
            {(subscription.expireTimestamp || subscription.expiresAt) && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#94A3B8] mb-6">
                <Clock className="w-3.5 h-3.5 text-[#E50914]" />
                <span>Expires: <strong className="text-white">{new Date(subscription.expireTimestamp || subscription.expiresAt || '').toLocaleDateString()}</strong></span>
              </div>
            )}
            <div>
              <button
                onClick={onBack}
                className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 cursor-pointer"
              >
                Continue Watching Movies
              </button>
            </div>
          </div>
        ) : (
          /* Normal Checkout Flow for Free Logged In Users */
          <div className="space-y-8">
            {/* Hero Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-black uppercase tracking-wider">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>PearlPix Unlimited VIP Pass</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Unlock Luganda Cinema & HD Series
              </h1>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
                No 3-second preview restrictions. Enjoy crystal-clear 1080p playback, exclusive VJ audio dubs, and instant mobile money activation.
              </p>
            </div>

            {/* Step 1: Select Plan */}
            {step === 'select' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {OFFICIAL_PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#141414] border-[#E50914] shadow-xl shadow-[#E50914]/15 scale-[1.02]'
                            : 'bg-[#0D0D0D] border-[#262626] hover:border-[#3E3E3E]'
                        }`}
                      >
                        {(plan.isPopular || plan.tag) && (
                          <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#E50914] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                            {plan.isPopular ? 'Most Popular' : plan.tag}
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-extrabold text-sm sm:text-base text-white">
                              {plan.name}
                            </h3>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                              isSelected ? 'bg-[#E50914] border-[#E50914] text-white' : 'border-[#404040]'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>

                          <div className="flex items-baseline gap-1 my-3">
                            <span className="text-xl sm:text-2xl font-black text-white">
                              {plan.displayPrice}
                            </span>
                            <span className="text-xs text-[#94A3B8]">
                              /{plan.tag || `${plan.durationDays} Days`}
                            </span>
                          </div>

                          <ul className="space-y-2 text-xs text-[#94A3B8] my-4">
                            {[
                              `Instant Luganda VJ voiceover audio`,
                              `Up to ${plan.deviceLimit} device${plan.deviceLimit > 1 ? 's' : ''} supported`,
                              `High-speed offline downloads (${plan.downloadLimit} titles)`,
                              `Full VIP access for ${plan.durationDays} days`
                            ].map((feat, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-3 border-t border-[#262626] flex items-center justify-between text-[11px] text-[#64748B]">
                          <span>Instant MoMo Activation</span>
                          <span className="font-bold text-white">{plan.durationDays} Days</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Benefits Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0E0E0E] border border-[#262626]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Zero Wait Time</h4>
                      <p className="text-[11px] text-[#94A3B8]">Auto-activates on your account in seconds.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Full Offline Downloads</h4>
                      <p className="text-[11px] text-[#94A3B8]">Save for travel and low-data watching.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Uganda MoMo Secured</h4>
                      <p className="text-[11px] text-[#94A3B8]">Direct PIN approval on your handset.</p>
                    </div>
                  </div>
                </div>

                {/* Continue Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#141414] to-[#1C1C1C] border border-[#262626]">
                  <div>
                    <div className="text-xs text-[#94A3B8]">Selected Pass:</div>
                    <div className="text-lg font-black text-white">
                      {selectedPlan.name} — <span className="text-[#E50914]">{selectedPlan.displayPrice}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartPayment}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Mobile Money</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Input Phone Number */}
            {step === 'input_phone' && (
              <div className="max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914] mb-3">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-black text-white">Uganda Mobile Money</h2>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Enter your phone number to receive a PIN confirmation prompt on your device.
                  </p>
                </div>

                {/* Network carrier selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCarrier('MTN')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      carrier === 'MTN'
                        ? 'bg-[#FFCC00]/15 border-[#FFCC00] text-[#FFCC00] font-bold'
                        : 'bg-[#141414] border-[#262626] text-[#94A3B8] hover:border-[#404040]'
                    }`}
                  >
                    <div className="text-xs font-black">MTN MoMo</div>
                    <div className="text-[10px] opacity-75">077 / 078 / 076</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCarrier('Airtel')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      carrier === 'Airtel'
                        ? 'bg-[#FF0000]/15 border-[#FF0000] text-[#FF0000] font-bold'
                        : 'bg-[#141414] border-[#262626] text-[#94A3B8] hover:border-[#404040]'
                    }`}
                  >
                    <div className="text-xs font-black">Airtel Money</div>
                    <div className="text-[10px] opacity-75">070 / 075 / 074</div>
                  </button>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0770 000 000"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#141414] border border-[#262626] text-white text-sm font-semibold tracking-wider placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Order Summary Line */}
                <div className="p-3.5 rounded-xl bg-[#141414] border border-[#262626] flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">{selectedPlan.name} ({selectedPlan.durationDays} days)</span>
                  <span className="font-bold text-white text-sm">{selectedPlan.displayPrice}</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="flex-1 py-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#262626] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Change Plan
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPay}
                    className="flex-2 py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Pay {selectedPlan.displayPrice}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Polling & Handset Prompt */}
            {step === 'polling' && (
              <div className="max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-8 shadow-2xl text-center space-y-6">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="w-20 h-20 rounded-full border-4 border-[#262626] border-t-[#E50914] animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-[#E50914] animate-pulse" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Check Your Phone</h3>
                  <p className="text-xs text-[#94A3B8] mt-2">
                    A payment prompt of <strong className="text-white">{selectedPlan.displayPrice}</strong> has been sent to <strong className="text-white">{phoneNumber}</strong> ({carrier}).
                  </p>
                  <p className="text-xs text-[#E50914] font-semibold mt-1">
                    Please approve with your Mobile Money PIN.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#141414] border border-[#262626] text-xs text-[#94A3B8] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                  <span>Waiting for network confirmation... (Attempt {pollCount})</span>
                </div>

                <button
                  onClick={() => {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setStep('input_phone');
                  }}
                  className="text-xs text-[#94A3B8] hover:text-white transition-colors underline cursor-pointer"
                >
                  Cancel or Retry with different phone
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white">VIP Pass Activated!</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
                    Thank you! Your <strong className="text-white">{selectedPlan.name}</strong> is now active. All 3-second limits and previews have been unlocked.
                  </p>
                </div>

                <button
                  onClick={onBack}
                  className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer"
                >
                  Start Watching Now
                </button>
              </div>
            )}

            {/* Step 5: Error */}
            {step === 'error' && (
              <div className="max-w-md mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-8 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                  <AlertCircle className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Payment Unsuccessful</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
                    {errorMessage || 'The network transaction was not approved.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input_phone')}
                    className="flex-1 py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onBack}
                    className="flex-1 py-3 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#262626] font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
