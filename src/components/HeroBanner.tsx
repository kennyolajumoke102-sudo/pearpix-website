import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Info, Bookmark, Check, Star, Volume2 } from 'lucide-react';

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
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 z-10">
        <div className="max-w-2xl">
          {/* VJ Pill & Series Badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-[#E50914] text-white tracking-wider shadow">
              <Volume2 className="w-3.5 h-3.5" />
              {current.vj}
            </span>
            {current.isTvSeries && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-[#FF3B30] text-white shadow">
                TV Series
              </span>
            )}
            <span className="flex items-center gap-1 text-xs font-bold text-white bg-[#121212]/90 px-2 py-0.5 rounded-full border border-[#262626]">
              <Star className="w-3 h-3 fill-[#E50914] text-[#E50914]" />
              {current.rating.toFixed(1)}
            </span>
            <span className="text-xs text-[#94A3B8] font-medium">
              {current.year} • {current.duration}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {current.title}
          </h1>

          {/* Synopsis */}
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-[#CBD5E1] line-clamp-2 sm:line-clamp-3 leading-relaxed drop-shadow max-w-xl">
            {current.description}
          </p>

          {/* Action Buttons */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
            <button
              id="hero-watch-btn"
              onClick={() => onPlay(current)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-[#E50914]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              Watch Now
            </button>

            <button
              id="hero-info-btn"
              onClick={() => onSelect(current)}
              className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#1F1F1F]/90 hover:bg-[#2A2A2A] text-white font-semibold text-sm sm:text-base flex items-center gap-2 border border-[#333333] backdrop-blur-sm transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#94A3B8]" />
              Details
            </button>

            <button
              id="hero-save-btn"
              onClick={() => onToggleSave(current)}
              className="p-2.5 sm:p-3 rounded-xl bg-[#1F1F1F]/90 hover:bg-[#2A2A2A] text-white border border-[#333333] backdrop-blur-sm transition-all cursor-pointer"
              title={isSaved ? "Remove from My List" : "Add to My List"}
            >
              {isSaved ? (
                <Check className="w-5 h-5 text-[#E50914]" />
              ) : (
                <Bookmark className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        {featuredMovies.length > 1 && (
          <div className="flex items-center gap-2 mt-6">
            {featuredMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 bg-[#E50914]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
