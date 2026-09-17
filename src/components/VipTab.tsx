import React, { useState } from 'react';
import { SubscriptionPlan } from '../types';
import { Crown, Check, Sparkles, Smartphone, ShieldCheck, Zap, DownloadCloud, Tv } from 'lucide-react';

interface VipTabProps {
  plans: SubscriptionPlan[];
  isVip: boolean;
  activePlanName?: string;
  onActivateVip: (plan: SubscriptionPlan) => void;
}

export const VipTab: React.FC<VipTabProps> = ({
  plans,
  isVip,
  activePlanName,
  onActivateVip
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [carrier, setCarrier] = useState<'MTN' | 'Airtel'>('MTN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const handleStartCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
    setSuccessMessage(false);
  };

  const handlePay = () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      alert('Please enter a valid Uganda phone number (e.g. 0771234567).');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowCheckout(false);
      setSuccessMessage(true);
      if (selectedPlan) {
        onActivateVip(selectedPlan);
      }
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Active VIP Status Banner if subscribed */}
      {isVip && (
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-[#181818] via-[#121212] to-[#181818] border-2 border-[#E50914] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E50914] text-white flex items-center justify-center shadow-lg">
              <Crown className="w-8 h-8 fill-current" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E50914] block">
                Membership Status
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                VIP Pass Active: {activePlanName || 'All-Access VIP'}
              </h3>
              <p className="text-xs text-[#CBD5E1] mt-0.5">
                Enjoy unlimited downloads, 1080p Ultra HD streaming, and zero ads.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#E50914]/20 border border-[#E50914]/40 text-[#E50914] text-xs font-bold self-start sm:self-center">
            Active for 30 Days
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#E50914]/15 text-[#E50914] border border-[#E50914]/30 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          PearlPix VIP Experience
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Unlock Unlimited Movies with VJ Voice Overs
        </h2>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-2">
          Pay easily via MTN Mobile Money or Airtel Money. Instant activation with no contracts.
        </p>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-10">
        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#E50914] flex items-center justify-center mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white">Buffer-Free Fast CDN</h4>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Ultra-low latency streaming in Uganda</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#E50914] flex items-center justify-center mb-2">
            <DownloadCloud className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white">Offline Downloads</h4>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Save movies directly to your phone storage</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#E50914] flex items-center justify-center mb-2">
            <Tv className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white">Full TV Series Access</h4>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Watch every episode and latest season</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-xl bg-[#1F1F1F] text-[#E50914] flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-white">100% Ad-Free</h4>
          <p className="text-[11px] text-[#94A3B8] mt-0.5">Zero popups, zero commercials</p>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isVip && activePlanName === plan.name;
          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-[#1F1F1F] to-[#121212] border-2 border-[#E50914] shadow-2xl shadow-[#E50914]/15 scale-105 z-10'
                  : 'bg-[#121212] border border-[#262626] hover:border-[#E50914]/50'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#E50914] text-white font-black text-xs uppercase tracking-wider shadow">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {plan.name}
                  </h3>
                  {plan.tag && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1F1F1F] text-[#CBD5E1] border border-[#262626]">
                      {plan.tag}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-[#E50914]">
                    {plan.displayPrice}
                  </span>
                  <span className="text-xs text-[#94A3B8] ml-2">
                    / {plan.durationDays === 1 ? 'day' : `${plan.durationDays} days`}
                  </span>
                </div>

                {/* Perks Checklist */}
                <ul className="space-y-3 mb-6 text-xs text-[#CBD5E1]">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E50914] flex-none" />
                    <span>All VJ Translated Movies & Series</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E50914] flex-none" />
                    <span>Up to {plan.deviceLimit} Devices Simultaneously</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E50914] flex-none" />
                    <span>{plan.downloadLimit} Offline Movie Downloads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#E50914] flex-none" />
                    <span>Full 1080p Ultra HD Quality</span>
                  </li>
                </ul>
              </div>

              <button
                id={`buy-plan-${plan.planId}`}
                onClick={() => handleStartCheckout(plan)}
                disabled={isCurrent}
                className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-600 text-white cursor-default'
                    : plan.isPopular
                      ? 'bg-[#E50914] hover:bg-[#B80710] text-white shadow-lg shadow-[#E50914]/25'
                      : 'bg-[#1F1F1F] hover:bg-[#262626] border border-[#333333] text-white'
                }`}
              >
                {isCurrent ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Current Active Plan</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with Mobile Money</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-3xl p-6 text-white shadow-2xl">
            <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#E50914]" />
              Mobile Money Payment
            </h3>
            <p className="text-xs text-[#94A3B8] mb-5">
              Securely activate {selectedPlan.name} for {selectedPlan.displayPrice}.
            </p>

            {/* Carrier selector */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setCarrier('MTN')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  carrier === 'MTN'
                    ? 'bg-[#E50914] text-white border-[#E50914]'
                    : 'bg-[#1F1F1F] text-white border-[#262626]'
                }`}
              >
                <span>MTN MoMo Uganda</span>
              </button>
              <button
                type="button"
                onClick={() => setCarrier('Airtel')}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  carrier === 'Airtel'
                    ? 'bg-[#E50914] text-white border-[#E50914]'
                    : 'bg-[#1F1F1F] text-white border-[#262626]'
                }`}
              >
                <span>Airtel Money Uganda</span>
              </button>
            </div>

            {/* Phone Number Input */}
            <div className="mb-5">
              <label className="text-xs font-bold text-[#94A3B8] block mb-1.5">
                Phone Number (Uganda)
              </label>
              <input
                type="tel"
                placeholder="e.g. 0771 234 567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1F1F1F] border border-[#262626] text-white placeholder-[#94A3B8] text-sm focus:outline-none focus:ring-2 focus:ring-[#E50914]"
              />
              <span className="text-[10px] text-[#94A3B8] mt-1 block">
                A prompt will appear on your phone asking you to authorize {selectedPlan.displayPrice}.
              </span>
            </div>

            {/* Submit & Cancel */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="flex-1 py-3 rounded-xl bg-[#1F1F1F] hover:bg-[#262626] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="flex-1 py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-black shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <span>Sending PIN prompt...</span>
                ) : (
                  <span>Confirm & Pay</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 animate-fadeIn">
          <Check className="w-5 h-5" />
          <div className="text-xs">
            <span className="font-bold block">Payment Approved!</span>
            <span>Your VIP Pass is now activated. Enjoy all movies!</span>
          </div>
        </div>
      )}
    </div>
  );
};
