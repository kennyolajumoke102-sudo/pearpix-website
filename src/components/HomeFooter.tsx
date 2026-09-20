import React from 'react';
import { ChevronRight } from 'lucide-react';

interface HomeFooterProps {
  onNavigateTab: (tab: string) => void;
  onSelectVj?: (vj: string) => void;
  onSelectGenre?: (genre: string) => void;
}

export const HomeFooter: React.FC<HomeFooterProps> = ({
  onNavigateTab,
  onSelectVj,
  onSelectGenre,
}) => {
  const topVjs = ['VJ Junior', 'VJ Ice P', 'VJ Jingo', 'VJ Emmy', 'VJ Mark', 'VJ K-Kev'];
  const popularGenres = ['Action', 'Korean Dramas', 'Nollywood', 'Adventure', 'Sci-Fi', 'Horror'];

  return (
    <footer className="w-full bg-[#080808] border-t border-[#1F1F1F] mt-12 pt-12 pb-28 sm:pb-16 text-slate-400">
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Brand & Mission Statement Block */}
        <div className="max-w-4xl mb-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#E50914] flex items-center justify-center font-black text-white text-base shadow-md">
              P
            </div>
            <span className="text-xl sm:text-2xl font-black text-white tracking-wider">
              PEARL<span className="text-[#E50914]">PIX</span>
            </span>
          </div>

          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed font-normal">
            PearlPix is Uganda’s premier digital home for Luganda translated movies, authentic Ugandan cinema, 
            VJ commentary, and binge-worthy global series. Stream your favorite Hollywood, Bollywood, Nollywood, 
            and Asian titles interpreted by legendary video jokers including VJ Junior, VJ Ice P, VJ Emmy, VJ Jingo, 
            and more — anytime, anywhere, on any screen.
          </p>
        </div>

        {/* Multi-column Navigation Grids */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 pb-10 border-b border-[#1F1F1F]">
          {/* Column 1: Browse Navigation */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
              Browse
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-[#E50914]" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('movies');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-[#E50914]" />
                  Luganda Movies
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('movies');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-[#E50914]" />
                  Movies Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('series');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-[#E50914]" />
                  TV Shows & Series
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('categories');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-[#E50914]" />
                  VJs Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateTab('mylist');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronRight className="w-3 h-3 text-[#E50914]" />
                  My Watchlist
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Top Video Jokers (VJs) */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
              Top VJs
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {topVjs.map((vj) => (
                <li key={vj}>
                  <button
                    onClick={() => {
                      if (onSelectVj) onSelectVj(vj);
                      else onNavigateTab('categories');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#E50914] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
                    {vj}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Genres */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
              Popular Genres
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {popularGenres.map((genre) => (
                <li key={genre}>
                  <button
                    onClick={() => {
                      if (onSelectGenre) onSelectGenre(genre);
                      else onNavigateTab('categories');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-[#E50914] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
                    {genre}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Platform Features & Experience */}
          <div>
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
              Streaming Quality
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#94A3B8]">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Multi-Server High Speed Video</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Luganda Translated Voiceovers</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Direct Movie & Episode Downloads</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Optimized for Low-Bandwidth Data</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Continuous Resumed Playback</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Rights & Information Row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} PearlPix Entertainment. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => { onNavigateTab('categories'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Filter by VJ & Genre
            </span>
            <span className="text-[#262626]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => { onNavigateTab('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Request & Support
            </span>
            <span className="text-[#262626]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => { onNavigateTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              About Us
            </span>
            <span className="text-[#262626]">•</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={() => { onNavigateTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              Privacy Policy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
