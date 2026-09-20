import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
  onNavigateToContact: () => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({
  onBack,
  onNavigateToContact
}) => {
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

      {/* Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-[#1F1F1F] pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>User Privacy & Data Protection</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Privacy Policy</h1>
            <p className="text-xs text-[#94A3B8] mt-1">Last updated: March 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#E50914]" />
                <span>1. Welcome to PearlPix</span>
              </h2>
              <p>
                At PearlPix, we respect your privacy and are committed to protecting any personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and how your data is safeguarded when you access our Luganda movie streaming service.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-[#E50914]" />
                <span>2. Information We Collect</span>
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong className="text-white">Account Information:</strong> When you register or sign in, we collect your display name and email address.</li>
                <li><strong className="text-white">Payment Records:</strong> When you subscribe using Uganda Mobile Money (MTN MoMo or Airtel Money), transaction identifiers and pass validity dates are retained to ensure uninterrupted VIP access.</li>
                <li><strong className="text-white">Watchlist & History:</strong> Titles you bookmark or watch are securely stored to enable the continue-watching feature.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E50914]" />
                <span>3. Security of Your Data</span>
              </h2>
              <p>
                We use secure Google Firebase infrastructure and encrypted HTTPS channels to protect your credentials and data. We never sell or share your personal contact details with third-party advertising brokers.
              </p>
            </section>

            <section className="space-y-2 pt-2 border-t border-[#1F1F1F]">
              <h2 className="text-sm sm:text-base font-bold text-white">4. Questions & Support</h2>
              <p>
                If you have questions about your account data or wish to request data deletion, please contact us at:
              </p>
              <div className="pt-2">
                <button
                  onClick={onNavigateToContact}
                  className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Contact Support Desk
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
