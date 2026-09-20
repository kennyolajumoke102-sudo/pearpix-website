import React from 'react';
import { 
  ArrowLeft,
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  ExternalLink,
  MessageCircle,
  Clock,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import { PearlUser } from '../types';

interface ContactPageProps {
  onBack: () => void;
  user?: PearlUser | null;
  defaultMovieTitle?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBack,
  user
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
            PEARL<span className="text-[#E50914]">PIX</span> SUPPORT
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Header Title */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-black uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>PearlPix Contact Desk</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Contact PearlPix Support
            </h1>
            {user ? (
              <p className="text-xs text-[#94A3B8]">
                Logged in as <span className="font-semibold text-white">{user.name || user.email || user.phone || 'Member'}</span>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
                Get in touch directly with our support team for VIP subscriptions, payment verifications, streaming assistance, or general inquiries.
              </p>
            )}
          </div>

          {/* Contact Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* WhatsApp Support Card */}
            <a
              href="https://wa.me/256770705442"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-emerald-500/50 hover:bg-[#121212] transition-all group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-emerald-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors">
                WhatsApp Support
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Fastest response for subscription activations, payment inquiries, and instant support.
              </p>
              <div className="mt-3 text-xs font-bold text-emerald-400">
                +256 770 705 442 →
              </div>
            </a>

            {/* Telegram Channel */}
            <a
              href="https://T.me/Jim_techug"
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-blue-500/50 hover:bg-[#121212] transition-all group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">
                Official Telegram
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Join our official community channel for daily translated movie drops, announcements, and schedules.
              </p>
              <div className="mt-3 text-xs font-bold text-blue-400">
                @Jim_techug →
              </div>
            </a>

            {/* Direct Phone Support */}
            <a
              href="tel:+256770705442"
              className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-amber-500/50 hover:bg-[#121212] transition-all group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-amber-400 transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-amber-400 transition-colors">
                Telephone Call
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                Direct phone line during operating hours for customer care across Uganda.
              </p>
              <div className="mt-3 text-xs font-bold text-amber-400">
                +256 770 705 442 →
              </div>
            </a>

            {/* Email Support */}
            <a
              href="mailto:support@pearlpix.net"
              className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] hover:border-[#E50914]/50 hover:bg-[#121212] transition-all group shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <ExternalLink className="w-4 h-4 text-[#64748B] group-hover:text-[#E50914] transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white group-hover:text-[#E50914] transition-colors">
                Email Desk
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1">
                For billing documentation, technical inquiries, and account assistance.
              </p>
              <div className="mt-3 text-xs font-bold text-[#E50914]">
                support@pearlpix.net →
              </div>
            </a>
          </div>

          {/* Operating Hours & Location Info */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-[#0D0D0D] border border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E50914]" />
              <span>Available 7 Days a Week: 8:00 AM – 11:00 PM EAT</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#E50914]" />
              <span>Kampala, Uganda</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official PearlPix Desk</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
