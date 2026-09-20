import { Movie, SubscriptionPlan, AppNotification, HomeSection, VjRecord } from './types';
import realBujjukoConfig from './data/realBujjukoConfig.json';
import resolvedConfiguredItemsJson from './data/resolvedConfiguredItems.json';

const POCKETBASE_BASE_URL = 'https://db.bujjukomovies.com';
const BUJJUKO_CONFIG_URL = '/bujjuko-config-api';

export const VJ_LIST: string[] = [
  "VJ 03",
  "VJ AARON",
  "VJ AKAANA",
  "VJ ARAFA",
  "VJ ARTIK",
  "VJ ASHIM",
  "VJ BANKS",
  "VJ BAROS",
  "VJ BONNY",
  "VJ CABS",
  "VJ CB",
  "VJ DAN DE",
  "VJ EDDY",
  "VJ EMMY",
  "VJ FREDY",
  "VJ HAM",
  "VJ HD",
  "VJ HEAVY K",
  "VJ HENRICO",
  "VJ ICE P",
  "VJ ISMA K",
  "VJ ISMA PRO",
  "VJ IVO",
  "VJ JIMMY",
  "VJ JINGO",
  "VJ JOE",
  "VJ JONA",
  "VJ JOVAN",
  "VJ JOZZ",
  "VJ JULIO",
  "VJ JUMPERS",
  "VJ JUNIOR",
  "VJ KALI",
  "VJ KAM",
  "VJ KEVIN",
  "VJ KEVO",
  "VJ KHAN LI",
  "VJ KIMULI",
  "VJ KIN",
  "VJ KRISS S",
  "VJ KS",
  "VJ LANCE",
  "VJ LASH",
  "VJ LIGHT",
  "VJ LITTLE T",
  "VJ MARK",
  "VJ MARTIN K",
  "VJ MAYANJA",
  "VJ MK",
  "VJ MOSCO",
  "VJ MOX",
  "VJ MUBA",
  "VJ MUK",
  "VJ MUSA",
  "VJ NEIL",
  "VJ NELLY",
  "VJ OTC",
  "VJ PAULETA",
  "VJ PAX",
  "VJ PHOENIX",
  "VJ RAJI",
  "VJ RODDY",
  "VJ RONAGE",
  "VJ RONNIE",
  "VJ RYAN",
  "VJ SAMMY",
  "VJ SHAO K",
  "VJ SHARZ",
  "VJ SHIELD",
  "VJ SHIVO",
  "VJ SON",
  "VJ SOUL",
  "VJ TOM",
  "VJ TONNY",
  "VJ UNCLE T",
  "VJ VOLOCANO",
  "VJ WAZA",
  "VJ ZAIDI",
  "HEAVY Q",
  "ILLESS",
  "KK THE BEST"
];

export const KNOWN_VJS = VJ_LIST;

export const GENRES_LIST = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "History",
  "Horror",
  "Music",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
  "Western"
];

export const GENRE_LIST = ['All', ...GENRES_LIST];

export const GENRE_CATEGORIES = GENRES_LIST.map(g => ({
  id: g.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
  name: g,
  genreKey: g
}));

export function formatImageUrl(path: string | undefined | null): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }
  if (trimmed.startsWith('https://')) return trimmed;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (trimmed.startsWith('/t/p/') || trimmed.startsWith('t/p/')) {
    return `https://image.tmdb.org/${trimmed.replace(/^\/+/, '')}`;
  }
  if (trimmed.startsWith('/')) {
    return `https://image.tmdb.org/t/p/w500${trimmed}`;
  }
  return `https://image.tmdb.org/t/p/w500/${trimmed}`;
}

export function resolveVjName(rawVj?: string, vjs?: string[]): string {
  const raw = (vjs && vjs.length > 0 && vjs[0]) || rawVj || 'PearlPix';
  const cleaned = raw.replace(/^VJ[:\s]*/i, '').trim();
  if (cleaned.toLowerCase() === 'pearlpix' || cleaned.toLowerCase() === 'watchstream' || cleaned.toLowerCase() === 'bujjuko movie center' || cleaned.toLowerCase() === 'bujjuko movies') {
    return 'PearlPix';
  }
  return `VJ ${cleaned.toUpperCase()}`;
}

export function normalizeMediaUrl(url: string): string {
  return url
    .trim()
    .replace('http://', 'https://')
    .replace('db.jmovies.site', 'db.bujjukomovies.com')
    .replace('jmovies.site', 'bujjukomovies.com');
}

