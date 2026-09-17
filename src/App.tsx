import { useState, useEffect, useMemo } from 'react';
import { Movie, Episode, WatchHistoryItem, HomeSection } from './types';
import { fetchHomeSectionsData, FALLBACK_MOVIES } from './api';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HeroBanner } from './components/HeroBanner';
import { MovieRow } from './components/MovieRow';
import { MovieCard } from './components/MovieCard';
import { DetailModal } from './components/DetailModal';
import { PlayerModal } from './components/PlayerModal';
import { SearchTab } from './components/SearchTab';
import { CategoriesTab } from './components/CategoriesTab';
import { Film, Sparkles, Clapperboard, Tv, Bookmark, Play } from 'lucide-react';

export function App() {
  const [sliderMovies, setSliderMovies] = useState<Movie[]>(FALLBACK_MOVIES);
  const [homeSections, setHomeSections] = useState<HomeSection[]>([]);
  const [allMoviesPool, setAllMoviesPool] = useState<Movie[]>(FALLBACK_MOVIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [homeContentType, setHomeContentType] = useState<'all' | 'movie' | 'series'>('all');
  
  // Navigation & Category Drilldown state
  const [activeTab, setActiveTab] = useState<string>('home');
  const [targetVj, setTargetVj] = useState<string | null>(null);
  const [targetGenre, setTargetGenre] = useState<string | null>(null);
  const [targetCategoryTitle, setTargetCategoryTitle] = useState<string | null>(null);

  // Selected Movie for Detail Screen
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);

  // Active Video Player
  const [playerState, setPlayerState] = useState<{
    movie: Movie;
    episode?: Episode;
    serverUrl?: string;
  } | null>(null);

  // Saved / My List (Preserves both IDs and full Movie objects)
  const [savedMoviesMap, setSavedMoviesMap] = useState<Map<string, Movie>>(() => {
    try {
      const stored = localStorage.getItem('pearlpix_saved_items') || localStorage.getItem('watchstream_saved_items') || localStorage.getItem('bujjuko_saved_items');
      if (stored) {
        const parsed: Movie[] = JSON.parse(stored);
        const map = new Map<string, Movie>();
        parsed.forEach(m => {
          if (m && m.id) map.set(m.id, m);
        });
        return map;
      }
    } catch (e) {
      console.warn('Error reading saved items cache', e);
    }
    return new Map<string, Movie>();
  });

  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('pearlpix_saved_movies') || localStorage.getItem('watchstream_saved_movies') || localStorage.getItem('bujjuko_saved_movies');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch {
      // fallback
    }
    return new Set<string>();
  });

  // Filter for My List tab (All, Movies, TV Series)
  const [myListFilter, setMyListFilter] = useState<'all' | 'movie' | 'series'>('all');

  // Watch History / Continue Watching
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const h = localStorage.getItem('pearlpix_watch_history') || localStorage.getItem('watchstream_watch_history') || localStorage.getItem('bujjuko_watch_history');
      return h ? JSON.parse(h) : [];
    } catch {
      return [];
    }
  });

  // Fetch full dynamic homepage sections & slider data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { slider, sections } = await fetchHomeSectionsData();

        if (slider && slider.length > 0) {
          setSliderMovies(slider);
        }
        if (sections && sections.length > 0) {
          setHomeSections(sections);
          // Aggregate unique movies for search & list pool
          const poolMap = new Map<string, Movie>();
          slider.forEach(m => poolMap.set(m.id, m));
          sections.forEach(s => s.movies.forEach(m => poolMap.set(m.id, m)));
          FALLBACK_MOVIES.forEach(m => {
            if (!poolMap.has(m.id)) poolMap.set(m.id, m);
          });
          setAllMoviesPool(Array.from(poolMap.values()));
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync Saved IDs & Movie objects to localStorage
  const handleToggleSave = (movie: Movie) => {
    setSavedIds(prev => {
      const updated = new Set(prev);
      const updatedMap = new Map(savedMoviesMap);

      if (updated.has(movie.id)) {
        updated.delete(movie.id);
        updatedMap.delete(movie.id);
      } else {
        updated.add(movie.id);
        updatedMap.set(movie.id, movie);
      }

      setSavedMoviesMap(updatedMap);

      try {
        localStorage.setItem('pearlpix_saved_movies', JSON.stringify(Array.from(updated)));
        localStorage.setItem('pearlpix_saved_items', JSON.stringify(Array.from(updatedMap.values())));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return updated;
    });
  };

  // Save playback progress
  const handleSaveProgress = (movie: Movie, currentSeconds: number, totalSeconds: number, episodeTitle?: string) => {
    if (!movie || !totalSeconds) return;
    const newItem: WatchHistoryItem = {
      movieId: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      backdropUrl: movie.backdropUrl,
      vj: movie.vj,
      isTvSeries: movie.isTvSeries,
      progressSeconds: currentSeconds,
      durationSeconds: totalSeconds,
      lastWatchedAt: Date.now(),
      episodeTitle
    };

    setWatchHistory(prev => {
      const filtered = prev.filter(p => p.movieId !== movie.id);
      const updated = [newItem, ...filtered].slice(0, 15);
      try {
        localStorage.setItem('pearlpix_watch_history', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Navigate directly to category
  const handleViewSection = (section: HomeSection) => {
    setTargetCategoryTitle(section.title);
    setTargetVj(null);
    setTargetGenre(null);
    setActiveTab('categories');
  };

  // Filter sections by content type tab on Home
  const filteredHomeSections = homeSections.map(sec => {
    if (homeContentType === 'movie') {
      const moviesOnly = sec.movies.filter(m => !m.isTvSeries);
      return { ...sec, movies: moviesOnly };
    }
    if (homeContentType === 'series') {
      const seriesOnly = sec.movies.filter(m => m.isTvSeries);
      return { ...sec, movies: seriesOnly };
    }
    return sec;
  }).filter(sec => sec.movies.length > 0);

  // Compute all saved movie objects (from cache map + pooled movies)
  const savedMovies = useMemo(() => {
    const combinedMap = new Map<string, Movie>();
    // Add movies stored in savedMoviesMap
    savedMoviesMap.forEach((movie, id) => {
      if (savedIds.has(id)) {
        combinedMap.set(id, movie);
      }
    });
    // Add any movies from allMoviesPool that match savedIds
    allMoviesPool.forEach(movie => {
      if (savedIds.has(movie.id)) {
        combinedMap.set(movie.id, movie);
      }
    });

    let list = Array.from(combinedMap.values());
    if (myListFilter === 'movie') {
      list = list.filter(m => !m.isTvSeries);
    } else if (myListFilter === 'series') {
      list = list.filter(m => m.isTvSeries);
    }
    return list;
  }, [savedIds, savedMoviesMap, allMoviesPool, myListFilter]);

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col selection:bg-[#E50914] selection:text-white">
      {/* Top App Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'categories') {
            setTargetVj(null);
            setTargetGenre(null);
            setTargetCategoryTitle(null);
          }
        }}
        onOpenSearch={() => setActiveTab('search')}
        savedCount={savedIds.size}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {loading && (
          <div className="w-full bg-[#121212] border-b border-[#262626] px-4 py-2 text-center text-xs text-[#E50914] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            <span>Loading Ugandan VJ translated blockbusters & catalog...</span>
          </div>
        )}

        {/* Home Screen Tab */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Slider */}
            <HeroBanner
              featuredMovies={sliderMovies.length > 0 ? sliderMovies : allMoviesPool.slice(0, 4)}
              onPlay={(m) => setPlayerState({ movie: m })}
              onSelect={setDetailMovie}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
            />

            {/* Quick Content Type Filter Bar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setHomeContentType('all')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    homeContentType === 'all'
                      ? 'bg-[#E50914] text-white shadow-md font-extrabold'
                      : 'bg-[#121212] text-[#94A3B8] hover:text-white border border-[#262626]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  All Releases
                </button>
                <button
                  onClick={() => setHomeContentType('movie')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    homeContentType === 'movie'
                      ? 'bg-[#E50914] text-white shadow-md font-extrabold'
                      : 'bg-[#121212] text-[#94A3B8] hover:text-white border border-[#262626]'
                  }`}
                >
                  <Clapperboard className="w-3.5 h-3.5" />
                  Movies Only
                </button>
                <button
                  onClick={() => setHomeContentType('series')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    homeContentType === 'series'
                      ? 'bg-[#E50914] text-white shadow-md font-extrabold'
                      : 'bg-[#121212] text-[#94A3B8] hover:text-white border border-[#262626]'
                  }`}
                >
                  <Tv className="w-3.5 h-3.5" />
                  TV Series & K-Dramas
                </button>
              </div>
            </div>

            {/* Continue Watching Section */}
            {watchHistory.length > 0 && (
              <section className="my-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-3">
                  Continue Watching
                </h3>
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                  {watchHistory.map((item) => {
                    const matchedMovie = allMoviesPool.find(m => m.id === item.movieId);
                    const percent = Math.min(100, Math.round((item.progressSeconds / (item.durationSeconds || 1)) * 100));
                    return (
                      <div
                        key={item.movieId}
                        onClick={() => {
                          if (matchedMovie) {
                            setPlayerState({ movie: matchedMovie });
                          }
                        }}
                        className="group relative flex-none w-52 sm:w-60 rounded-xl overflow-hidden bg-[#121212] border border-[#262626] cursor-pointer hover:border-[#E50914] transition-all"
                      >
                        <div className="relative aspect-[16/9] w-full bg-[#181818]">
                          <img
                            src={item.backdropUrl || item.posterUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="p-2 rounded-full bg-[#E50914] text-white">
                              <Play className="w-5 h-5 fill-current" />
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div
                              className="h-full bg-[#E50914]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                        <div className="p-2.5">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-[#E50914]">
                            {item.title}
                          </h4>
                          <div className="flex items-center justify-between text-[10px] text-[#94A3B8] mt-0.5">
                            <span>{item.vj}</span>
                            <span>{percent}% watched</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Dynamic Sections from Config API */}
            <div className="space-y-2 pb-24 max-w-7xl mx-auto">
              {filteredHomeSections.map((section) => (
                <MovieRow
                  key={section.id || section.sectionKey}
                  title={section.title}
                  movies={section.movies}
                  onSelect={setDetailMovie}
                  onPlayQuick={(m) => setPlayerState({ movie: m })}
                  savedIds={savedIds}
                  onToggleSave={handleToggleSave}
                  onViewAll={() => handleViewSection(section)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab (VJs & Genres full catalog) */}
        {activeTab === 'categories' && (
          <CategoriesTab
            onSelectMovie={setDetailMovie}
            onPlayQuick={(m) => setPlayerState({ movie: m })}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            initialVj={targetVj}
            initialGenre={targetGenre}
            initialTitle={targetCategoryTitle}
            onClearTarget={() => {
              setTargetCategoryTitle(null);
              setTargetVj(null);
              setTargetGenre(null);
            }}
          />
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <SearchTab
            movies={allMoviesPool}
            onSelectMovie={setDetailMovie}
            onPlayQuick={(m) => setPlayerState({ movie: m })}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* My List / Watchlist Tab */}
        {(activeTab === 'mylist' || activeTab === 'saved') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <Bookmark className="w-6 h-6 text-[#E50914] fill-[#E50914]/20" />
                  My List
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#E50914] text-white">
                    {savedMovies.length} Titles
                  </span>
                </h2>
                <p className="text-xs text-[#94A3B8] mt-1">
                  Your bookmarked translated movies and TV series ready to stream.
                </p>
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-[#121212] rounded-xl border border-[#262626] self-start sm:self-auto">
                <button
                  onClick={() => setMyListFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    myListFilter === 'all'
                      ? 'bg-[#E50914] text-white shadow'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setMyListFilter('movie')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    myListFilter === 'movie'
                      ? 'bg-[#E50914] text-white shadow'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  Movies
                </button>
                <button
                  onClick={() => setMyListFilter('series')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    myListFilter === 'series'
                      ? 'bg-[#E50914] text-white shadow'
                      : 'text-[#94A3B8] hover:text-white'
                  }`}
                >
                  TV Series
                </button>
              </div>
            </div>

            {savedMovies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
                {savedMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    className="w-full"
                    onSelect={setDetailMovie}
                    onPlayQuick={(m) => setPlayerState({ movie: m })}
                    isSaved={true}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center bg-[#121212]/60 rounded-2xl border border-[#262626] p-8 max-w-md mx-auto">
                <Film className="w-12 h-12 text-[#94A3B8] mx-auto mb-3 opacity-60" />
                <h4 className="text-base font-extrabold text-white mb-1">Your List is Empty</h4>
                <p className="text-xs text-[#94A3B8] mb-5">
                  Tap the bookmark icon on any movie or TV series to save it for quick access here.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-6 py-2.5 rounded-xl bg-[#E50914] text-white font-black text-xs hover:bg-[#B80710] transition-colors cursor-pointer shadow-lg shadow-[#E50914]/20"
                >
                  Explore Titles Now
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation for Mobile */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'categories') {
            setTargetVj(null);
            setTargetGenre(null);
            setTargetCategoryTitle(null);
          }
        }}
        savedCount={savedIds.size}
      />

      {/* Full Movie / Series Fullscreen Detail Screen */}
      {detailMovie && (
        <DetailModal
          movie={detailMovie}
          onClose={() => setDetailMovie(null)}
          onPlay={(m, ep) => {
            setDetailMovie(null);
            setPlayerState({ movie: m, episode: ep });
          }}
          isSaved={savedIds.has(detailMovie.id)}
          onToggleSave={handleToggleSave}
          allMovies={allMoviesPool}
          onSelectMovie={(m) => setDetailMovie(m)}
          savedIds={savedIds}
        />
      )}

      {/* High Definition Video Player Modal */}
      {playerState && (
        <PlayerModal
          movie={playerState.movie}
          episode={playerState.episode}
          serverUrl={playerState.serverUrl}
          onClose={() => setPlayerState(null)}
          onSaveProgress={handleSaveProgress}
        />
      )}
    </div>
  );
}

export default App;
