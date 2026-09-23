import React, { useRef, useState, useEffect } from 'react';
import { Movie, Episode, PearlUser } from '../types';
import { fetchMovieDetails } from '../api';
import { resolveStreamAndDownload, ResolvedStreamResult } from '../services/munopixStreamService';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Server,
  Settings,
  Sparkles,
  ListVideo,
  X,
  SkipForward,
  SkipBack,
  CheckCircle2,
  Film,
  Loader2,
  Smartphone,
  Download
} from 'lucide-react';

interface PlayerModalProps {
  movie: Movie | null;
  episode?: Episode;
  serverUrl?: string;
  onClose: () => void;
  onSaveProgress: (movie: Movie, currentSeconds: number, totalSeconds: number, episodeTitle?: string) => void;
  user: PearlUser | null;
  isSubscribed: boolean;
  onOpenSubscription: () => void;
  onOpenAuth: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({
  movie,
  episode: initialEpisode,
  serverUrl,
  onClose,
  onSaveProgress,
  user,
  isSubscribed,
  onOpenSubscription,
  onOpenAuth
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Active movie state (may be enriched if series episodes need fetching)
  const [activeMovie, setActiveMovie] = useState<Movie | null>(movie);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | undefined>(initialEpisode);
  const [currentSeason, setCurrentSeason] = useState<number>(initialEpisode?.season || 1);
  const [showEpisodesPanel, setShowEpisodesPanel] = useState<boolean>(false);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [isResolvingStream, setIsResolvingStream] = useState<boolean>(true);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerHeight > window.innerWidth : false
  );
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [resolvedStream, setResolvedStream] = useState<ResolvedStreamResult | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<any>(null);

  // Monitor portrait / landscape orientation
  useEffect(() => {
    const handleOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', handleOrientation);
    window.addEventListener('orientationchange', handleOrientation);
    return () => {
      window.removeEventListener('resize', handleOrientation);
      window.removeEventListener('orientationchange', handleOrientation);
    };
  }, []);

  // Toggle mobile landscape mode
  const toggleLandscape = async () => {
    const nextState = !isLandscape;
    setIsLandscape(nextState);

    try {
      if (nextState) {
        if (containerRef.current && !document.fullscreenElement) {
          try {
            await containerRef.current.requestFullscreen();
          } catch {}
        }
        if (screen.orientation && 'lock' in screen.orientation) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (screen.orientation && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock();
        }
      }
    } catch (err) {
      console.warn('Orientation lock error:', err);
    }
  };

  // Initialize and enrich movie & episode data
  useEffect(() => {
    if (!movie) return;
    setActiveMovie(movie);

    // If it is a TV series and has no episodes loaded yet, fetch full details from PocketBase
    if (movie.isTvSeries && (!movie.episodes || movie.episodes.length === 0)) {
      fetchMovieDetails(movie.id).then(fullMovie => {
        if (fullMovie) {
          setActiveMovie(fullMovie);
          if (!initialEpisode && fullMovie.episodes && fullMovie.episodes.length > 0) {
            const firstEp = fullMovie.episodes[0];
            setCurrentEpisode(firstEp);
            setCurrentSeason(firstEp.season || 1);
          }
        }
      });
    } else if (movie.isTvSeries && movie.episodes && movie.episodes.length > 0) {
      if (!initialEpisode) {
        const firstEp = movie.episodes[0];
        setCurrentEpisode(firstEp);
        setCurrentSeason(firstEp.season || 1);
      }
    }
  }, [movie, initialEpisode]);

  // Update server / video URL whenever currentEpisode or activeMovie changes
  useEffect(() => {
    let isMounted = true;
    setIsResolvingStream(true);
    setIsVideoLoading(true);

    if (serverUrl) {
      setSelectedServer(serverUrl);
    }

    if (activeMovie) {
      resolveStreamAndDownload(activeMovie, currentEpisode)
        .then(res => {
          if (!isMounted) return;
          setResolvedStream(res);
          if (!serverUrl && res.streamUrl) {
            setSelectedServer(res.streamUrl);
          }
          setIsResolvingStream(false);
        })
        .catch(() => {
          if (!isMounted) return;
          if (!serverUrl) {
            const fallbackUrl = currentEpisode?.videoUrl || activeMovie.videoUrl || activeMovie.servers?.[0]?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            setSelectedServer(fallbackUrl);
          }
          setIsResolvingStream(false);
        });
    } else {
      setIsResolvingStream(false);
    }

    return () => {
      isMounted = false;
    };
  }, [serverUrl, currentEpisode, activeMovie]);

  // Handle controls hide timer
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying && !showEpisodesPanel && !showSettings) {
          setShowControls(false);
        }
      }, 3500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, showEpisodesPanel, showSettings]);

  if (!activeMovie) return null;

  // Seasons list
  const allEpisodes = activeMovie.episodes || [];
  const seasons = Array.from(
    new Set(allEpisodes.map(e => e.season || 1))
  ).sort((a, b) => a - b);
  const effectiveSeasons = seasons.length > 0 ? seasons : [1];

  // Episodes for active season
  const currentSeasonEpisodes = allEpisodes.filter(e => (e.season || 1) === currentSeason);
  const effectiveSeasonEpisodes = currentSeasonEpisodes.length > 0 ? currentSeasonEpisodes : allEpisodes;

  // Current episode index in all episodes
  const currentEpisodeIndex = currentEpisode 
    ? allEpisodes.findIndex(e => e.id === currentEpisode.id || (e.season === currentEpisode.season && e.episodeNumber === currentEpisode.episodeNumber))
    : 0;

  const hasNextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < allEpisodes.length - 1;
  const hasPrevEpisode = currentEpisodeIndex > 0;

  const handleSelectEpisode = (ep: Episode) => {
    setIsVideoLoading(true);
    setCurrentEpisode(ep);
    setCurrentSeason(ep.season || 1);
    if (ep.videoUrl) {
      setSelectedServer(ep.videoUrl);
    }
    if (activeMovie) {
      resolveStreamAndDownload(activeMovie, ep).then(res => {
        if (res && res.streamUrl) {
          setResolvedStream(res);
          setSelectedServer(res.streamUrl);
        }
      });
    }
    setCurrentTime(0);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleNextEpisode = () => {
    if (hasNextEpisode) {
      const nextEp = allEpisodes[currentEpisodeIndex + 1];
      handleSelectEpisode(nextEp);
    }
  };

  const handlePrevEpisode = () => {
    if (hasPrevEpisode) {
      const prevEp = allEpisodes[currentEpisodeIndex - 1];
      handleSelectEpisode(prevEp);
    }
  };

  // If user is not subscribed, immediately close and route to subscription page
  useEffect(() => {
    if (!isSubscribed) {
      onClose();
      if (!user) {
        onOpenAuth();
      } else {
        onOpenSubscription();
      }
    }
  }, [isSubscribed, user, onClose, onOpenAuth, onOpenSubscription]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (!isSubscribed) {
      onClose();
      if (!user) onOpenAuth();
      else onOpenSubscription();
      return;
    }
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    setDuration(videoRef.current.duration || 0);

    // Periodic progress save
    if (Math.floor(time) % 10 === 0 && videoRef.current.duration) {
      onSaveProgress(
        activeMovie, 
        time, 
        videoRef.current.duration,
        currentEpisode?.title
      );
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const target = videoRef.current.currentTime + seconds;
    videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration || 0, target));
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return "00:00";
    const minutes = Math.floor(timeInSec / 60);
    const seconds = Math.floor(timeInSec % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeVideoSrc = selectedServer || resolvedStream?.streamUrl || currentEpisode?.videoUrl || activeMovie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  // Download handler for currently active movie or episode (Subscription Gated)
  const handleDownloadActiveMedia = () => {
    if (!activeMovie) return;
    if (!isSubscribed) {
      if (!user) onOpenAuth();
      else onOpenSubscription();
      return;
    }
    const ext = resolvedStream?.format ? `.${resolvedStream.format}` : '.mp4';
    if (activeMovie.isTvSeries && currentEpisode) {
      const downloadLink = resolvedStream?.downloadUrl || currentEpisode.downloadUrl || currentEpisode.videoUrl || selectedServer || activeMovie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      const cleanTitle = (activeMovie.title || 'Series').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanTitle}_S${currentEpisode.season || currentSeason}E${currentEpisode.episodeNumber || 1}${ext}`;
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const downloadLink = resolvedStream?.downloadUrl || selectedServer || activeMovie.downloadUrl || activeMovie.videoUrl || activeMovie.servers?.[0]?.url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
      const cleanTitle = (activeMovie.title || 'Movie').replace(/[^a-zA-Z0-9_-]/g, '_');
      const cleanVj = (activeMovie.vj || 'VJ').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `${cleanTitle}_${cleanVj}${ext}`;
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDownloadSpecificEpisode = (ep: Episode, epIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeMovie) return;
    if (!isSubscribed) {
      if (!user) onOpenAuth();
      else onOpenSubscription();
      return;
    }
    const downloadLink = ep.downloadUrl || ep.videoUrl || ep.servers?.[0]?.url || activeMovie.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    const cleanTitle = (activeMovie.title || 'Series').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanTitle}_S${ep.season || currentSeason}E${ep.episodeNumber || epIdx + 1}.mp4`;
    const a = document.createElement('a');
    a.href = downloadLink;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      ref={containerRef}
      id="video-player-modal"
      className={`fixed inset-0 z-50 bg-[#000000] flex items-center justify-center select-none overflow-hidden transition-all duration-300 ${
        isLandscape && isPortrait
          ? 'w-[100vh] h-[100vw] rotate-90 origin-center top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
          : ''
      }`}
    >
      {/* HTML5 Video */}
      <video
        ref={videoRef}
        key={activeVideoSrc}
        src={activeVideoSrc}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadStart={() => setIsVideoLoading(true)}
        onWaiting={() => setIsVideoLoading(true)}
        onSeeking={() => setIsVideoLoading(true)}
        onSeeked={() => {
          if (videoRef.current && !videoRef.current.paused && videoRef.current.readyState >= 3) {
            setIsVideoLoading(false);
          }
        }}
        onCanPlay={() => {
          // Keep loading until video actually starts playing frames
          if (videoRef.current && !videoRef.current.paused && videoRef.current.currentTime > 0) {
            setIsVideoLoading(false);
          }
        }}
        onPlaying={() => {
          setIsPlaying(true);
          setIsVideoLoading(false);
          setIsResolvingStream(false);
        }}
        onError={() => {
          setIsVideoLoading(false);
          setIsResolvingStream(false);
        }}
        onEnded={() => {
          if (hasNextEpisode) {
            handleNextEpisode();
          } else {
            setIsPlaying(false);
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
        autoPlay
      />

      {/* Video Buffering / Loading Indicator */}
      {(isVideoLoading || isResolvingStream) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 backdrop-blur-[2px] z-30 pointer-events-none transition-all">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-[#E50914]/20 border-t-[#E50914] animate-spin" />
            <Loader2 className="w-7 h-7 text-[#E50914] animate-spin absolute" />
          </div>
          <div className="mt-4 flex items-center gap-2 bg-black/90 px-4 py-1.5 rounded-full border border-white/10 shadow-2xl">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-widest uppercase">
              {isResolvingStream ? 'Connecting to Stream...' : 'Loading Video...'}
            </span>
          </div>
        </div>
      )}

      {/* Overlay Header and Controls */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300 pointer-events-none ${
          showControls || showEpisodesPanel || showSettings ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between pointer-events-auto bg-gradient-to-b from-black/85 via-black/50 to-transparent p-3 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              id="player-back-btn"
              onClick={() => {
                if (videoRef.current) {
                  onSaveProgress(activeMovie, videoRef.current.currentTime, videoRef.current.duration || 0, currentEpisode?.title);
                }
                onClose();
              }}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
              title="Exit Player"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-[#E50914] text-white">
                  {activeMovie.vj}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white drop-shadow">
                  {activeMovie.title}
                </h3>
              </div>
              {activeMovie.isTvSeries && currentEpisode && (
                <p className="text-xs text-[#94A3B8] font-medium mt-0.5">
                  Season {currentEpisode.season || 1} • Episode {currentEpisode.episodeNumber || 1}: {currentEpisode.title}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Landscape Toggle Button */}
            <button
              onClick={toggleLandscape}
              className={`px-3 py-1.5 rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
                isLandscape
                  ? 'bg-[#E50914] text-white shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isLandscape ? "Exit Landscape Mode" : "Switch to Landscape Mode"}
            >
              <Smartphone className={`w-4 h-4 transition-transform ${isLandscape ? 'rotate-90 text-white' : ''}`} />
              <span className="hidden sm:inline">{isLandscape ? 'Portrait' : 'Landscape'}</span>
            </button>

            {/* Episodes & Seasons Toggle Button for TV Series */}
            {activeMovie.isTvSeries && (
              <button
                id="player-episodes-toggle-btn"
                onClick={() => {
                  setShowEpisodesPanel(!showEpisodesPanel);
                  setShowSettings(false);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                  showEpisodesPanel
                    ? 'bg-[#E50914] text-white'
                    : 'bg-[#1F1F1F] text-white hover:bg-[#2A2A2A] border border-[#262626]'
                }`}
                title="View Episodes & Seasons"
              >
                <ListVideo className="w-4 h-4" />
                <span className="hidden sm:inline">Episodes</span>
                <span className="text-[10px] opacity-80">
                  S{currentEpisode?.season || 1}:E{currentEpisode?.episodeNumber || 1}
                </span>
              </button>
            )}

            {/* Download Button (For movie or active episode) */}
            <button
              onClick={handleDownloadActiveMedia}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
              title={activeMovie.isTvSeries ? "Download Active Episode" : "Download Movie"}
            >
              <Download className="w-5 h-5 text-[#E50914]" />
            </button>

            {/* Stream Settings Button */}
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowEpisodesPanel(false);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors cursor-pointer"
              title="Stream Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Flyout */}
        {showSettings && (
          <div className="pointer-events-auto absolute top-20 right-6 w-64 p-4 rounded-2xl bg-[#121212]/95 border border-[#262626] backdrop-blur-xl shadow-2xl z-30 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5 text-[11px]">
              <Server className="w-3.5 h-3.5 text-[#E50914]" />
              Select Server
            </h4>
            <div className="space-y-1.5 mb-4">
              {((resolvedStream?.servers && resolvedStream.servers.length > 0) ? resolvedStream.servers : (activeMovie.servers || [])).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedServer(s.url || '');
                    setShowSettings(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    selectedServer === s.url
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'bg-[#1F1F1F] text-white hover:bg-[#2A2A2A]'
                  }`}
                >
                  <span className="truncate pr-2">{s.name || `Server ${idx + 1}`}</span>
                  <span className="text-[10px] opacity-75 shrink-0">{s.quality || '1080p'}</span>
                </button>
              ))}
            </div>

            <h4 className="font-bold text-white uppercase tracking-wider mb-2 text-[11px]">
              Playback Speed
            </h4>
            <div className="flex items-center gap-1">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (videoRef.current) videoRef.current.playbackRate = speed;
                  }}
                  className={`flex-1 py-1 rounded-lg text-center cursor-pointer font-bold ${
                    playbackSpeed === speed
                      ? 'bg-[#E50914] text-white'
                      : 'bg-[#1F1F1F] text-[#94A3B8] hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center Giant Play/Pause Flash */}
        <div className="self-center pointer-events-auto">
          <button
            onClick={togglePlay}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/60 hover:bg-black/80 text-[#E50914] flex items-center justify-center backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95 shadow-2xl cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Bottom Controls Bar */}
        <div className="pointer-events-auto bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-5 rounded-2xl backdrop-blur-sm">
          {/* Scrubber Progress Bar */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-medium text-white/80 font-mono min-w-[40px]">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#E50914]"
            />
            <span className="text-xs font-medium text-white/80 font-mono min-w-[40px]">
              {formatTime(duration)}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Previous Episode (Series only) */}
              {activeMovie.isTvSeries && (
                <button
                  onClick={handlePrevEpisode}
                  disabled={!hasPrevEpisode}
                  className={`p-2 rounded-lg transition-colors ${
                    hasPrevEpisode 
                      ? 'text-white hover:text-[#E50914] hover:bg-white/10 cursor-pointer' 
                      : 'text-white/30 cursor-not-allowed'
                  }`}
                  title="Previous Episode"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>
              )}

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-[#E50914] transition-colors cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              {/* Next Episode (Series only) */}
              {activeMovie.isTvSeries && (
                <button
                  onClick={handleNextEpisode}
                  disabled={!hasNextEpisode}
                  className={`p-2 rounded-lg transition-colors ${
                    hasNextEpisode 
                      ? 'text-white hover:text-[#E50914] hover:bg-white/10 cursor-pointer' 
                      : 'text-white/30 cursor-not-allowed'
                  }`}
                  title="Next Episode"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>
              )}

              {/* Rewind 10s */}
              <button
                onClick={() => skipTime(-10)}
                className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => skipTime(10)}
                className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white/80 hover:text-white cursor-pointer"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded accent-[#E50914] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Episodes Quick Pill on Mobile for Series */}
              {activeMovie.isTvSeries && (
                <button
                  onClick={() => setShowEpisodesPanel(true)}
                  className="sm:hidden px-2.5 py-1 rounded-lg bg-[#1F1F1F] border border-[#262626] text-[11px] font-bold text-[#E50914] flex items-center gap-1"
                >
                  <ListVideo className="w-3 h-3" />
                  <span>S{currentEpisode?.season || 1}:E{currentEpisode?.episodeNumber || 1}</span>
                </button>
              )}

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1F1F1F]/90 border border-[#262626] text-[11px] font-bold text-[#E50914]">
                <Sparkles className="w-3 h-3" />
                <span>VJ NARRATION</span>
              </div>

              {/* Landscape Orientation Toggle */}
              <button
                onClick={toggleLandscape}
                className={`p-2 transition-colors cursor-pointer rounded-lg ${
                  isLandscape ? 'text-[#E50914] bg-white/10' : 'text-white hover:text-[#E50914]'
                }`}
                title={isLandscape ? "Exit Landscape Mode" : "Switch to Landscape Mode"}
              >
                <Smartphone className={`w-5 h-5 transition-transform ${isLandscape ? 'rotate-90' : ''}`} />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:text-[#E50914] transition-colors cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Episodes & Seasons Drawer Overlay */}
      {activeMovie.isTvSeries && showEpisodesPanel && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#0A0A0A]/98 backdrop-blur-2xl border-l border-[#262626] shadow-2xl flex flex-col transition-all">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-[#262626] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                <ListVideo className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  Episodes & Seasons
                </h3>
                <p className="text-xs text-[#94A3B8] truncate max-w-[220px]">
                  {activeMovie.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEpisodesPanel(false)}
              className="p-2 rounded-full hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Season Selector Tabs */}
          <div className="px-4 sm:px-5 py-3 border-b border-[#262626]/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {effectiveSeasons.map((s) => (
              <button
                key={s}
                onClick={() => setCurrentSeason(s)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  currentSeason === s
                    ? 'bg-[#E50914] text-white shadow'
                    : 'bg-[#181818] text-[#94A3B8] hover:text-white hover:bg-[#1F1F1F] border border-[#262626]'
                }`}
              >
                Season {s}
              </button>
            ))}
          </div>

          {/* Episode List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {effectiveSeasonEpisodes.length > 0 ? (
              effectiveSeasonEpisodes.map((ep, idx) => {
                const isSelected = currentEpisode?.id === ep.id || 
                  (currentEpisode?.season === ep.season && currentEpisode?.episodeNumber === ep.episodeNumber);

                return (
                  <div
                    key={ep.id || idx}
                    onClick={() => handleSelectEpisode(ep)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex gap-3 group ${
                      isSelected
                        ? 'bg-[#1F1F1F] border-[#E50914] shadow-lg shadow-[#E50914]/10'
                        : 'bg-[#121212] border-[#262626] hover:border-[#333333] hover:bg-[#181818]'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-18 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-[#1F1F1F] flex-shrink-0">
                      <img
                        src={ep.thumbnail || activeMovie.backdropUrl || activeMovie.posterUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = activeMovie.posterUrl;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        {isSelected ? (
                          <div className="w-8 h-8 rounded-full bg-[#E50914] text-white flex items-center justify-center shadow-lg">
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
                            <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                          </div>
                        )}
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/80 text-white">
                        {ep.duration || '45m'}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-black uppercase px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#E50914] text-white' : 'bg-[#1F1F1F] text-[#94A3B8]'
                          }`}>
                            EP {ep.episodeNumber || idx + 1}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-[#E50914] flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Playing
                            </span>
                          )}
                        </div>
                        <h4 className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected ? 'text-[#E50914]' : 'text-white group-hover:text-[#E50914]'
                        }`}>
                          {ep.title || `Episode ${ep.episodeNumber || idx + 1}`}
                        </h4>
                        <p className="text-[11px] text-[#94A3B8] line-clamp-2 mt-0.5 leading-relaxed">
                          {ep.description}
                        </p>
                      </div>

                      {/* Episode Download Button */}
                      <button
                        onClick={(e) => handleDownloadSpecificEpisode(ep, idx, e)}
                        className="self-center p-2 rounded-lg bg-[#181818] hover:bg-[#2A2A2A] text-white border border-[#262626] hover:border-[#E50914] transition-colors cursor-pointer ml-2 flex-none"
                        title={`Download Episode ${ep.episodeNumber || idx + 1}`}
                      >
                        <Download className="w-4 h-4 text-[#E50914]" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-[#94A3B8]">
                <Film className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#E50914]" />
                <p className="text-xs">No episodes found for this season.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
