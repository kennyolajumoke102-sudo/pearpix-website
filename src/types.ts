export interface CastMember {
  name: string;
  character?: string;
  profileUrl?: string;
}

export interface ServerLink {
  id?: string;
  type?: string;
  name?: string;
  label?: string;
  quality?: string;
  url?: string;
}

export interface Episode {
  id?: string;
  title?: string;
  season?: number;
  episode?: number;
  episodeNumber?: number;
  description?: string;
  overview?: string;
  thumbnail?: string;
  poster?: string;
  duration?: string;
  videoUrl?: string;
  downloadUrl?: string;
  servers?: ServerLink[];
}

export interface Movie {
  id: string; // PocketBase ID or generated ID
  numericId?: number;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  videoUrl?: string;
  description: string;
  vj: string; // e.g. "VJ JUNIOR", "VJ JINGO", "VJ EMMY"
  genre: string;
  genres?: string[];
  year: number;
  rating: number;
  isTvSeries: boolean;
  duration?: string;
  country?: string;
  cast?: CastMember[];
  numberOfSeasons?: number;
  episodes?: Episode[];
  servers?: ServerLink[];
  trailerUrl?: string;
  trailerPath?: string;
  trailerKey?: string;
  trending?: boolean;
  latest?: boolean;
  featured?: boolean;
}

export interface HomeSection {
  id: number;
  sectionKey: string;
  title: string;
  contentType: 'movie' | 'series' | 'both';
  sourceType: 'latest' | 'genre' | 'vj' | 'country' | 'language' | 'manual';
  sourceValue?: string | null;
  enabled: boolean;
  sortOrder: number;
  itemLimit: number;
  movies: Movie[];
}

export interface VjRecord {
  id: string;
  name: string;
  image?: string;
  description?: string;
  active?: boolean;
  movieCount?: number;
}

export interface SubscriptionPlan {
  id: string;
  planId: string;
  name: string;
  displayPrice: string;
  amount: number;
  durationDays: number;
  deviceLimit: number;
  downloadLimit: number;
  isAllAccess: boolean;
  isPopular?: boolean;
  tag?: string;
}

export interface PearlUser {
  isLogin: boolean;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  session?: string;
}

export interface PearlSubscription {
  isSubscribed: boolean;
  planId?: string;
  planName?: string;
  expireTimestamp?: number;
  amount?: number | string;
  invoiceDate?: string;
  lastPaymentId?: string;
}

export interface ContactTicket {
  id: string;
  name: string;
  emailOrPhone: string;
  type: 'movie_request' | 'vj_request' | 'payment_issue' | 'support' | 'other';
  vj?: string;
  subject?: string;
  message: string;
  createdAt: number;
}

export interface DownloadItem {
  id: string;
  movieId: string;
  title: string;
  posterUrl: string;
  vj: string;
  isTvSeries: boolean;
  episodeTitle?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  sizeMb: number;
  downloadedAt: number;
  progress: number; // 0 to 100
  status: 'downloading' | 'completed' | 'paused';
  localUrl?: string;
}

export interface WatchHistoryItem {
  movieId: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  vj: string;
  isTvSeries: boolean;
  progressSeconds: number;
  durationSeconds: number;
  lastWatchedAt: number;
  episodeTitle?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type?: 'movie' | 'system' | 'vip';
}

