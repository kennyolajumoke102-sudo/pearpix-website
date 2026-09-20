import React, { useState } from 'react';
import { 
  ArrowLeft,
  MessageSquare, 
  Send, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Film,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { PearlUser } from '../types';

interface ContactPageProps {
  onBack: () => void;
  user: PearlUser | null;
  defaultMovieTitle?: string;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onBack,
  user,
  defaultMovieTitle = ''
}) => {
  const [activeTab, setActiveTab] = useState<'request' | 'channels'>('request');
  const [movieTitle, setMovieTitle] = useState(defaultMovieTitle);
  const [notes, setNotes] = useState('');
  const [vjPreference, setVjPreference] = useState('Any VJ');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const topVjs = ['Any VJ', 'VJ Junior', 'VJ Ice P', 'VJ Jingo', 'VJ Emmy', 'VJ Mark', 'VJ K-Kev'];

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!movieTitle.trim()) {
      setErrorMsg('Please enter a movie or series title.');
      return;
    }

    setSubmitting(true);

    try {
      // Attempt Firebase Firestore direct REST API or simulated cloud write
      const newRequest = {
        movieTitle: movieTitle.trim(),
        extraNotes: notes.trim(),
        vjPreference,
        userEmail: user?.email || 'guest@pearlpix.net',
        userName: user?.name || 'Guest User',
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Save locally to pearlpix_requests
      const stored = localStorage.getItem('pearlpix_user_requests');
      const requests = stored ? JSON.parse(stored) : [];
      requests.unshift(newRequest);
      localStorage.setItem('pearlpix_user_requests', JSON.stringify(requests));

      // Also submit to Firestore endpoint if available
      try {
        await fetch('https://firestore.googleapis.com/v1/projects/leoxtream-46cdf/databases/(default)/documents/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: {
              movieTitle: { stringValue: movieTitle.trim() },
              extraNotes: { stringValue: notes.trim() },
              vjPreference: { stringValue: vjPreference },
              status: { stringValue: 'pending' },
              userName: { stringValue: user?.name || 'Guest' },
              timestamp: { timestampValue: new Date().toISOString() }
            }
          })
        });
      } catch (err) {
        // Fallback gracefully if external network is restricted
        console.warn('Network sync logged locally:', err);
      }

      setSubmitting(false);
      setSubmitSuccess(true);
      setMovieTitle('');
      setNotes('');
    } catch (err: any) {
      setSubmitting(false);
      setErrorMsg(err.message || 'Failed to submit request. Please try again or message WhatsApp.');
    }
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
              <span>PearlPix Help & Requests Desk</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              How Can We Help You?
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mx-auto">
              Request missing Ugandan translated movies, report playback questions, or talk with our team directly via WhatsApp or Telegram.
            </p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex rounded-2xl bg-[#0D0D0D] p-1.5 border border-[#262626] max-w-md mx-auto">
            <button
              onClick={() => setActiveTab('request')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'request'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Movie / Series</span>
            </button>
            <button
              onClick={() => setActiveTab('channels')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'channels'
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Channels</span>
            </button>
          </div>

          {/* TAB 1: MOVIE REQUEST FORM */}
          {activeTab === 'request' && (
            <div className="max-w-xl mx-auto bg-[#0D0D0D] border border-[#262626] rounded-3xl p-6 sm:p-8 shadow-2xl relative">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1F1F1F]">
                <div className="w-10 h-10 rounded-xl bg-[#E50914]/15 text-[#E50914] flex items-center justify-center flex-shrink-0">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">Movie & Series Translation Request</h2>
                  <p className="text-xs text-[#94A3B8]">Tell us which movie you want our VJs to translate.</p>
                </div>
              </div>

              {submitSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-black text-white">Request Logged!</h3>
                  <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mx-auto">
                    Your request has been submitted to the PearlPix translation queue. We will notify you once the Luganda audio commentary is ready.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#262626] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                      Movie or Series Name <span className="text-[#E50914]">*</span>
                    </label>
                    <input
                      type="text"
                      value={movieTitle}
                      onChange={(e) => setMovieTitle(e.target.value)}
                      placeholder="e.g. Extraction 2, Snowdrop, John Wick 4"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                      Preferred VJ (Video Joker)
                    </label>
                    <select
                      value={vjPreference}
                      onChange={(e) => setVjPreference(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs focus:outline-none focus:border-[#E50914] transition-colors"
                    >
                      {topVjs.map((vj) => (
                        <option key={vj} value={vj} className="bg-[#141414] text-white">
                          {vj}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                      Additional Notes / Season Details
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="e.g., Season 2 Episode 5, English subtitle, 1080p, etc."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141414] border border-[#262626] text-white text-xs placeholder:text-[#64748B] focus:outline-none focus:border-[#E50914] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#E50914]/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Translation Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT CONTACT CHANNELS */}
          {activeTab === 'channels' && (
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
                  Fastest response for subscription activations, payment inquiries, and playback troubleshooting.
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
                  Join our official release community for daily translated movie drops and VJ schedules.
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
                  Reach out directly during working hours for customer care in Kampala and across Uganda.
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
                  For partnerships, licensing, and general inquiries.
                </p>
                <div className="mt-3 text-xs font-bold text-[#E50914]">
                  support@pearlpix.net →
                </div>
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
