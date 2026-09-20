import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { VJ_LIST, GENRES_LIST, getMoviesByCategory } from '../api';
import { MovieCard } from './MovieCard';
import { ArrowLeft, Loader2, Film, Search } from 'lucide-react';

interface CategoriesTabProps {
  onSelectMovie: (movie: Movie) => void;
  onPlayQuick: (movie: Movie) => void;
  savedIds: Set<string>;
  onToggleSave: (movie: Movie) => void;
  initialVj?: string | null;
  initialGenre?: string | null;
  initialTitle?: string | null;
  onClearTarget?: () => void;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  onSelectMovie,
  onPlayQuick,
  savedIds,
  onToggleSave,
  initialVj = null,
  initialGenre = null,
  initialTitle = null,
  onClearTarget
}) => {
  // 0 = VJ CATEGORY, 1 = GENRE
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(initialGenre ? 1 : 0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialTitle || initialVj || initialGenre || null
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  // Gallery (CategoryScreen) state
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Sync initial props
  useEffect(() => {
    if (initialTitle) {
      setSelectedCategory(initialTitle);
    } else if (initialVj) {
      setSelectedCategory(initialVj);
      setSelectedTabIndex(0);
    } else if (initialGenre) {
      setSelectedCategory(initialGenre);
      setSelectedTabIndex(1);
    } else {
      setSelectedCategory(null);
    }
  }, [initialVj, initialGenre, initialTitle]);

  const selectCategoryWithHistory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    try {
      window.history.pushState({ pearlpix: true, view: 'category', title: categoryName }, '');
    } catch {
      // ignore
    }
  };

  const handleBack = () => {
    if (window.history.state?.pearlpix && window.history.state.view === 'category') {
      window.history.back();
    } else {
      setSelectedCategory(null);
      onClearTarget?.();
    }
  };

  // Load movies when selectedCategory or contentTypeFilter changes
  useEffect(() => {
    if (!selectedCategory) {
      setMovies([]);
      return;
    }

    let isMounted = true;
    async function loadInitial() {
      setLoading(true);
      setPage(1);
      setHasMore(true);

      try {
        const results = await getMoviesByCategory(selectedCategory!, 1, contentTypeFilter);
        if (isMounted) {
          setMovies(results);
          if (results.length === 0) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error('Error fetching category movies:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, contentTypeFilter]);

  // Load more pages
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || !selectedCategory) return;
    const nextPage = page + 1;
    setLoadingMore(true);

    try {
      const results = await getMoviesByCategory(selectedCategory, nextPage, contentTypeFilter);
      if (results.length === 0) {
        setHasMore(false);
      } else {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newItems = results.filter(m => !existingIds.has(m.id));
          if (newItems.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...newItems];
        });
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more category movies:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filter lists by search query if user searches
  const filteredVjs = VJ_LIST.filter(vj =>
    vj.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGenres = GENRES_LIST.filter(genre =>
    genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =========================================================================
  // VIEW: CATEGORY SCREEN (When a category is selected)
  // Directly mirrors Kotlin CategoryScreen.kt
  // =========================================================================
  if (selectedCategory) {
    return (
      <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-4 pb-28 min-h-[80vh]">
        {/* Top App Bar with Back & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-xl bg-[#121212] hover:bg-[#1F1F1F] text-white border border-[#262626] transition-colors cursor-pointer"
              title="Back to Categories"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                {selectedCategory}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                {movies.length > 0 ? `${movies.length} titles loaded` : 'Ugandan translated cinema'}
              </p>
            </div>
          </div>

          {/* Content Type Switcher: All / Movies / Series */}
          <div className="flex items-center bg-[#121212] p-1 rounded-xl border border-[#262626] self-start sm:self-auto">
            <button
              onClick={() => setContentTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contentTypeFilter === 'all'
                  ? 'bg-[#E50914] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setContentTypeFilter('movie')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contentTypeFilter === 'movie'
                  ? 'bg-[#E50914] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Movies Only
            </button>
            <button
              onClick={() => setContentTypeFilter('series')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                contentTypeFilter === 'series'
                  ? 'bg-[#E50914] text-white shadow'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              TV Series
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#E50914] mx-auto mb-3" />
            <p className="text-xs text-neutral-400">Loading {selectedCategory}...</p>
          </div>
        ) : movies.length > 0 ? (
          <div>
            {/* Responsive Grid with compact spacing for movie cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 3xl:grid-cols-8 md:gap-5">
              {movies.map(movie => (
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
              <div className="mt-10 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-xl bg-[#121212] hover:bg-[#1F1F1F] text-white border border-[#262626] font-bold text-xs sm:text-sm hover:border-[#E50914] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                      Loading More Titles...
                    </>
                  ) : (
                    <>Load More Titles</>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-24 text-center bg-[#121212]/50 rounded-2xl border border-[#262626] p-6 max-w-lg mx-auto">
            <Film className="w-10 h-10 text-neutral-400 mx-auto mb-3 opacity-60" />
            <h4 className="text-base font-bold text-white mb-1">No Content Found</h4>
            <p className="text-xs text-neutral-400">
              Nothing is available in {selectedCategory} yet for the "{contentTypeFilter}" filter.
            </p>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: CATEGORIES TAB CONTENT
  // Directly mirrors Kotlin CategoriesTabContent in HomeScreen.kt:
  // - Top TabRow: "VJ CATEGORY" | "GENRE" with red indicator
  // - 3-column LazyVerticalGrid of CategoryCell with fixed 64dp height
  // =========================================================================
  const tabs = ['VJ CATEGORY', 'GENRE'];

  return (
    <div className="w-full max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-4 pb-28">
      {/* Tab Row */}
      <div className="flex border-b border-[#262626] bg-[#121212] rounded-t-xl overflow-hidden mb-4">
        {tabs.map((tabTitle, idx) => {
          const isSelected = selectedTabIndex === idx;
          return (
            <button
              key={tabTitle}
              onClick={() => setSelectedTabIndex(idx)}
              className={`relative flex-1 py-3.5 text-center text-sm font-bold tracking-wider transition-all cursor-pointer ${
                isSelected ? 'text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tabTitle}
              {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#E50914] rounded-t-sm" />
              )}
            </button>
          );
        })}
      </div>

      {/* Optional Search filter */}
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              selectedTabIndex === 0
                ? 'Search VJ (e.g. Junior, Jingo, Emmy, Ice P...)'
                : 'Search Genre (e.g. Action, Comedy, Horror...)'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121212] border border-[#262626] text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#E50914] transition-colors"
          />
        </div>
      </div>

      {/* Grid of CategoryCell */}
      {selectedTabIndex === 0 ? (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-2.5">
            {filteredVjs.map((vj) => (
              <button
                key={vj}
                onClick={() => selectCategoryWithHistory(vj)}
                className="w-full h-16 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1F1F1F] hover:border-[#E50914] transition-all flex items-center justify-center p-2 cursor-pointer group shadow-sm text-center"
              >
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] truncate">
                  {vj}
                </span>
              </button>
            ))}
          </div>
          {filteredVjs.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-400">
              No Video Jockey found matching "{searchQuery}".
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-2.5">
            {filteredGenres.map((genre) => (
              <button
                key={genre}
                onClick={() => selectCategoryWithHistory(genre)}
                className="w-full h-16 rounded-xl border border-[#262626] bg-[#121212] hover:bg-[#1F1F1F] hover:border-[#E50914] transition-all flex items-center justify-center p-2 cursor-pointer group shadow-sm text-center"
              >
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E50914] truncate">
                  {genre}
                </span>
              </button>
            ))}
          </div>
          {filteredGenres.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-400">
              No Genre found matching "{searchQuery}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
