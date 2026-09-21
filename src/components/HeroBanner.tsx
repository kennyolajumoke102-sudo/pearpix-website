import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Plus, Check, Star } from 'lucide-react';

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
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  if (featuredMovies.length === 0) return null;

  const current = featuredMovies[currentIndex];
  const isSaved = savedIds.has(current.id);

  // Parse title display and metadata
  const rawTitle = (current.title || 'Featured Movie').trim();
  const ratingValue = current.rating ? `${current.rating.toFixed(1)}/10` : '7.8/10';
  const yearValue = current.year || '2024';
  const genreValue = current.genre ? current.genre.split(',')[0].trim() : 'Action';
  const durationValue = current.duration || (current.isTvSeries ? 'TV Series' : '1h 52m');
  const descriptionText = current.description || 'After a devastating attack, a lone hero must fight against impossible odds while uncovering a dark conspiracy with translated commentary.';

  return (
    <div className="relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[580px] lg:h-[620px] xl:h-[660px] overflow-hidden bg-black flex flex-col justify-end -mt-2 sm:-mt-4">
      {/* Full-bleed Background Backdrop with Localized Fog */}
      <div className="absolute inset-0 z-0">
        <img
          key={current.id}
          src={current.backdropUrl || current.posterUrl}
          alt={current.title}
          className="w-full h-full object-cover object-center md:object-right transition-all duration-700 ease-out brightness-105 contrast-[1.03]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = current.posterUrl;
          }}
        />

        {/* Localized Dark Fog Gradients (leaves the right side vivid and bright) */}
        {/* Left text-backing dark fog - tapers off before the right poster subject */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-30% md:via-42% to-transparent" />
        
        {/* Bottom subtle grounding vignette for smooth transition */}
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Top header protection gradient */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-[2200px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pb-8 sm:pb-12 pt-20 flex flex-col justify-end">
        <div className="max-w-2xl">
          {/* 1. "NEW RELEASE" Red Pill Badge */}
          <div className="mb-3.5">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-[#E50914] text-white text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-lg shadow-[#E50914]/40">
              NEW RELEASE
            </span>
          </div>

          {/* 2. Main Title */}
          <h1 
            onClick={() => onSelect(current)}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.08] mb-3.5 drop-shadow-lg cursor-pointer hover:text-white/90 transition-colors"
          >
            {rawTitle}
          </h1>

          {/* 3. Metadata Row: Star Rating | Year | Genre | Duration */}
          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-200 font-medium mb-3.5">
            <span className="flex items-center gap-1 font-bold text-white">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 inline" />
              <span>{ratingValue}</span>
            </span>
            <span className="text-gray-500 font-light mx-1">|</span>
            <span>{yearValue}</span>
            <span className="text-gray-500 font-light mx-1">|</span>
            <span>{genreValue}</span>
            <span className="text-gray-500 font-light mx-1">|</span>
            <span>{durationValue}</span>
            {current.vj && (
              <>
                <span className="text-gray-500 font-light mx-1">|</span>
                <span className="text-[#E50914] font-bold">{current.vj.toUpperCase()}</span>
              </>
            )}
          </div>

          {/* 4. Description / Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-gray-300 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl drop-shadow">
            {descriptionText}
          </p>

          {/* 5. Bottom Action Buttons & Red Dots Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-1">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Watch Now Button */}
              <button
                id="hero-watch-btn"
                onClick={() => onPlay(current)}
                style={{ borderRadius: '12px' }}
                className="px-6 sm:px-8 py-3.5 rounded-[12px] bg-[#E50914] hover:bg-[#C40812] active:scale-95 text-white font-bold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-xl shadow-[#E50914]/30 cursor-pointer select-none"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
                <span>Watch Now</span>
              </button>

              {/* + My List Button */}
              <button
                id="hero-save-btn"
                onClick={() => onToggleSave(current)}
                style={{ borderRadius: '12px' }}
                className="px-6 sm:px-8 py-3.5 rounded-[12px] bg-black/60 hover:bg-white/15 border border-white/20 active:scale-95 text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer backdrop-blur-md shadow-lg select-none"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#E50914]" />
                    <span>My List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span>My List</span>
                  </>
                )}
              </button>
            </div>

            {/* 6. Slide Pagination Dots: Red Active Indicator, Centered on Mobile, Right-aligned on Desktop */}
            {featuredMovies.length > 1 && (
              <div className="flex items-center justify-center sm:justify-end gap-2.5 py-2 w-full sm:w-auto">
                {featuredMovies.slice(0, 7).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-7 h-2 rounded-full bg-[#E50914] shadow-lg shadow-[#E50914]/60'
                        : 'w-2 h-2 rounded-full bg-white/25 hover:bg-white/50'
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
