import React from 'react';
import { Movie } from '../types';
import { Star } from 'lucide-react';

interface TrendingCardProps {
  movie: Movie;
  rank: number;
  onClick: () => void;
}

export const TrendingCard: React.FC<TrendingCardProps> = ({ movie, rank, onClick }) => {
  const rankBgColor =
    rank === 1
      ? 'bg-[#E50914]'
      : rank === 2
        ? 'bg-[#3B82F6]'
        : rank === 3
          ? 'bg-[#EC4899]'
          : 'bg-[#333333]';

  return (
    <div
      onClick={onClick}
      className="w-[100px] sm:w-[125px] md:w-[135px] flex-none cursor-pointer group select-none transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="flex flex-col">
        {/* Poster Container */}
        <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-[#121212] border border-[#262626] shadow-md">
          <img
            src={movie.posterUrl || movie.backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80';
            }}
          />

          {/* Bottom Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Rank Badge */}
          <div
            className={`absolute top-0 left-0 px-2 py-0.5 rounded-tl-lg rounded-br-md text-[11px] font-black text-white ${rankBgColor} shadow-md`}
          >
            {rank}
          </div>

          {/* VJ Tag */}
          {movie.vj && (
            <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#14532D] text-[9px] font-bold text-white shadow">
              {movie.vj.toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-1.5">
          <h4
            className="text-[13px] font-bold text-white truncate group-hover:text-[#E50914] transition-colors"
            title={movie.title}
          >
            {movie.title}
          </h4>

          <div className="flex items-center justify-between mt-0.5 text-[11px]">
            <span className="text-[#94A3B8]">{movie.year || '2024'}</span>
            <div className="flex items-center gap-1 text-[#E50914] font-bold text-[10px]">
              <Star className="w-3 h-3 fill-current" />
              <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
