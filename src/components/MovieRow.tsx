import React, { useRef } from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { TrendingCard } from './TrendingCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  onPlayQuick?: (movie: Movie) => void;
  savedIds: Set<string>;
  onToggleSave: (movie: Movie) => void;
  onViewAll?: () => void;
}

export const MovieRow: React.FC<MovieRowProps> = ({
  title,
  movies,
  onSelect,
  onPlayQuick,
  savedIds,
  onToggleSave,
  onViewAll
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const isTrending = title.trim().toUpperCase() === 'TRENDING';

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) return null;

  // Clean title to remove any subtitles (e.g. " - Top-rated thriller blockbusters" or ": Translated with passion by VJ ULIO")
  const displayTitle = (title || '')
    .split(/\s+[-:|–—]\s+/)[0]
    .replace(/\s*\([^)]*\)$/, '')
    .trim() || title;

  return (
    <section className="relative my-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
          {displayTitle}
        </h3>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-[13px] font-bold text-[#E50914] hover:text-[#ff3b44] transition-colors cursor-pointer py-1 px-2"
          >
            See More
          </button>
        )}
      </div>

      {/* Row container with chevron navigators */}
      <div className="group/row relative">
        {/* Left scroll chevron */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-14 bg-[#121212]/90 hover:bg-[#1F1F1F] text-white rounded-r-lg flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/row:opacity-100 transition-all disabled:opacity-0 shadow-lg border border-l-0 border-[#262626] cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable track */}
        <div
          ref={rowRef}
          className="flex items-start gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth"
        >
          {movies.map((movie, index) =>
            isTrending ? (
              <TrendingCard
                key={`trending_${movie.id}_${index}`}
                movie={movie}
                rank={index + 1}
                onClick={() => onSelect(movie)}
              />
            ) : (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={onSelect}
                onPlayQuick={onPlayQuick}
                isSaved={savedIds.has(movie.id)}
                onToggleSave={onToggleSave}
              />
            )
          )}
        </div>

        {/* Right scroll chevron */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-14 bg-[#121212]/90 hover:bg-[#1F1F1F] text-white rounded-l-lg flex items-center justify-center backdrop-blur-sm opacity-0 group-hover/row:opacity-100 transition-all disabled:opacity-0 shadow-lg border border-r-0 border-[#262626] cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
