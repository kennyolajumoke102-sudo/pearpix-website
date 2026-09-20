import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Film, 
  Mic2, 
  HelpCircle, 
  CreditCard, 
  Send, 
  CheckCircle2, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { PearlUser } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: PearlUser | null;
  initialType?: 'movie_request' | 'vj_request' | 'payment_issue' | 'support' | 'other';
  initialMovieTitle?: string;
  initialSubject?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  user,
  initialType = 'movie_request',
  initialMovieTitle,
  initialSubject
}) => {
  const [name, setName] = useState(user?.name || '');
  const [contactInfo, setContactInfo] = useState(user?.email || user?.phone || '');
  const [requestType, setRequestType] = useState(initialType);
  const [selectedVj, setSelectedVj] = useState('VJ Junior');
  const [subject, setSubject] = useState(initialSubject || (initialMovieTitle ? `Request for ${initialMovieTitle}` : ''));
  const [message, setMessage] = useState('');
  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo || !message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const ticketId = 'PP-' + Math.floor(100000 + Math.random() * 900000);
      setSubmittedTicket(ticketId);
    }, 700);
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

        {submittedTicket ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white">Message Received!</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto leading-relaxed">
              Thank you for contacting the PearlPix team. We have received your request and our support desk is on it.
            </p>

            <div className="p-3 rounded-xl bg-[#161616] border border-[#262626] font-mono text-xs text-[#E50914] max-w-xs mx-auto">
              Ticket ID: <span className="text-white font-bold">{submittedTicket}</span>
            </div>

            <div className="pt-3">
              <button
                onClick={() => { setSubmittedTicket(null); onClose(); }}
                className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs uppercase tracking-wider shadow"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] text-xs font-bold uppercase mb-2">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>PearlPix Customer Care & Requests</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                How Can We Help You?
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1">
                Request a translated movie, ask about VIP activation, or get technical help.
              </p>
            </div>

            {/* Direct Quick Chat Links (Uganda WhatsApp & Telegram) */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <a
                href="https://wa.me/256700000000?text=Hello%20PearlPix%20Team"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Live Chat</span>
              </a>

              <a
                href="https://t.me/pearlpix_official"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-sky-950/40 hover:bg-sky-950/70 border border-sky-800/60 text-sky-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Telegram Support</span>
              </a>
            </div>

            {/* Contact Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Inquiry / Request Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setRequestType('movie_request')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      requestType === 'movie_request'
                        ? 'bg-[#E50914] text-white border-[#E50914]'
                        : 'bg-[#141414] text-[#94A3B8] border-[#262626] hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Movie Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('vj_request')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      requestType === 'vj_request'
                        ? 'bg-[#E50914] text-white border-[#E50914]'
                        : 'bg-[#141414] text-[#94A3B8] border-[#262626] hover:text-white'
                    }`}
                  >
                    <Mic2 className="w-3.5 h-3.5" />
                    <span>VJ Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('payment_issue')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      requestType === 'payment_issue'
                        ? 'bg-[#E50914] text-white border-[#E50914]'
                        : 'bg-[#141414] text-[#94A3B8] border-[#262626] hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Help</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequestType('support')}
                    className={`py-2 px-2 rounded-xl border text-center font-bold flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                      requestType === 'support'
                        ? 'bg-[#E50914] text-white border-[#E50914]'
                        : 'bg-[#141414] text-[#94A3B8] border-[#262626] hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Tech Help</span>
                  </button>
                </div>
              </div>

              {/* VJ Selector if VJ or Movie request */}
              {(requestType === 'vj_request' || requestType === 'movie_request') && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Preferred Ugandan Voice Over (VJ)
                  </label>
                  <select
                    value={selectedVj}
                    onChange={(e) => setSelectedVj(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white focus:outline-none focus:border-[#E50914]"
                  >
                    <option value="VJ Junior">VJ Junior (Action & Drama Master)</option>
                    <option value="VJ Ice P">VJ Ice P (Blockbusters & Sci-Fi)</option>
                    <option value="VJ Jingo">VJ Jingo (Epic Classics & Crime)</option>
                    <option value="VJ Emmy">VJ Emmy (Martial Arts & Thrillers)</option>
                    <option value="VJ Mark">VJ Mark (Animation & Family)</option>
                    <option value="VJ K-Kev">VJ K-Kev (Modern Blockbusters)</option>
                    <option value="Any Available VJ">Any Available VJ</option>
                  </select>
                </div>
              )}

              {/* Name & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0771234567 or email"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914]"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Subject / Movie Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Requesting Mission Impossible 7 (VJ Junior)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1">
                  Message / Details
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us movie year, season/episode, or describe your issue with payment / streaming..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#E50914] resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending Ticket...' : 'Submit Request'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
