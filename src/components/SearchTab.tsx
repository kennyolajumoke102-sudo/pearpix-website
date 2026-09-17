import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Movie } from '../types';
import { MovieCard } from './MovieCard';
import { searchMoviesFromServer } from '../api';
import { Search as SearchIcon, X, SlidersHorizontal, Film, Loader2, Sparkles } from 'lucide-react';

interface SearchTabProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onPlayQuick: (movie: Movie) => void;
  savedIds: Set<string>;
  onToggleSave: (movie: Movie) => void;
  initialQuery?: string;
}

const POPULAR_SEARCH_TAGS = [
  'VJ Junior',
  'VJ Jingo',
  'VJ Emmy',
  'Action',
  'Bad Boys',
  'Squid Game',
  'Horror',
  'Thriller',
  'Romance'
];

export const SearchTab: React.FC<SearchTabProps> = ({
  movies,
  onSelectMovie,
  onPlayQuick,
  savedIds,
  onToggleSave,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movies' | 'series'>('all');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Search request cancellation tracker
  const searchRequestIdRef = useRef<number>(0);

  // Perform server search
  const performSearch = useCallback(async (searchQuery: string, filterType: 'all' | 'movies' | 'series', pageNum: number = 1) => {
    const requestId = ++searchRequestIdRef.current;
    
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await searchMoviesFromServer(searchQuery, filterType, pageNum, 24);
      
      // Ensure we only update if this is the most recent request
      if (requestId === searchRequestIdRef.current) {
        let finalMovies = response.movies;

        // If it's page 1 and user searched a query, also include any matching fallback/cached movies
        if (pageNum === 1 && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const localMatches = movies.filter(m => {
            const matchesText = m.title.toLowerCase().includes(q) ||
              m.vj.toLowerCase().includes(q) ||
              m.genre.toLowerCase().includes(q) ||
              (m.description && m.description.toLowerCase().includes(q));
            if (!matchesText) return false;
            if (filterType === 'movies' && m.isTvSeries) return false;
            if (filterType === 'series' && !m.isTvSeries) return false;
            return true;
          });

          const existingIds = new Set(finalMovies.map(m => m.id));
          const uniqueLocal = localMatches.filter(m => !existingIds.has(m.id));
          finalMovies = [...uniqueLocal, ...finalMovies];
        }

        if (pageNum === 1) {
          setResults(finalMovies);
        } else {
          setResults(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newOnes = finalMovies.filter(m => !existingIds.has(m.id));
            return [...prev, ...newOnes];
          });
        }

        setPage(pageNum);
        setTotalPages(response.totalPages);
        setTotalItems(Math.max(finalMovies.length, response.totalItems));
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [movies]);

  // Debounced trigger on query or type filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query, typeFilter, 1);
    }, 320);

    return () => clearTimeout(timer);
  }, [query, typeFilter, performSearch]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore && !isLoading) {
      performSearch(query, typeFilter, page + 1);
    }
  };

  const handleTagClick = (tag: string) => {
    setQuery(tag);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Search Input Bar */}
      <div className="relative max-w-3xl mx-auto mb-4">
        <div className="relative flex items-center">
          <SearchIcon className="absolute left-4 w-5 h-5 text-[#94A3B8]" />
          <input
            id="search-input"
            type="text"
            placeholder="Search thousands of titles, Ugandan VJs, actors, or genres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-[#121212] border border-[#262626] text-white placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-transparent text-sm sm:text-base shadow-xl"
          />
          {isLoading && (
            <div className="absolute right-10">
              <Loader2 className="w-4 h-4 text-[#E50914] animate-spin" />
            </div>
          )}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 p-1.5 rounded-full text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Search Chips */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#E50914] uppercase tracking-wider pl-1 pr-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Popular:</span>
        </div>
        {POPULAR_SEARCH_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              query.toLowerCase() === tag.toLowerCase()
                ? 'bg-[#E50914] text-white border-[#E50914] font-bold shadow-sm'
                : 'bg-[#121212] text-[#94A3B8] hover:text-white hover:bg-[#1F1F1F] border-[#262626]'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Filter Row: Type pills & Server results count */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-[#121212] rounded-xl border border-[#262626]">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#E50914] text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            All Content
          </button>
          <button
            onClick={() => setTypeFilter('movies')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'movies'
                ? 'bg-[#E50914] text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => setTypeFilter('series')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              typeFilter === 'series'
                ? 'bg-[#E50914] text-white'
                : 'text-[#94A3B8] hover:text-white'
            }`}
          >
            TV Series
          </button>
        </div>

        <div className="text-xs text-[#94A3B8] flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#E50914]" />
          <span>
            {isLoading ? (
              'Searching server...'
            ) : (
              <>
                Found <span className="font-bold text-white">{totalItems.toLocaleString()}</span> {totalItems === 1 ? 'title' : 'titles'} on server
              </>
            )}
          </span>
        </div>
      </div>

      {/* Grid of Results */}
      {isLoading && results.length === 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-[#121212] rounded-2xl aspect-[2/3] border border-[#262626]" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {results.map((movie) => (
              <div key={movie.id} className="flex justify-center">
                <MovieCard
                  movie={movie}
                  onSelect={onSelectMovie}
                  onPlayQuick={onPlayQuick}
                  isSaved={savedIds.has(movie.id)}
                  onToggleSave={onToggleSave}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {page < totalPages && (
            <div className="mt-10 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#262626] text-white font-bold text-xs sm:text-sm border border-[#333333] hover:border-[#E50914]/40 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E50914]" />
                    <span>Loading more titles from server...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Results</span>
                    <span className="text-[11px] text-[#94A3B8]">({page} of {totalPages})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center">
          <Film className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-bold text-white mb-1">No titles found on server</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto mb-5 leading-relaxed">
            We couldn't find any titles matching "{query}" on the PearlPix server. Try searching for a VJ like "VJ Junior" or generic keywords like "Action".
          </p>
          <button
            onClick={() => {
              setQuery('');
              setTypeFilter('all');
            }}
            className="px-5 py-2.5 rounded-xl bg-[#1F1F1F] hover:bg-[#262626] text-white text-xs font-bold transition-colors cursor-pointer border border-[#333333]"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
};
