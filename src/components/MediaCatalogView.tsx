import React, { useState, useEffect, useRef } from 'react';
import { Movie } from '../types';
import { fetchLiveMedia } from '../api';
import { MovieCard } from './MovieCard';
import { Loader2, Film, Tv } from 'lucide-react';

interface MediaCatalogViewProps {
  type: 'movie' | 'series';
  onSelectMovie: (movie: Movie) => void;
  onPlayQuick: (movie: Movie) => void;
  savedIds: Set<string>;
  onToggleSave: (movie: Movie) => void;
  cachedPool?: Movie[];
}

export const MediaCatalogView: React.FC<MediaCatalogViewProps> = ({
  type,
  onSelectMovie,
  onPlayQuick,
  savedIds,
  onToggleSave,
  cachedPool = []
}) => {
  // Pre-filter cached pool for instant render
  const initialPool = cachedPool.filter(m => (type === 'movie' ? !m.isTvSeries : m.isTvSeries));

  const [items, setItems] = useState<Movie[]>(initialPool);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(initialPool.length === 0);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const isMountedRef = useRef<boolean>(true);

  // Filter query for PocketBase media collection
  const filterQuery =
    type === 'movie'
      ? '(contentType = "movie" || (contentType != "series" && type !~ "series"))'
      : '(contentType = "series" || pearlpixType = "series" || type ~ "latest_series" || type ~ "mini_series") && contentType != "movie"';

  useEffect(() => {
    isMountedRef.current = true;
    let active = true;

    async function loadFirstPage() {
      if (initialPool.length === 0) {
        setLoading(true);
      }
      setPage(1);
      setHasMore(true);

      try {
        const results = await fetchLiveMedia(1, 24, filterQuery);
        if (!active) return;

        // Filter appropriately just in case
        const valid = results.filter(m => (type === 'movie' ? !m.isTvSeries : m.isTvSeries));
        if (valid.length > 0) {
          setItems(valid);
          if (valid.length < 24) {
            setHasMore(false);
          }
        } else if (initialPool.length > 0) {
          setItems(initialPool);
          setHasMore(false);
        } else {
          setItems([]);
          setHasMore(false);
        }
      } catch (err) {
        console.error('Error fetching catalog:', err);
        if (initialPool.length > 0 && active) {
          setItems(initialPool);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFirstPage();

    return () => {
      active = false;
      isMountedRef.current = false;
    };
  }, [type]);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const results = await fetchLiveMedia(nextPage, 24, filterQuery);
      const valid = results.filter(m => (type === 'movie' ? !m.isTvSeries : m.isTvSeries));

      if (valid.length === 0) {
        setHasMore(false);
      } else {
        setItems(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newOnes = valid.filter(m => !existingIds.has(m.id));
          if (newOnes.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...newOnes];
        });
        setPage(nextPage);
        if (valid.length < 24) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error loading more catalog media:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const title = type === 'movie' ? 'Movies' : 'TV Series';
  const Icon = type === 'movie' ? Film : Tv;

  return (
    <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-4 pb-28 min-h-[85vh]">
      {/* Page Header (Clean, no filters, no title count subtitle) */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-3 border-b border-[#262626]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#121212] border border-[#262626] flex items-center justify-center text-[#E50914] shadow-sm">
            <Icon className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {title}
          </h2>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#E50914] mx-auto mb-3" />
          <p className="text-xs text-[#94A3B8]">Loading translated {title.toLowerCase()}...</p>
        </div>
      ) : items.length > 0 ? (
        <div>
          {/* 3 Grid View on mobile as requested, adapting to fill wide desktop screens */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8">
            {items.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                className="w-full"
                onSelect={onSelectMovie}
                onPlayQuick={onPlayQuick}
                isSaved={savedIds.has(movie.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>

          {/* Load More Action */}
          {hasMore && (
            <div className="mt-10 mb-6 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 rounded-xl bg-[#121212] hover:bg-[#1F1F1F] text-white border border-[#262626] hover:border-[#E50914] font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-lg"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                    <span>Loading More {title}...</span>
                  </>
                ) : (
                  <span>Load More {title}</span>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-24 text-center bg-[#121212]/60 rounded-2xl border border-[#262626] p-6 max-w-md mx-auto">
          <Icon className="w-10 h-10 text-[#94A3B8] mx-auto mb-3 opacity-60" />
          <h4 className="text-base font-bold text-white mb-1">No {title} Found</h4>
          <p className="text-xs text-[#94A3B8]">
            Check back soon as new translated titles are added regularly.
          </p>
        </div>
      )}
    </div>
  );
};
