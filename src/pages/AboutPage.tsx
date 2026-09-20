import React from 'react';
import { ArrowLeft, Film, Sparkles, Shield, Smartphone, ExternalLink, Zap } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
  onNavigateToContact: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack, onNavigateToContact }) => {
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

      {/* Main Content */}
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center relative overflow-hidden">
          {/* Subtle Glows */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#E50914]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Brand Logo & Version */}
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#141414] border border-[#E50914]/40 flex items-center justify-center shadow-xl shadow-[#E50914]/20 p-2 mb-4">
              <img 
                src="/logo.png" 
                alt="PearlPix Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <Film className="w-10 h-10 text-[#E50914]" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              PEARL<span className="text-[#E50914]">PIX</span>
            </h1>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-[#1A1A1A] border border-[#333333] text-[11px] font-mono text-[#94A3B8]">
              v3.0.5 Cyber-Cinematic Build
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-xl mx-auto">
            Uganda’s premier digital home for Luganda translated movies, authentic Ugandan cinema, and dynamic VJ audio tracks. Engineered for blazing fast playback on mobile and home networks across Kampala and worldwide.
          </p>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-4">
            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-2">
              <div className="flex items-center gap-2 text-[#E50914] font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Legendary VJ Voiceovers</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Luganda interpretation by legendary video jokers including VJ Junior, VJ Ice P, VJ Jingo, VJ Emmy, and VJ Mark.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Smartphone className="w-4 h-4" />
                <span>Instant MoMo Activation</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Direct Uganda Mobile Money PIN checkout via MTN MoMo and Airtel Money with zero delays.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>Data-Saver Video Engines</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Dynamic bitrate switching allowing seamless streaming even on low bandwidth 3G/4G connections.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141414] border border-[#262626] space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>Google Firebase Cloud</span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Protected authentication and cloud watchlist synchronisation across all devices.
              </p>
            </div>
          </div>

          {/* Social Channels */}
          <div className="pt-6 border-t border-[#1F1F1F] flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/256770705442"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-xs font-bold text-emerald-400 flex items-center gap-2 transition-colors"
            >
              <span>WhatsApp Official</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://T.me/Jim_techug"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] text-xs font-bold text-blue-400 flex items-center gap-2 transition-colors"
            >
              <span>Telegram Group</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onNavigateToContact}
              className="px-4 py-2 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Contact Support
            </button>
          </div>

          <div className="text-[11px] text-[#64748B]">
            © {new Date().getFullYear()} PearlPix Entertainment. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
};
