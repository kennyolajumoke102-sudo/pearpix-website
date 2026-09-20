import React from 'react';
import { Movie } from '../types';
import { Star, Play, Bookmark, Check } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onPlayQuick?: (movie: Movie) => void;
  isSaved?: boolean;
  onToggleSave?: (movie: Movie) => void;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelect,
  onPlayQuick,
  isSaved = false,
  onToggleSave,
  className
}) => {
  return (
    <div
      id={`movie-card-${movie.id}`}
      onClick={() => onSelect(movie)}
      className={`group relative cursor-pointer select-none transition-transform duration-300 hover:scale-[1.03] ${
        className || 'flex-none w-28 sm:w-36 md:w-44 lg:w-48'
      }`}
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full rounded-lg sm:rounded-xl overflow-hidden bg-[#121212] border border-[#262626] shadow-md shadow-black/40">
        <img
          src={movie.posterUrl || movie.backdropUrl || '/logo.png'}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-1.5 left-1.5 right-1.5 sm:top-2 sm:left-2 sm:right-2 flex items-center justify-between pointer-events-none">
          {/* VJ Tag */}
          <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider bg-[#000000]/90 backdrop-blur-md text-[#E50914] border border-[#E50914]/30 shadow">
            {movie.vj.replace(/^VJ\s+/i, '') || 'VJ'}
          </span>

          {/* Rating Badge */}
          <span className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded text-[8.5px] sm:text-[10px] font-bold bg-[#121212]/90 backdrop-blur-md text-white border border-[#262626] shadow">
            <Star className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-[#E50914] text-[#E50914]" />
            {movie.rating.toFixed(1)}
          </span>
        </div>

        {/* Series Badge */}
        {movie.isTvSeries && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 pointer-events-none">
            <span className="px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase bg-[#FF3B30] text-white shadow">
              Series
            </span>
          </div>
        )}

        {/* Hover Overlay with Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <div className="flex items-center gap-2">
            {onPlayQuick && (
              <button
                id={`quick-play-${movie.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayQuick(movie);
                }}
                className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Play
              </button>
            )}
            {onToggleSave && (
              <button
                id={`save-btn-${movie.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(movie);
                }}
                className="p-1.5 rounded-lg bg-[#1F1F1F]/90 hover:bg-[#2A2A2A] text-white border border-[#333333] transition-colors cursor-pointer"
                title={isSaved ? "Remove from My List" : "Add to My List"}
              >
                {isSaved ? (
                  <Check className="w-3.5 h-3.5 text-[#E50914]" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info Under Poster */}
      <div className="mt-2 px-0.5">
        <h4 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
          {movie.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#94A3B8]">
          <span>{movie.year}</span>
          <span>•</span>
          <span className="truncate">{movie.genre.split(',')[0]}</span>
        </div>
      </div>
    </div>
  );
};
