import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Check } from 'lucide-react';

interface HeroBannerProps {
  featuredMovies: Movie[];
  onPlay: (movie: Movie) => void;
  onSelect: (movie: Movie) => void;
  savedIds: Set<string>;
  onToggleSave: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  featuredMovies,
  onPlay,
  onSelect,
  savedIds,
  onToggleSave
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const current = featuredMovies[currentIndex];
  const isSaved = savedIds.has(current.id);

  // Parse title and VJ to match "TITLE BY VJ [NAME]" with VJ highlighted in red
  const rawTitle = current.title.trim();
  let whitePart = rawTitle;
  let redPart = '';

  const matchByVj = rawTitle.match(/^(.*?)(?:\s+BY\s+)(VJ\s+[A-Za-z0-9_.-]+.*)$/i);
  const matchVj = rawTitle.match(/^(.*?)(?:\s+[-–—|:]\s*)?(VJ\s+[A-Za-z0-9_.-]+.*)$/i);

  if (matchByVj) {
    whitePart = `${matchByVj[1].trim()} BY `;
    redPart = matchByVj[2].toUpperCase().trim();
  } else if (matchVj) {
    whitePart = `${matchVj[1].trim()} BY `;
    redPart = matchVj[2].toUpperCase().trim();
  } else if (current.vj) {
    const cleanVj = current.vj.trim();
    const vjFormatted = cleanVj.toUpperCase().startsWith('VJ') ? cleanVj.toUpperCase() : `VJ ${cleanVj.toUpperCase()}`;
    whitePart = `${rawTitle} BY `;
    redPart = vjFormatted;
  }

  return (
    <div className="relative w-full h-[52vh] sm:h-[62vh] md:h-[70vh] max-h-[720px] overflow-hidden bg-[#000000]">
      {/* Background Backdrop with Gradient Fades */}
      <div className="absolute inset-0">
        <img
          src={current.backdropUrl || current.posterUrl}
          alt={current.title}
          className="w-full h-full object-cover object-top transition-opacity duration-700"
          onError={(e) => {
            (e.target as HTMLImageElement).src = current.posterUrl;
          }}
        />
        {/* Cinematic Vignette Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000000]/80 to-transparent w-full md:w-3/4" />
      </div>

      {/* Content */}
      <div className="relative h-full w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 flex flex-col justify-end pb-8 sm:pb-12 z-10">
        <div className="max-w-2xl">
          {/* "NEW RELEASE" Red Label */}
          <div className="text-[#E50914] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2 drop-shadow-sm">
            NEW RELEASE
          </div>

          {/* Title with VJ highlighted in Red */}
          <h1 
            onClick={() => onSelect(current)}
            className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight uppercase drop-shadow-md cursor-pointer hover:opacity-95 transition-opacity mb-4 sm:mb-6"
          >
            <span className="text-white">{whitePart.toUpperCase()}</span>
            {redPart && (
              <span className="text-[#E50914]">{redPart}</span>
            )}
          </h1>

          {/* Action Buttons & Centered Indicators Wrapper */}
          <div className="w-fit flex flex-col items-center">
            {/* Action Buttons as requested */}
            <div className="flex items-center gap-3">
              {/* Primary Red "Watch Now" Button */}
              <button
                id="hero-watch-btn"
                onClick={() => onPlay(current)}
                className="px-6 sm:px-7 py-3 rounded-[12px] bg-[#E50914] hover:bg-[#C40812] text-white font-semibold text-sm sm:text-base flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
                <span>Watch Now</span>
              </button>

              {/* Secondary Dark "+ My List" Button */}
              <button
                id="hero-save-btn"
                onClick={() => onToggleSave(current)}
                className="px-6 sm:px-7 py-3 rounded-[12px] bg-[#20222C] hover:bg-[#2A2E3B] border border-[#2F3443] text-white font-semibold text-sm sm:text-base flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#E50914]" />
                    <span>My List</span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-bold leading-none">+</span>
                    <span>My List</span>
                  </>
                )}
              </button>
            </div>

            {/* Slide Indicator Dots centered directly under the buttons */}
            {featuredMovies.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
                {featuredMovies.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-8 sm:w-10 h-2 bg-[#E50914] rounded-full'
                        : 'w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#2F3443] hover:bg-[#464D61]'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
