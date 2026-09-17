import React, { useState, useMemo } from 'react';
import { Movie, Episode } from '../types';
import {
  ArrowLeft,
  Play,
  Heart,
  Star,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  X,
  Film
} from 'lucide-react';
import { MovieCard } from './MovieCard';

interface DetailModalProps {
  movie: Movie | null;
  onClose: () => void;
  onPlay: (movie: Movie, episode?: Episode) => void;
  isSaved: boolean;
  onToggleSave: (movie: Movie) => void;
  allMovies?: Movie[];
  onSelectMovie?: (movie: Movie) => void;
  savedIds?: Set<string>;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  movie,
  onClose,
  onPlay,
  isSaved,
  onToggleSave,
  allMovies = [],
  onSelectMovie,
  savedIds = new Set()
}) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [expandedEpisodeIndex, setExpandedEpisodeIndex] = useState<number | null>(null);
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);
  const [showTrailerModal, setShowTrailerModal] = useState(false);

  // Compute similar titles based on matching genre or VJ
  const similarMovies = useMemo(() => {
    if (!movie) return [];
    const movieGenre = (movie.genre || '').toLowerCase();
    const movieVj = (movie.vj || '').toLowerCase();

    const filtered = allMovies.filter(m => {
      if (m.id === movie.id) return false;
      const mGenre = (m.genre || '').toLowerCase();
      const mVj = (m.vj || '').toLowerCase();
      const genreMatch = movieGenre && mGenre.includes(movieGenre);
      const vjMatch = movieVj && (mVj === movieVj || (movieVj.includes(mVj) && mVj.length > 2));
      return genreMatch || vjMatch;
    });

    // If not enough matches, pad with other movies from pool
    if (filtered.length < 6) {
      for (const m of allMovies) {
        if (m.id !== movie.id && !filtered.some(f => f.id === m.id)) {
          filtered.push(m);
        }
        if (filtered.length >= 12) break;
      }
    }

    return filtered.slice(0, 12);
  }, [movie, allMovies]);

  if (!movie) return null;

  // Filter episodes by season
  const allSeasonEpisodes = movie.isTvSeries && movie.episodes
    ? movie.episodes.filter(ep => (ep.season || 1) === selectedSeason)
    : [];

  const visibleEpisodes = showAllEpisodes
    ? allSeasonEpisodes
    : allSeasonEpisodes.slice(0, 6);

  const trailerUrl = movie.trailerPath || (movie.trailerKey ? `https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&rel=0` : null);

  return (
    <div
      id="detail-screen-fullscreen"
      className="fixed inset-0 z-50 bg-[#000000] overflow-y-auto text-white select-none animate-fadeIn"
    >
      {/* ================================================================= */}
      {/* 1. TOP FLOATING APP BAR (Back & Favorite)                         */}
      {/* ================================================================= */}
      <div className="fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <button
          id="detail-back-button"
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer pointer-events-auto backdrop-blur-md shadow-lg"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          id="detail-favorite-button-top"
          onClick={() => onToggleSave(movie)}
          className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer pointer-events-auto backdrop-blur-md shadow-lg"
          title={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isSaved
                ? 'fill-[#E50914] text-[#E50914]'
                : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* Main Content Container with max width for optimal desktop & tablet readability */}
      <div className="w-full max-w-4xl mx-auto pb-24">
        {/* =============================================================== */}
        {/* 2. BACKDROP HEADER (Matching Kotlin DetailScreen Backdrop Header) */}
        {/* =============================================================== */}
        <div className="relative w-full h-72 sm:h-96 md:h-[420px] bg-[#121212]">
          <img
            src={movie.backdropUrl || movie.posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              (e.target as HTMLImageElement).src = movie.posterUrl;
            }}
          />

          {/* Gradient Overlay: Transparent to #000000 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/50 to-transparent" />

          {/* Watch Trailer Button in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              id="detail-watch-trailer-btn"
              onClick={() => {
                if (trailerUrl) {
                  setShowTrailerModal(true);
                } else {
                  onPlay(movie);
                }
              }}
              className="px-5 py-2.5 rounded-full bg-black/75 hover:bg-black/90 border border-white/20 hover:border-[#E50914] text-white flex items-center gap-2 font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
            >
              <PlayCircle className="w-5 h-5 text-[#E50914] fill-[#E50914]/20" />
              <span>Watch Trailer</span>
            </button>
          </div>
        </div>

        {/* =============================================================== */}
        {/* 3. MOVIE INFORMATION (Matching Kotlin Movie Information)         */}
        {/* =============================================================== */}
        <div className="px-4 sm:px-6 pt-2 space-y-4">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
            {movie.title}
          </h1>

          {/* Row 1: Rating Badge, Year, Duration */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] font-bold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
            </div>
            <span className="text-[#94A3B8] font-medium">{movie.year || '2024'}</span>
            <span className="text-[#4B5563]">•</span>
            <span className="text-[#94A3B8] font-medium">{movie.duration || (movie.isTvSeries ? 'TV Series' : '1h 45m')}</span>
          </div>

          {/* Row 2: Genre badge, VJ badge, Country */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            {movie.genre && (
              <div className="px-2.5 py-1 rounded bg-[#121212] border border-[#262626] text-white font-bold">
                {movie.genre}
              </div>
            )}
            {movie.vj && (
              <div className="px-2.5 py-1 rounded bg-[#E50914]/15 border border-[#E50914]/30 text-[#E50914] font-bold">
                {movie.vj.toUpperCase()}
              </div>
            )}
            {movie.country && (
              <span className="text-[#94A3B8] text-xs font-medium ml-1">
                Country: {movie.country}
              </span>
            )}
          </div>

          {/* ============================================================= */}
          {/* 4. PRIMARY ACTIONS ROW (Play Now and Favorite)                */}
          {/* ============================================================= */}
          <div className="flex items-center gap-3 pt-2">
            {/* Play Now Button */}
            <button
              id="detail-play-now-btn"
              onClick={() => onPlay(movie)}
              className="flex-1 h-12 rounded-xl bg-[#E50914] hover:bg-[#B80710] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#E50914]/25 transition-transform active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play Now</span>
            </button>

            {/* Favorite / Watchlist Button */}
            <button
              id="detail-save-btn"
              onClick={() => onToggleSave(movie)}
              className="w-12 h-12 rounded-xl bg-[#121212] hover:bg-[#1F1F1F] border border-[#262626] flex items-center justify-center transition-colors cursor-pointer"
              title={isSaved ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isSaved
                    ? 'fill-[#E50914] text-[#E50914]'
                    : 'text-white'
                }`}
              />
            </button>
          </div>

          {/* ============================================================= */}
          {/* 5. CAST SECTION (Matching Kotlin Cast Row)                     */}
          {/* ============================================================= */}
          {movie.cast && movie.cast.length > 0 && (
            <div className="pt-4">
              <h3 className="text-base sm:text-lg font-bold text-white mb-3">Cast</h3>
              <div className="flex items-start gap-4 overflow-x-auto no-scrollbar py-1">
                {movie.cast.map((actor, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-none w-20">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#E50914]/30 bg-[#121212] shadow-md flex items-center justify-center">
                      {actor.profileUrl ? (
                        <img
                          src={actor.profileUrl}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#E50914]">
                          {actor.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-white text-center line-clamp-2 mt-1.5 leading-tight">
                      {actor.name}
                    </span>
                    {actor.character && (
                      <span className="text-[9px] text-[#94A3B8] text-center line-clamp-2 leading-tight">
                        {actor.character}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* 6. OVERVIEW SECTION (Matching Kotlin Overview)                 */}
          {/* ============================================================= */}
          <div className="pt-2">
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Overview</h3>
            <p className="text-sm text-[#CBD5E1] leading-relaxed">
              {movie.description
                ? isOverviewExpanded || movie.description.length <= 160
                  ? movie.description
                  : `${movie.description.slice(0, 160)}...`
                : 'No synopsis available for this title.'}
            </p>
            {movie.description && movie.description.length > 160 && (
              <button
                onClick={() => setIsOverviewExpanded(!isOverviewExpanded)}
                className="mt-1 text-xs font-bold text-[#E50914] hover:underline cursor-pointer"
              >
                {isOverviewExpanded ? 'Read Less' : 'Read More'}
              </button>
            )}
          </div>

          {/* ============================================================= */}
          {/* 7. TV SERIES EPISODES SECTION (Matching Kotlin SeriesSection)  */}
          {/* ============================================================= */}
          {movie.isTvSeries && (
            <div className="pt-4 border-t border-[#262626] space-y-4">
              {/* Season Selector Row */}
              <div className="flex items-center justify-between">
                {movie.numberOfSeasons && movie.numberOfSeasons > 1 ? (
                  <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-xl border border-[#262626]">
                    {Array.from({ length: movie.numberOfSeasons }, (_, i) => i + 1).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSeason(s)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedSeason === s
                            ? 'bg-[#E50914] text-white shadow'
                            : 'text-[#94A3B8] hover:text-white'
                        }`}
                      >
                        Season {s}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-white">Season 1</span>
                )}

                <span className="text-xs text-[#94A3B8]">
                  {allSeasonEpisodes.length} Episodes
                </span>
              </div>

              {/* Episodes List (WITHOUT download button) */}
              {allSeasonEpisodes.length > 0 ? (
                <div className="space-y-2.5">
                  {visibleEpisodes.map((ep, idx) => {
                    const isExpanded = expandedEpisodeIndex === idx;
                    const epNumber = ep.episodeNumber || idx + 1;

                    return (
                      <div
                        key={idx}
                        className="bg-[#121212] border border-[#262626] rounded-xl p-3 flex flex-col gap-2.5 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* Thumbnail with EP Badge */}
                          <div
                            onClick={() => onPlay(movie, ep)}
                            className="relative w-[110px] h-[68px] rounded-lg overflow-hidden bg-neutral-800 flex-none cursor-pointer group"
                          >
                            <img
                              src={ep.thumbnail || movie.backdropUrl || movie.posterUrl}
                              alt={ep.title || `Episode ${epNumber}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = movie.posterUrl;
                              }}
                            />
                            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-black text-white">
                              EP {epNumber}
                            </div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                          </div>

                          {/* Episode Title & Info */}
                          <div
                            onClick={() => onPlay(movie, ep)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <h4 className="text-sm font-bold text-white line-clamp-2 hover:text-[#E50914] transition-colors">
                              {ep.title || `Episode ${epNumber}`}
                            </h4>
                            <span className="text-[11px] text-[#94A3B8] mt-0.5 block">
                              {ep.duration || '45m'}
                            </span>
                          </div>

                          {/* Actions: Play and Expand Overview */}
                          <div className="flex items-center gap-1.5 flex-none">
                            <button
                              onClick={() => onPlay(movie, ep)}
                              className="w-9 h-9 rounded-lg bg-[#E50914] hover:bg-[#B80710] text-white flex items-center justify-center transition-colors cursor-pointer shadow"
                              title="Play Episode"
                            >
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </button>

                            <button
                              onClick={() => setExpandedEpisodeIndex(isExpanded ? null : idx)}
                              className="w-8 h-8 rounded-lg text-[#94A3B8] hover:text-white flex items-center justify-center cursor-pointer"
                              title="Toggle synopsis"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Expanded Overview */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-[#262626]/60 text-xs text-[#CBD5E1] leading-relaxed">
                            {ep.overview ||
                              `Episode ${epNumber} of ${movie.title} with Luganda translation by ${movie.vj}.`}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* See More Episodes Toggle */}
                  {allSeasonEpisodes.length > 6 && (
                    <button
                      onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                      className="w-full py-2 text-center text-xs font-bold text-[#E50914] hover:underline flex items-center justify-center gap-1 cursor-pointer pt-1"
                    >
                      <span>
                        {showAllEpisodes
                          ? 'Show Less'
                          : `See More Episodes (${allSeasonEpisodes.length - 6})`}
                      </span>
                      {showAllEpisodes ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#121212] border border-[#262626] text-center text-xs text-[#94A3B8]">
                  Full Season available for instant streaming. Click "Play Now" above.
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* 8. SIMILAR TITLES SECTION                                     */}
          {/* ============================================================= */}
          {similarMovies.length > 0 && (
            <div className="pt-6 border-t border-[#262626]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#E50914]" />
                  <span>Similar Titles</span>
                </h3>
                <span className="text-xs text-[#94A3B8]">
                  {movie.genre || movie.vj}
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {similarMovies.map(simMovie => (
                  <MovieCard
                    key={simMovie.id}
                    movie={simMovie}
                    className="w-full"
                    onSelect={(m) => {
                      if (onSelectMovie) {
                        onSelectMovie(m);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    onPlayQuick={() => onPlay(simMovie)}
                    isSaved={savedIds.has(simMovie.id)}
                    onToggleSave={onToggleSave}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* 9. TRAILER MODAL (YouTube embed overlay)                           */}
      {/* ================================================================= */}
      {showTrailerModal && trailerUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowTrailerModal(false)}
        >
          <div
            className="relative w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden border border-[#262626] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {trailerUrl.includes('youtube.com') || trailerUrl.includes('youtu.be') ? (
              <iframe
                src={trailerUrl}
                title="Movie Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={trailerUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