// Transform PocketBase record to client Movie model
export function mapPocketBaseItem(item: any): Movie {
  const isSeries = 
    item.contentType === 'series' || 
    item.pearlpixType === 'series' ||
    (Array.isArray(item.type) && (
      item.type.includes('western_series') || 
      item.type.includes('mini_series') || 
      item.type.includes('latest_series') || 
      item.type.includes('latest series') ||
      item.type.includes('latest_seris')
    )) ||
    (Array.isArray(item.episodes) && item.episodes.length > 0) ||
    String(item.pearlpixId || '').startsWith('series_');

  const poster = item.posterUrl || item.poster || item.backdropUrl || item.backdrop;
  const backdrop = item.backdropUrl || item.backdrop || item.posterUrl || item.poster;

  const genresList: string[] = Array.isArray(item.genres) 
    ? item.genres.filter(Boolean)
    : (item.genre ? item.genre.split(',').map((g: string) => g.trim()) : (isSeries ? ['TV Series'] : ['Action', 'Adventure']));

  const rawGenre = genresList.join(', ');

  const parsedRating = typeof item.rating === 'number' 
    ? item.rating 
    : parseFloat(item.rating) || (7.5 + (Math.abs(item.id?.charCodeAt(0) || 0) % 20) / 10);

  // Resolve video url
  let video = item.videoUrl || item.streamLink || item.url || '';
  if (!video && Array.isArray(item.servers) && item.servers.length > 0) {
    video = item.servers[0]?.url || '';
  }
  if (!video && Array.isArray(item.episodes) && item.episodes.length > 0) {
    video = item.episodes[0]?.videoUrl || item.episodes[0]?.link || item.episodes[0]?.streamLink || '';
  }
  if (video) {
    video = normalizeMediaUrl(video);
  }

  // Parse servers
  const servers = Array.isArray(item.servers) && item.servers.length > 0 
    ? item.servers.map((s: any, idx: number) => ({
        name: s.name || `Server ${idx + 1}`,
        label: s.label || (idx === 0 ? 'Fast CDN Server' : 'Backup Stream'),
        quality: s.quality || '1080p Full HD',
        url: normalizeMediaUrl(s.url || video)
      }))
    : [
        { name: 'Fast Stream VIP', label: 'VIP 1080p Server', quality: '1080p HD', url: video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { name: 'Standard Server', label: 'Mobile 720p', quality: '720p', url: video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }
      ];

  // Cast members
  const cast = Array.isArray(item.cast) 
    ? item.cast.map((c: any) => ({
        name: c.name || c.actor || 'Cast Member',
        character: c.character,
        profileUrl: formatImageUrl(c.profileUrl || c.image || c.img)
      }))
    : (typeof item.cast === 'string' && item.cast ? item.cast.split(',').map((name: string) => ({ name: name.trim() })) : []);

  // Parse episodes if series
  let episodes = Array.isArray(item.episodes) && item.episodes.length > 0
    ? item.episodes.map((ep: any, idx: number) => ({
        id: ep.id || `ep-${idx + 1}`,
        title: ep.title || `Episode ${ep.episodeNumber || ep.episode || idx + 1}`,
        season: Number(ep.season) || 1,
        episode: Number(ep.episode || ep.episodeNumber || idx + 1),
        episodeNumber: Number(ep.episodeNumber || ep.episode || idx + 1),
        description: ep.description || ep.overview || 'Enjoy this thrilling translated episode on PearlPix.',
        thumbnail: formatImageUrl(ep.thumbnail || ep.poster || ep.image || backdrop),
        videoUrl: normalizeMediaUrl(ep.videoUrl || ep.link || ep.streamLink || ep.url || video)
      }))
    : undefined;

  // Generate realistic season episodes if series has no explicit sub-items
  if (isSeries && (!episodes || episodes.length === 0)) {
    const epCount = item.numberOfEpisodes || 6;
    episodes = Array.from({ length: epCount }, (_, i) => ({
      id: `ep-${i + 1}`,
      title: `Episode ${i + 1}`,
      season: 1,
      episode: i + 1,
      episodeNumber: i + 1,
      description: `Action-packed translated episode ${i + 1} with full voice-over commentary.`,
      thumbnail: formatImageUrl(backdrop),
      videoUrl: video
    }));
  }

  // Parse release year
  let year = item.year;
  if (!year && item.releaseDate) {
    const num = Number(item.releaseDate);
    if (!isNaN(num) && num > 1000000) {
      year = new Date(num < 10000000000 ? num * 1000 : num).getFullYear();
    }
  }
  if (!year && item.created) {
    year = parseInt(String(item.created).slice(0, 4)) || 2024;
  }
  if (!year) year = 2024;

  const numberOfSeasons = isSeries
    ? (item.numberOfSeasons || (episodes && episodes.length > 0 ? Math.max(1, ...episodes.map((e: any) => e.season || 1)) : 1))
    : undefined;

  const rawIdStr = String(item.pearlpixId || item.reelplexi_id || item.id || '');
  const digits = rawIdStr.replace(/\D+/g, '');
  const numericId = typeof item.reelplexi_id === 'number' && item.reelplexi_id > 0
    ? item.reelplexi_id
    : (typeof item.numericId === 'number' && item.numericId > 0 ? item.numericId : (digits ? parseInt(digits, 10) : undefined));

  const pearlpixId = item.pearlpixId 
    ? String(item.pearlpixId) 
    : (numericId ? (isSeries ? `series_${numericId}` : `movie_${numericId}`) : undefined);

  return {
    id: item.id || (numericId ? String(numericId) : `movie-${Math.random().toString(36).substr(2, 9)}`),
    numericId,
    pearlpixId,
    title: item.title ? item.title.replace(/<[^>]*>?/gm, '').trim() : 'Untitled Movie',
    posterUrl: formatImageUrl(poster),
    backdropUrl: formatImageUrl(backdrop),
    videoUrl: video || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: item.description 
      ? item.description.replace(/<[^>]*>?/gm, '').trim() 
      : (item.overview || 'Enjoy high definition streaming with full VJ narration and translation on PearlPix.'),
    vj: resolveVjName(item.vj, item.vjs),
    genre: rawGenre,
    genres: genresList,
    year,
    rating: Math.min(10, Math.max(1, parsedRating)),
    isTvSeries: isSeries,
    duration: item.duration || (isSeries ? '45m / ep' : '1h 55m'),
    country: item.country || (item.originCountry ? item.originCountry : 'USA'),
    cast,
    numberOfSeasons,
    episodes,
    servers,
    trending: item.trending || item.home_slider || false,
    latest: item.latest !== undefined ? item.latest : true,
    featured: item.featured || item.homeSlider || false,
  };
}

// Fallback curated movies
export const FALLBACK_MOVIES: Movie[] = [
  {
    id: "bujjuko-001",
    title: "The Beekeeper - VJ Junior",
    posterUrl: "https://image.tmdb.org/t/p/w500/A7EByudX0eOzlkQ2FIbogzyazm2.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/4woSOUD0equAYzvwhWBHIJDCM88.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    description: "One man's brutal campaign for vengeance takes on national stakes after he is revealed to be a former operative of a powerful and clandestine organization known as Beekeepers. Translated with intense energy by VJ Junior.",
    vj: "VJ JUNIOR",
    genre: "Action, Thriller",
    genres: ["Action", "Thriller"],
    year: 2024,
    rating: 8.9,
    isTvSeries: false,
    duration: "1h 45m",
    country: "USA",
    cast: [
      { name: "Jason Statham", character: "Adam Clay" },
      { name: "Emmy Raver-Lampman", character: "Agent Verona Parker" },
      { name: "Josh Hutcherson", character: "Derek Danforth" }
    ],
    servers: [
      { name: "Pearlpix Fast CDN", label: "VIP 1080p", quality: "1080p HD", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
      { name: "PearlPix High Speed", label: "720p Mobile", quality: "720p", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" }
    ],
    trending: true,
    featured: true,
  },
  {
    id: "bujjuko-002",
    title: "Bad Boys: Ride or Die - VJ Jingo",
    posterUrl: "https://image.tmdb.org/t/p/w500/nP6RliHjxsz4irTKsxe8FRhKZYl.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/ga4OLm4qLx69ToKV0iqQmcR0msd.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    description: "When their late police captain gets linked to drug cartels, wisecracking Miami cops Mike Lowrey and Marcus Burnett embark on a rogue mission to clear his name. Masterfully narrated by VJ Jingo.",
    vj: "VJ JINGO",
    genre: "Action, Comedy, Crime",
    genres: ["Action", "Comedy", "Crime"],
    year: 2024,
    rating: 8.6,
    isTvSeries: false,
    duration: "1h 55m",
    country: "USA",
    cast: [
      { name: "Will Smith", character: "Detective Mike Lowrey" },
      { name: "Martin Lawrence", character: "Detective Marcus Burnett" }
    ],
    servers: [
      { name: "Pearlpix Fast CDN", label: "VIP 1080p", quality: "1080p HD", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" }
    ],
    trending: true,
    featured: true,
  },
  {
    id: "bujjuko-003",
    title: "House of the Dragon Season 2 - VJ Emmy",
    posterUrl: "https://image.tmdb.org/t/p/w500/7QMsOTMUswlwxJP0rTTZfmz2tX2.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/etj5CuMuamjhGj4ZqglaFwqqWwh.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    description: "Westeros is on the brink of a bloody civil war as the Green and Black Councils fight for King Aegon and Queen Rhaenyra, respectively. Explosive weekly episodes translated with drama by VJ Emmy.",
    vj: "VJ EMMY",
    genre: "Action, Drama, Fantasy",
    genres: ["Action", "Drama", "Fantasy"],
    year: 2024,
    rating: 9.1,
    isTvSeries: true,
    duration: "65m / ep",
    country: "USA",
    numberOfSeasons: 2,
    episodes: [
      { episodeNumber: 1, season: 2, title: "A Son for a Son", duration: "64m", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
      { episodeNumber: 2, season: 2, title: "Rhaenyra the Cruel", duration: "69m", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
      { episodeNumber: 3, season: 2, title: "The Burning Mill", duration: "66m", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" }
    ],
    cast: [
      { name: "Emma D'Arcy", character: "Rhaenyra Targaryen" },
      { name: "Matt Smith", character: "Daemon Targaryen" }
    ],
    servers: [
      { name: "Main Series Server", label: "HD Stream", quality: "1080p", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" }
    ],
    trending: true,
    featured: true,
  }
];

// Fetch all available Ugandan VJs from PocketBase + Full Catalog
export async function fetchAllVjs(): Promise<VjRecord[]> {
  try {
    const response = await fetch(`${POCKETBASE_BASE_URL}/api/collections/vjs/records?sort=name&perPage=100`, {
      headers: { Accept: 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const pbVjs: VjRecord[] = data.items.map((item: any) => ({
          id: item.id,
          name: resolveVjName(item.name),
          image: item.image ? `${POCKETBASE_BASE_URL}/api/files/${item.collectionId}/${item.id}/${item.image}` : undefined,
          description: item.description || 'Professional Ugandan Video Jockey translating hit movies in Luganda and English.',
          active: item.active !== false
        }));

        // Merge with full VJ_LIST ensuring no missing prominent VJs
        const existingNames = new Set(pbVjs.map(v => v.name.toUpperCase()));
        for (const vj of VJ_LIST) {
          if (!existingNames.has(vj.toUpperCase())) {
            pbVjs.push({
              id: `vj-${vj.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: vj,
              description: 'Official voice over and translation for top cinema blockbusters.',
              active: true
            });
          }
        }
        return pbVjs.sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  } catch (err) {
    console.warn('Error fetching VJ list from PocketBase:', err);
  }

  // Fallback to complete list
  return VJ_LIST.map((vj, idx) => ({
    id: `vj-${idx + 1}`,
    name: vj,
    description: 'Official voice over and translation for top cinema blockbusters.',
    active: true
  }));
}

// Fetch media records from PocketBase
export async function fetchLiveMedia(page: number = 1, perPage: number = 24, filter?: string): Promise<Movie[]> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sort: '-created'
    });
    if (filter) {
      params.append('filter', filter);
    }
    const response = await fetch(`${POCKETBASE_BASE_URL}/api/collections/media/records?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (Array.isArray(data.items)) {
      if (data.items.length > 0) {
        return data.items.map(mapPocketBaseItem);
      }
      // If page > 1 or filter was applied, an empty result means no more items
      if (page > 1 || filter) {
        return [];
      }
    }
    return FALLBACK_MOVIES;
  } catch (err) {
    console.warn('PocketBase fetch failed, using fallback data:', err);
    if (page > 1 || filter) return [];
    return FALLBACK_MOVIES;
  }
}

// Fetch single movie or series by ID with all seasons, episodes, and stream servers
export async function fetchMovieDetails(id: string): Promise<Movie | null> {
  if (!id) return null;
  // 1. Check in-memory cache
  const cached = resolvedPearlpixCache.get(id) ||
                 resolvedPearlpixCache.get(`series_${id}`) ||
                 resolvedPearlpixCache.get(`movie_${id}`);
  if (cached && cached.episodes && cached.episodes.length > 0) {
    return cached;
  }

  // 2. Fetch directly from PocketBase by record id
  try {
    const res = await fetch(`${POCKETBASE_BASE_URL}/api/collections/media/records/${id}`, {
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      const mapped = mapPocketBaseItem(data);
      resolvedPearlpixCache.set(id, mapped);
      resolvedPearlpixCache.set(mapped.id, mapped);
      return mapped;
    }
  } catch {}

  // 3. Try filter by pearlpixId or id
  try {
    const filter = `id = "${id}" || pearlpixId = "${id}" || pearlpixId = "series_${id}" || pearlpixId = "movie_${id}"`;
    const res = await fetch(
      `${POCKETBASE_BASE_URL}/api/collections/media/records?perPage=1&filter=${encodeURIComponent(filter)}`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        const mapped = mapPocketBaseItem(data.items[0]);
        resolvedPearlpixCache.set(id, mapped);
        resolvedPearlpixCache.set(mapped.id, mapped);
        return mapped;
      }
    }
  } catch {}

  return cached || null;
}

export function sanitizeSectionTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let title = rawTitle
    .replace(/\bBUJJUKO\b/gi, 'PEARLPIX')
    .split(/\s+[-:|–—]\s+/)[0]
    .replace(/\s*\([^)]*\)$/, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (title.toUpperCase() === 'RECENTLY ADDED MOVIES') {
    title = 'LATEST MOVIES';
  }
  return title;
}

export const DEFAULT_HOME_SECTIONS: Array<{
  id: number;
  section_key: string;
  title: string;
  content_type: string;
  source_type: string;
  source_value?: string;
  enabled: boolean;
  sort_order: number;
  item_limit: number;
}> = ((realBujjukoConfig as any).sections || [])
  .filter((s: any) => {
    if (!s.enabled || s.id <= 0) return false;
    const clean = sanitizeSectionTitle(s.title || '').toUpperCase();
    return s.section_key !== 'trending' && clean !== 'TRENDING';
  })
  .map((s: any) => ({
    ...s,
    title: sanitizeSectionTitle(s.title || '')
  }));

// Fetch dynamic sections definitions from Bujjuko config API with fallback
export async function fetchBujjukoConfigSections(): Promise<typeof DEFAULT_HOME_SECTIONS> {
  const endpoints = [
    `${BUJJUKO_CONFIG_URL}/api/bujjuko-config/index.php?route=sections`,
    'http://194.9.62.158/api/bujjuko-config/index.php?route=sections'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.sections) && data.sections.length > 0) {
          const rawSections = data.sections.filter((s: any) => s.enabled && s.id > 0);
          
          // Map to ensure item_limit is at least 20 and filter out trending
          const normalized = rawSections
            .filter((s: any) => {
              const cleanTitle = sanitizeSectionTitle(s.title || '').toUpperCase();
              return s.section_key !== 'trending' && cleanTitle !== 'TRENDING';
            })
            .map((s: any) => {
              const cleanTitle = sanitizeSectionTitle(s.title || '');
              return {
                ...s,
                title: cleanTitle,
                item_limit: Math.max(20, s.item_limit || 20),
                sort_order: s.sort_order || 100
              };
            });

          // Ensure mandatory sections: WESTERN SERIES, STEAMY MOVIES
          const hasWestern = normalized.some((s: any) => (s.title || '').toUpperCase().includes('WESTERN'));
          if (!hasWestern) {
            const defaultWestern = DEFAULT_HOME_SECTIONS.find(s => s.section_key === 'western_series');
            if (defaultWestern) normalized.push(defaultWestern);
          }
          const hasSteamy = normalized.some((s: any) => (s.title || '').toUpperCase().includes('STEAMY'));
          if (!hasSteamy) {
            const defaultSteamy = DEFAULT_HOME_SECTIONS.find(s => s.section_key === 'steamy_movies');
            if (defaultSteamy) normalized.push(defaultSteamy);
          }

          return normalized;
        }
      }
    } catch {}
  }
  return DEFAULT_HOME_SECTIONS;
}

// Fetch all manual include/exclude items for sections from Bujjuko config API
export async function fetchBujjukoSectionItems(): Promise<any[]> {
  const endpoints = [
    `${BUJJUKO_CONFIG_URL}/api/bujjuko-config/index.php?route=items`,
    'http://194.9.62.158/api/bujjuko-config/index.php?route=items'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          return data.items;
        }
      }
    } catch {}
  }
  return (realBujjukoConfig as any).items || [];
}

// Fetch content configs from Bujjuko config API (slider configs, hidden items)
export async function fetchBujjukoContentConfigs(): Promise<any[]> {
  const endpoints = [
    `${BUJJUKO_CONFIG_URL}/api/bujjuko-config/index.php?route=content`,
    'http://194.9.62.158/api/bujjuko-config/index.php?route=content'
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.items)) {
          return data.items;
        }
      }
    } catch {}
  }
  return (realBujjukoConfig as any).contentConfigs || [];
}

// Memory cache for resolved PocketBase records by reelplexi / pearlpixId
const resolvedPearlpixCache = new Map<string, Movie>();

// Pre-seed memory cache with genuine PocketBase records
try {
  for (const [key, rawRecord] of Object.entries(resolvedConfiguredItemsJson)) {
    const movie = mapPocketBaseItem(rawRecord);
    if (!movie.numericId && /^\d+$/.test(key)) {
      movie.numericId = parseInt(key, 10);
    }
    resolvedPearlpixCache.set(String(key), movie);
    const cleanId = String((rawRecord as any).pearlpixId || '').replace(/^(series|movie)_/i, '');
    if (cleanId) resolvedPearlpixCache.set(cleanId, movie);
    if ((rawRecord as any).pearlpixId) resolvedPearlpixCache.set(String((rawRecord as any).pearlpixId), movie);
    resolvedPearlpixCache.set(movie.id, movie);
  }
} catch (err) {
  console.warn('Failed to pre-seed configured items cache:', err);
}

// Resolve configured items by reelplexi ID in PocketBase media records
export async function resolveConfiguredItems(
  items: Array<{ contentType: string; id: number | string }>
): Promise<Movie[]> {
  const missingIds: string[] = [];

  for (const item of items) {
    const idStr = String(item.id);
    if (!idStr || idStr === '0') continue;
    if (!resolvedPearlpixCache.has(idStr) && !resolvedPearlpixCache.has(`series_${idStr}`) && !resolvedPearlpixCache.has(`movie_${idStr}`)) {
      missingIds.push(idStr);
    }
  }

  if (missingIds.length > 0) {
    // Deduplicate missing IDs
    const uniqueMissing = Array.from(new Set(missingIds));
    // Fetch in batches of 15 to avoid overly long URL filter strings
    for (let i = 0; i < uniqueMissing.length; i += 15) {
      const chunk = uniqueMissing.slice(i, i + 15);
      const filter = chunk
        .map(id => `pearlpixId = "${id}" || pearlpixId = "series_${id}" || pearlpixId = "movie_${id}"`)
        .join(' || ');

      try {
        const res = await fetch(
          `${POCKETBASE_BASE_URL}/api/collections/media/records?perPage=50&filter=${encodeURIComponent(filter)}`,
          { headers: { Accept: 'application/json' } }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items)) {
            for (const record of data.items) {
              const movie = mapPocketBaseItem(record);
              const cleanId = String(record.pearlpixId || '').replace(/^(series|movie)_/i, '');
              if (cleanId) resolvedPearlpixCache.set(cleanId, movie);
              if (record.pearlpixId) resolvedPearlpixCache.set(String(record.pearlpixId), movie);
              resolvedPearlpixCache.set(movie.id, movie);
            }
          }
        }
      } catch (err) {
        console.warn('Error resolving configured pearlpix items:', err);
      }
    }
  }

  // Return items in requested order, deduplicated
  const results: Movie[] = [];
  const seenIds = new Set<string>();
  for (const item of items) {
    const idStr = String(item.id);
    const found = resolvedPearlpixCache.get(idStr) ||
                  resolvedPearlpixCache.get(`series_${idStr}`) ||
                  resolvedPearlpixCache.get(`movie_${idStr}`);
    if (found && !seenIds.has(found.id)) {
      seenIds.add(found.id);
      results.push(found);
    }
  }

  return results;
}

// Fetch automatic section content directly matching PocketBase media collection
export async function fetchAutomaticSectionContent(opts: {
  contentType: string;
  sourceType: string;
  sourceValue: string;
  limit: number;
  page: number;
}): Promise<Movie[]> {
  const { contentType, sourceType, sourceValue, limit, page } = opts;

  if (sourceType === 'latest') {
    let filter = '';
    if (contentType === 'series') {
      filter = `(contentType = "series" || pearlpixType = "series" || type ~ "latest_series" || type ~ "mini_series") && contentType != "movie"`;
    } else if (contentType === 'movie') {
      filter = `(contentType = "movie" || (contentType != "series" && type !~ "series"))`;
    }
    return fetchLiveMedia(page, limit, filter);
  }

  if (sourceType === 'vj') {
    const cleanVj = sourceValue.replace(/^VJ\s+/i, '').trim();
    let filter = `(vjs ~ "${cleanVj}" || title ~ "${cleanVj}")`;
    if (contentType === 'series') {
      filter += ` && (contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
    } else if (contentType === 'movie') {
      filter += ` && (contentType = "movie" || (contentType != "series" && type !~ "series"))`;
    }
    const list = await fetchLiveMedia(page, limit, filter);
    return list.map(m => {
      if (!m.vj || m.vj.toLowerCase() === 'bujjuko movies' || m.vj.toLowerCase() === 'bujjuko movie center') {
        return { ...m, vj: `VJ ${cleanVj.toUpperCase()}` };
      }
      return m;
    });
  }

  if (sourceType === 'genre') {
    return fetchByGenre(sourceValue, page, limit, contentType as any);
  }

  if (sourceType === 'country') {
    const c = (sourceValue || '').trim().toLowerCase();
    let filter = '';
    if (c === 'in' || c === 'india') {
      filter = `(type ~ "indian" || type ~ "idan" || genres ~ "INDIAN")`;
    } else if (c === 'kr' || c === 'korea') {
      filter = `(type ~ "korean" || genres ~ "KOREAN")`;
    } else if (c === 'cn' || c === 'china') {
      filter = `(type ~ "chinese" || genres ~ "CHINESE")`;
    } else if (c) {
      filter = `(type ~ "${c}" || genres ~ "${c.toUpperCase()}")`;
    }
    if (contentType === 'series') {
      filter = filter ? `(${filter}) && (contentType = "series" || pearlpixType = "series") && contentType != "movie"` : `(contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
    } else if (contentType === 'movie') {
      filter = filter ? `(${filter}) && (contentType = "movie" || (contentType != "series" && type !~ "series"))` : `(contentType = "movie" || (contentType != "series" && type !~ "series"))`;
    }
    return fetchLiveMedia(page, limit, filter);
  }

  if (sourceType === 'language') {
    let filter = '';
    const lang = sourceValue.toLowerCase();
    if (lang === 'korean') {
      filter = `contentType = "series" && (type ~ "korean" || genres ~ "KOREAN" || title ~ "Korean")`;
    } else if (lang === 'chinese') {
      // Must be actual Chinese TV series, never single movies
      filter = `contentType = "series" && (type ~ "chinese" || genres ~ "CHINESE" || title ~ "Chinese" || pearlpixId = "series_1025" || pearlpixId = "series_806" || pearlpixId = "series_872" || pearlpixId = "series_956" || pearlpixId = "series_1034" || pearlpixId = "series_996" || pearlpixId = "series_1056" || pearlpixId = "series_814" || pearlpixId = "series_817" || pearlpixId = "series_846" || pearlpixId = "series_870" || pearlpixId = "series_994")`;
    } else if (lang === 'english') {
      // Must be actual Western TV series, never single movies with wstnss
      filter = `contentType = "series" && (type ~ "western_series" || type ~ "Western series" || type ~ "mini_series" || (type !~ "korean" && type !~ "chinese" && type !~ "idan"))`;
    } else {
      filter = `(type ~ "${lang}" || genres ~ "${sourceValue.toUpperCase()}")`;
      if (contentType === 'series') {
        filter += ` && (contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
      } else if (contentType === 'movie') {
        filter += ` && (contentType = "movie" || (contentType != "series" && type !~ "series"))`;
      }
    }
    return fetchLiveMedia(page, limit, filter);
  }

  // sourceType === 'manual': comes purely from include items!
  return [];
}

// Fetch home slider based on bujjuko-config content route where home_slider === true
export async function fetchHomeSlider(): Promise<Movie[]> {
  try {
    const contentConfigs = await fetchBujjukoContentConfigs();
    const sliderConfigs = contentConfigs
      .filter((c: any) => c.home_slider && !c.hidden && c.reelplexi_id > 0)
      .sort((a: any, b: any) => (a.slider_position ?? 999) - (b.slider_position ?? 999));

    if (sliderConfigs.length > 0) {
      const items = await resolveConfiguredItems(
        sliderConfigs.map((c: any) => ({
          contentType: c.content_type || 'movie',
          id: c.reelplexi_id
        }))
      );
      if (items.length >= 2) {
        return items;
      }
    }
  } catch (e) {
    console.warn('Failed resolving slider from bujjuko-config, using fallback:', e);
  }

  // Fallback to top rated media
  const fallback = await fetchLiveMedia(1, 10, 'rating >= 8.5');
  return fallback.slice(0, 5);
}

// Fetch single configured home section content
export async function fetchConfiguredHomeSection(
  section: {
    id: number;
    sectionKey?: string;
    section_key?: string;
    title: string;
    contentType?: string;
    content_type?: string;
    sourceType?: string;
    source_type?: string;
    sourceValue?: string;
    source_value?: string;
    itemLimit?: number;
    item_limit?: number;
  },
  page: number = 1,
  preloadedManualItems?: any[],
  preloadedHiddenKeys?: Set<string>
): Promise<Movie[]> {
  const cType = (section.contentType || section.content_type || 'both').toLowerCase();
  const sType = (section.sourceType || section.source_type || 'latest').toLowerCase();
  const sVal = section.sourceValue || section.source_value || '';
  const limit = Math.max(20, section.itemLimit || section.item_limit || 20);

  // 1. Manual items (includes and excludes) from Bujjuko config
  let manuals = preloadedManualItems;
  if (!manuals) {
    const allManuals = await fetchBujjukoSectionItems();
    manuals = allManuals.filter(i => i.section_id === section.id || i.section_key === (section.sectionKey || section.section_key));
  }

  const excludes = new Set(
    manuals
      .filter((i: any) => i.action?.toLowerCase() === 'exclude')
      .map((i: any) => String(i.reelplexi_id))
  );

  let includes: Movie[] = [];
  if (page === 1) {
    const includeDefs = manuals.filter((i: any) => i.action?.toLowerCase() === 'include');
    if (includeDefs.length > 0) {
      includes = await resolveConfiguredItems(
        includeDefs.map((i: any) => ({
          contentType: i.content_type || 'movie',
          id: i.reelplexi_id
        }))
      );
    }
  }

  // 2. Automatic content from PocketBase
  let automaticItems: Movie[] = [];
  if (sType !== 'manual') {
    automaticItems = await fetchAutomaticSectionContent({
      contentType: cType,
      sourceType: sType,
      sourceValue: sVal,
      limit: Math.max(limit, 24),
      page
    });
  }

  // 3. Merge includes + automatic items
  const merged: Movie[] = [];
  const seenIds = new Set<string>();

  for (const item of [...includes, ...automaticItems]) {
    if (!item || !item.id) continue;
    if (excludes.has(item.id)) continue;
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    merged.push(item);
  }

  // Filter out any hidden keys
  let hiddenKeys = preloadedHiddenKeys;
  if (!hiddenKeys) {
    const contentConfigs = await fetchBujjukoContentConfigs();
    hiddenKeys = new Set(
      contentConfigs
        .filter((c: any) => c.hidden)
        .map((c: any) => String(c.reelplexi_id))
    );
  }

  const filtered = merged.filter(item => !hiddenKeys!.has(item.id));
  return filtered.slice(0, limit);
}

// Fetch dynamic homepage sections according to Kotlin API specs
export async function fetchHomeSectionsData(): Promise<{ slider: Movie[]; sections: HomeSection[] }> {
  try {
    // 1. Fetch section definitions, manual items, content configs in parallel
    const [configSections, manualItems, contentConfigs] = await Promise.all([
      fetchBujjukoConfigSections(),
      fetchBujjukoSectionItems(),
      fetchBujjukoContentConfigs()
    ]);

    // Group manual items by section_id
    const itemsBySection = new Map<number, any[]>();
    for (const item of manualItems) {
      const sId = Number(item.section_id);
      if (!itemsBySection.has(sId)) itemsBySection.set(sId, []);
      itemsBySection.get(sId)!.push(item);
    }

    // Identify hidden keys
    const hiddenKeys = new Set<string>(
      contentConfigs
        .filter((c: any) => c.hidden)
        .map((c: any) => String(c.reelplexi_id))
    );

    // 2. Resolve slider items from content configs where home_slider === true
    let sliderItems: Movie[] = [];
    const sliderConfigs = contentConfigs
      .filter((c: any) => c.home_slider && !c.hidden && c.reelplexi_id > 0)
      .sort((a: any, b: any) => (a.slider_position ?? 999) - (b.slider_position ?? 999));

    if (sliderConfigs.length > 0) {
      sliderItems = await resolveConfiguredItems(
        sliderConfigs.map((c: any) => ({
          contentType: c.content_type || 'movie',
          id: c.reelplexi_id
        }))
      );
    }

    if (sliderItems.length === 0) {
      sliderItems = await fetchLiveMedia(1, 6, 'rating >= 8');
    }

    // 3. Pre-resolve all manual include items in one batch
    const allIncludeDefs = manualItems
      .filter((i: any) => i.action?.toLowerCase() === 'include' && i.reelplexi_id > 0)
      .map((i: any) => ({
        contentType: i.content_type || 'movie',
        id: i.reelplexi_id
      }));
    if (allIncludeDefs.length > 0) {
      await resolveConfiguredItems(allIncludeDefs);
    }

    // 4. Populate each section with authentic movies (excluding Indian movies, Family section, and Trending as requested)
    let validSections = configSections
      .filter(sec => sec.enabled && sec.id > 0 && 
        sec.section_key !== 'indian_movies' && sec.title?.toUpperCase() !== 'INDIAN MOVIES' && 
        sec.section_key !== 'family' && sec.title?.toUpperCase() !== 'FAMILY' &&
        sec.section_key !== 'trending' && sec.title?.toUpperCase() !== 'TRENDING'
      )
      .map(sec => {
        const title = sanitizeSectionTitle(sec.title || '');
        return { ...sec, title, item_limit: Math.max(20, sec.item_limit || 20) };
      });

    // Ensure WESTERN SERIES and STEAMY MOVIES are always in the sections
    if (!validSections.some(s => (s.title || '').toUpperCase().includes('WESTERN'))) {
      validSections.push(DEFAULT_HOME_SECTIONS.find(s => s.section_key === 'western_series')!);
    }
    if (!validSections.some(s => (s.title || '').toUpperCase().includes('STEAMY'))) {
      validSections.push(DEFAULT_HOME_SECTIONS.find(s => s.section_key === 'steamy_movies')!);
    }

    validSections.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

    const sections = await Promise.all(
      validSections.map(async sec => {
        try {
          const sectionManuals = itemsBySection.get(sec.id) || [];
          const movies = await fetchConfiguredHomeSection(sec, 1, sectionManuals, hiddenKeys);

          return {
            id: sec.id,
            sectionKey: sec.section_key || `sec-${sec.id}`,
            title: sec.title,
            contentType: (sec.content_type || 'both') as 'movie' | 'series' | 'both',
            sourceType: (sec.source_type || 'latest') as any,
            sourceValue: sec.source_value,
            enabled: true,
            sortOrder: sec.sort_order || 0,
            itemLimit: Math.max(20, sec.item_limit || 20),
            movies
          };
        } catch (secErr) {
          console.warn(`Error resolving section "${sec.title}":`, secErr);
          return null;
        }
      })
    );

    return {
      slider: sliderItems,
      sections: (sections.filter(sec => sec && sec.movies && sec.movies.length > 0) as HomeSection[])
    };
  } catch (err) {
    console.error('Error fetching home sections data:', err);
    const fallback = await fetchLiveMedia(1, 24);
    return {
      slider: fallback.slice(0, 5),
      sections: DEFAULT_HOME_SECTIONS.map(sec => ({
        id: sec.id,
        sectionKey: sec.section_key,
        title: sec.title,
        contentType: sec.content_type as any,
        sourceType: sec.source_type as any,
        sourceValue: sec.source_value,
        enabled: true,
        sortOrder: sec.sort_order,
        itemLimit: sec.item_limit,
        movies: fallback.slice(0, sec.item_limit || 10)
      }))
    };
  }
}

// Unified Category content fetcher directly mirroring MovieRepository.getMoviesByCategory
export async function getMoviesByCategory(
  categoryTitle: string,
  page: number = 1,
  contentType: 'all' | 'movie' | 'series' = 'all'
): Promise<Movie[]> {
  const cleanTitle = categoryTitle.trim();
  if (!cleanTitle) return [];

  try {
    const normalizedTitle = cleanTitle.replace(/\s+/g, ' ').toUpperCase();

    // 1. Check if categoryTitle matches any configured home section
    const definitions = await fetchBujjukoConfigSections();
    const lookupTitle =
      normalizedTitle === 'LATEST SERIES' ? 'RECENTLY ADDED SERIES' :
      (normalizedTitle === 'LATEST MOVIES' || normalizedTitle === 'RECENTLY ADDED MOVIES' || normalizedTitle === 'LATEST ON BUJJUKO' || normalizedTitle === 'LATEST ON BUJJUKO MOVIES' || normalizedTitle === 'LATEST ON PEARLPIX') ? 'LATEST MOVIES' :
      cleanTitle;

    const exactSection = definitions.find(s => s.enabled && s.title.replace(/\s+/g, ' ').toUpperCase() === normalizedTitle);
    const configuredSection = exactSection || definitions.find(s => s.enabled && s.title.replace(/\s+/g, ' ').toUpperCase() === lookupTitle.replace(/\s+/g, ' ').toUpperCase());

    if (configuredSection) {
      const seeMoreSection = {
        ...configuredSection,
        item_limit: 24,
        itemLimit: 24
      };
      if (contentType === 'movie') seeMoreSection.content_type = 'movie';
      if (contentType === 'series') seeMoreSection.content_type = 'series';

      return fetchConfiguredHomeSection(seeMoreSection, page);
    }

    // 2. VJ Category
    if (
      cleanTitle.toUpperCase().startsWith('VJ ') ||
      cleanTitle.toUpperCase() === 'HEAVY Q' ||
      cleanTitle.toUpperCase() === 'ILLESS' ||
      cleanTitle.toUpperCase() === 'KK THE BEST'
    ) {
      return fetchByVj(cleanTitle, page, 24, contentType);
    }

    // 3. Genre
    return fetchByGenre(cleanTitle, page, 24, contentType);
  } catch (err) {
    console.warn(`Error in getMoviesByCategory for "${categoryTitle}":`, err);
    return fetchLiveMedia(page, 24);
  }
}

// Fetch movies by specific VJ with filter and pagination
export async function fetchByVj(
  vjName: string,
  page: number = 1,
  limit: number = 24,
  contentType: 'all' | 'movie' | 'series' = 'all'
): Promise<Movie[]> {
  const cleanName = vjName.replace(/^VJ\s+/i, '').trim();
  let filterStr = `(vjs ~ "${cleanName}" || title ~ "${cleanName}")`;

  if (contentType === 'movie') {
    filterStr += ` && (contentType = "movie" || (contentType != "series" && type !~ "series"))`;
  } else if (contentType === 'series') {
    filterStr += ` && (contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
  }

  const movies = await fetchLiveMedia(page, limit, filterStr);
  return movies.map(m => {
    if (!m.vj || m.vj.toLowerCase() === 'bujjuko movies' || m.vj.toLowerCase() === 'bujjuko movie center') {
      return { ...m, vj: `VJ ${cleanName.toUpperCase()}` };
    }
    return m;
  });
}

// Fetch movies by specific Genre with filter and pagination
export async function fetchByGenre(
  genre: string,
  page: number = 1,
  limit: number = 24,
  contentType: 'all' | 'movie' | 'series' = 'all'
): Promise<Movie[]> {
  const g = genre.trim();
  let filterStr = '';

  if (g.toLowerCase() === 'all') {
    filterStr = '';
  } else if (g.toLowerCase() === 'sci-fi' || g.toLowerCase() === 'science fiction' || g.toLowerCase() === 'sci - fi & fantasy' || g.toLowerCase() === 'sci-fi & fantasy') {
    // Pure Sci-Fi movies only - do NOT bundle Fantasy here
    filterStr = `(genres ~ "Sci-Fi" || genres ~ "SCI-FI" || genres ~ "Science Fiction" || type ~ "sci_fi" || type ~ "Sci-Fi")`;
  } else if (g.toLowerCase() === 'fantasy') {
    filterStr = `(genres ~ "Fantasy" || genres ~ "FANTASY" || type ~ "fantasy")`;
  } else if (g.toLowerCase() === 'animation' || g.toLowerCase() === 'kidz zone') {
    filterStr = `(genres ~ "Animation" || genres ~ "ANIMATION" || type ~ "animation")`;
  } else if (g.toLowerCase() === 'high school & romance' || g.toLowerCase() === 'romance') {
    filterStr = `(genres ~ "Romance" || genres ~ "ROMANCE" || type ~ "romance" || type ~ "high-school")`;
  } else if (g.toLowerCase() === 'korean' || g.toLowerCase() === 'k-dramas' || g.toLowerCase() === 'k-drama') {
    filterStr = `(type ~ "korean" || genres ~ "KOREAN" || title ~ "Korean")`;
  } else if (g.toLowerCase() === 'chinese') {
    filterStr = `(type ~ "chinese" || genres ~ "CHINESE" || title ~ "Chinese")`;
  } else {
    filterStr = `(genres ~ "${g.toUpperCase()}" || genres ~ "${g}" || type ~ "${g.toLowerCase()}")`;
  }

  if (contentType === 'movie') {
    filterStr = filterStr ? `(${filterStr}) && (contentType = "movie" || (contentType != "series" && type !~ "series"))` : `(contentType = "movie" || (contentType != "series" && type !~ "series"))`;
  } else if (contentType === 'series') {
    filterStr = filterStr ? `(${filterStr}) && (contentType = "series" || pearlpixType = "series") && contentType != "movie"` : `(contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
  }

  return fetchLiveMedia(page, limit, filterStr);
}

// Backward compatibility alias
export async function fetchMoviesByVj(
  vjName: string, 
  page: number = 1, 
  perPage: number = 24,
  contentType: 'all' | 'movie' | 'series' = 'all'
): Promise<{ movies: Movie[]; totalItems: number; totalPages: number }> {
  const movies = await fetchByVj(vjName, page, perPage, contentType);
  return {
    movies,
    totalItems: movies.length >= perPage ? page * perPage + 20 : (page - 1) * perPage + movies.length,
    totalPages: movies.length >= perPage ? page + 2 : page
  };
}

// Backward compatibility alias
export async function fetchMoviesByGenre(
  genreKey: string,
  page: number = 1,
  perPage: number = 24,
  contentType: 'all' | 'movie' | 'series' = 'all'
): Promise<{ movies: Movie[]; totalItems: number; totalPages: number }> {
  const movies = await fetchByGenre(genreKey, page, perPage, contentType);
  return {
    movies,
    totalItems: movies.length >= perPage ? page * perPage + 20 : (page - 1) * perPage + movies.length,
    totalPages: movies.length >= perPage ? page + 2 : page
  };
}

// Search movies directly from PocketBase server with query, type filter, and pagination
export async function searchMoviesFromServer(
  query: string,
  contentType: 'all' | 'movies' | 'series' = 'all',
  page: number = 1,
  perPage: number = 24
): Promise<{ movies: Movie[]; totalItems: number; totalPages: number }> {
  const clean = query.trim().replace(/["\\]/g, '');
  if (!clean) {
    let filter = '';
    if (contentType === 'movies') {
      filter = `(contentType = "movie" || (contentType != "series" && type !~ "series"))`;
    } else if (contentType === 'series') {
      filter = `(contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
    }
    const list = await fetchLiveMedia(page, perPage, filter);
    return {
      movies: list,
      totalItems: list.length >= perPage ? page * perPage + 20 : (page - 1) * perPage + list.length,
      totalPages: list.length >= perPage ? page + 2 : page
    };
  }

  const cleanNoVj = clean.replace(/^VJ\s+/i, '').trim();
  let filter = `(title ~ "${clean}" || title ~ "${cleanNoVj}" || vjs ~ "${cleanNoVj}" || genres ~ "${clean}" || description ~ "${clean}")`;

  if (contentType === 'movies') {
    filter = `(${filter}) && (contentType = "movie" || (contentType != "series" && type !~ "series"))`;
  } else if (contentType === 'series') {
    filter = `(${filter}) && (contentType = "series" || pearlpixType = "series") && contentType != "movie"`;
  }

  try {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
      sort: '-created',
      filter
    });
    const res = await fetch(`${POCKETBASE_BASE_URL}/api/collections/media/records?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.items)) {
        const mapped = data.items.map(mapPocketBaseItem);
        return {
          movies: mapped,
          totalItems: data.totalItems ?? mapped.length,
          totalPages: data.totalPages ?? 1
        };
      }
    }
  } catch (err) {
    console.warn('Server search failed:', err);
  }

  // Fallback to local matches if server search returned nothing or error
  const localMatches = FALLBACK_MOVIES.filter(m => {
    const q = clean.toLowerCase();
    const matchesText = m.title.toLowerCase().includes(q) ||
      m.vj.toLowerCase().includes(q) ||
      m.genre.toLowerCase().includes(q) ||
      (m.description && m.description.toLowerCase().includes(q));
    if (!matchesText) return false;
    if (contentType === 'movies' && m.isTvSeries) return false;
    if (contentType === 'series' && !m.isTvSeries) return false;
    return true;
  });

  return {
    movies: localMatches,
    totalItems: localMatches.length,
    totalPages: 1
  };
}

// Fetch subscription plans
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch(`${POCKETBASE_BASE_URL}/api/collections/subscription_plans/records?perPage=20&sort=sortOrder`, {
      headers: { Accept: 'application/json' }
    });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items.map((item: any) => ({
          id: item.id,
          planId: item.planId || 'plan',
          name: item.name,
          displayPrice: item.displayPrice || `UGX ${item.amount.toLocaleString()}`,
          amount: item.amount || 2000,
          durationDays: item.durationDays || 1,
          deviceLimit: item.deviceLimit || 2,
          downloadLimit: item.download_limit || 50,
          isAllAccess: item.isAllAccess ?? true,
          isPopular: item.isPopular ?? false,
          tag: item.tag || ''
        }));
      }
    }
  } catch (err) {
    console.warn('Error fetching subscription plans:', err);
  }

  return [
    {
      id: "plan-daily",
      planId: "daily_plan",
      name: "DAILY VIP PASS",
      displayPrice: "UGX 2,000",
      amount: 2000,
      durationDays: 1,
      deviceLimit: 2,
      downloadLimit: 20,
      isAllAccess: true,
      isPopular: false,
      tag: "Quick Watch"
    },
    {
      id: "plan-weekly",
      planId: "weekly_plan",
      name: "WEEKLY VIP PASS",
      displayPrice: "UGX 6,000",
      amount: 6000,
      durationDays: 7,
      deviceLimit: 3,
      downloadLimit: 80,
      isAllAccess: true,
      isPopular: true,
      tag: "Most Popular"
    },
    {
      id: "plan-monthly",
      planId: "monthly_plan",
      name: "MONTHLY VIP PASS",
      displayPrice: "UGX 18,000",
      amount: 18000,
      durationDays: 30,
      deviceLimit: 5,
      downloadLimit: 300,
      isAllAccess: true,
      isPopular: false,
      tag: "Best Value"
    }
  ];
}

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "New Releases Available!",
    message: "Fresh blockbusters translated by VJ Junior, VJ Jingo, VJ Emmy, and VJ Mark have just landed.",
    date: "Today",
    read: false,
    type: "movie"
  },
  {
    id: "notif-2",
    title: "High-Speed CDN Active",
    message: "Enjoy instant buffer-free streaming across all Uganda mobile networks including MTN & Airtel.",
    date: "Yesterday",
    read: false,
    type: "system"
  }
];
