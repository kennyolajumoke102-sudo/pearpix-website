import { Movie, Episode, ServerLink } from '../types';
import resolvedConfiguredItemsJson from '../data/resolvedConfiguredItems.json';
import realBujjukoConfig from '../data/realBujjukoConfig.json';

export interface MunopixApiResponse {
  ok: boolean;
  http_status: number;
  request?: {
    type: 'movie' | 'series';
    movie_id?: number;
    series_id?: number;
    season_number?: number;
    episode_number?: number;
  };
  endpoint?: string;
  response?: {
    id?: any;
    stream_url?: string;
    video_url?: string;
    remux_url?: string;
    embed_url?: string;
    format?: string;
    is_mkv?: boolean;
    file_size?: string | null;
    storage_source?: string;
    expires_at?: string;
    refresh_after_seconds?: number;
    vj?: string | null;
  };
  error?: string;
}

export interface ResolvedStreamResult {
  streamUrl: string;
  downloadUrl: string;
  endpoint: string;
  requestUrl: string;
  format?: string;
  fileSize?: string;
  isMkv?: boolean;
  remuxUrl?: string;
  embedUrl?: string;
  expiresAt?: string;
  servers: ServerLink[];
  apiPayload?: MunopixApiResponse;
}

// Build lookup maps once
const pbIdToNumericId = new Map<string, number>();
const titleToNumericId = new Map<string, { id: number; isSeries: boolean }>();

function cleanTitleForMatching(title: string): string {
  return (title || '')
    .replace(/(\s*-\s*)?vj\s+[\w\s]+/gi, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

try {
  // 1. Seed from resolvedConfiguredItemsJson
  for (const [key, val] of Object.entries(resolvedConfiguredItemsJson)) {
    const num = parseInt(key, 10);
    if (!isNaN(num) && num > 0) {
      const record = val as any;
      const isSeries = record.contentType === 'series' || String(record.pearlpixId || '').startsWith('series_');
      if (record.id) {
        pbIdToNumericId.set(record.id, num);
      }
      if (record.pearlpixId) {
        pbIdToNumericId.set(String(record.pearlpixId), num);
      }
      const cleaned = cleanTitleForMatching(record.title || '');
      if (cleaned) {
        titleToNumericId.set(cleaned, { id: num, isSeries });
      }
    }
  }

  // 2. Seed from realBujjukoConfig.json
  if (Array.isArray((realBujjukoConfig as any)?.items)) {
    for (const item of (realBujjukoConfig as any).items) {
      if (item.reelplexi_id && typeof item.reelplexi_id === 'number') {
        const isSeries = item.content_type === 'series';
        if (item.title) {
          const cleaned = cleanTitleForMatching(item.title);
          if (cleaned && !titleToNumericId.has(cleaned)) {
            titleToNumericId.set(cleaned, { id: item.reelplexi_id, isSeries });
          }
        }
      }
    }
  }
} catch (err) {
  console.warn('Error populating Munopix numeric ID lookup maps:', err);
}

/**
 * Resolve positive integer ID for a given movie/series
 */
export function resolveItemNumericId(movie: Movie): { id: number; isSeries: boolean } | null {
  const isSeries = !!movie.isTvSeries;

  // 1. Explicit numericId
  if (typeof movie.numericId === 'number' && movie.numericId > 0) {
    return { id: movie.numericId, isSeries };
  }

  // 2. Direct digits from string ID
  if (/^\d+$/.test(movie.id)) {
    const n = parseInt(movie.id, 10);
    if (n > 0) return { id: n, isSeries };
  }

  // 3. pearlpixId property
  if (movie.pearlpixId) {
    const digits = movie.pearlpixId.replace(/\D+/g, '');
    if (digits) {
      const n = parseInt(digits, 10);
      if (n > 0) return { id: n, isSeries: isSeries || movie.pearlpixId.startsWith('series_') };
    }
  }

  // 4. pbIdToNumericId lookup
  if (pbIdToNumericId.has(movie.id)) {
    return { id: pbIdToNumericId.get(movie.id)!, isSeries };
  }

  // 5. Title matching
  const cleanedTitle = cleanTitleForMatching(movie.title);
  if (cleanedTitle && titleToNumericId.has(cleanedTitle)) {
    const match = titleToNumericId.get(cleanedTitle)!;
    return { id: match.id, isSeries: isSeries || match.isSeries };
  }

  // 6. Regex digits from id (e.g. "movie_4773" or "series-1036")
  const idDigits = (movie.id || '').replace(/\D+/g, '');
  if (idDigits && idDigits.length >= 3) {
    const n = parseInt(idDigits, 10);
    if (n > 0) return { id: n, isSeries };
  }

  return null;
}

// In-memory cache for API responses: key -> MunopixApiResponse
const streamApiCache = new Map<string, MunopixApiResponse>();

/**
 * Fetch streaming and download URLs from the Munopix test.php API
 * Endpoint:
 * - Movies: https://85.190.254.61/munopix/test.php?type=movie&id=<id>
 * - Series: https://85.190.254.61/munopix/test.php?type=series&id=<id>&season=<season>&episode=<episode>
 */
export async function fetchMunopixStream(options: {
  type: 'movie' | 'series';
  id: number;
  season?: number;
  episode?: number;
}): Promise<MunopixApiResponse | null> {
  const { type, id } = options;
  const season = options.season || 1;
  const episode = options.episode || 1;

  const cacheKey = `${type}_${id}_s${season}_e${episode}`;
  if (streamApiCache.has(cacheKey)) {
    return streamApiCache.get(cacheKey)!;
  }

  const queryParams = type === 'series'
    ? `type=series&id=${id}&season=${season}&episode=${episode}`
    : `type=movie&id=${id}`;

  // Candidate URLs in order of reliability for local dev, Vercel, and direct connections:
  // 1. Vercel serverless proxy endpoint /api/stream
  // 2. Vercel serverless proxy endpoint /api/munopix
  // 3. Rewritten proxy /munopix-api
  // 4. Direct HTTP server IP
  // 5. Direct HTTPS server IP
  const candidateUrls = [
    `/api/stream?${queryParams}`,
    `/api/munopix?${queryParams}`,
    `/munopix-api/munopix/test.php?${queryParams}`,
    `http://85.190.254.61/munopix/test.php?${queryParams}`,
    `https://85.190.254.61/munopix/test.php?${queryParams}`
  ];

  for (const url of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data: MunopixApiResponse = await res.json();
        if (data && data.ok && data.response?.video_url) {
          streamApiCache.set(cacheKey, data);
          return data;
        }
      }
    } catch {
      // Continue to next candidate
    }
  }

  return null;
}

/**
 * High-level resolver: given a movie and optional episode,
 * contacts the Munopix API to resolve video_url for streaming and download.
 * Falls back gracefully to pre-existing videoUrl if API is unavailable.
 */
export async function resolveStreamAndDownload(
  movie: Movie,
  episode?: Episode
): Promise<ResolvedStreamResult> {
  const idInfo = resolveItemNumericId(movie);
  const isSeries = idInfo ? idInfo.isSeries : !!movie.isTvSeries;
  const seasonNum = episode?.season || 1;
  const episodeNum = episode?.episode || episode?.episodeNumber || 1;

  let apiResponse: MunopixApiResponse | null = null;
  let requestUrl = '';

  if (idInfo && idInfo.id > 0) {
    const q = isSeries
      ? `type=series&id=${idInfo.id}&season=${seasonNum}&episode=${episodeNum}`
      : `type=movie&id=${idInfo.id}`;
    requestUrl = `https://85.190.254.61/munopix/test.php?${q}`;

    apiResponse = await fetchMunopixStream({
      type: isSeries ? 'series' : 'movie',
      id: idInfo.id,
      season: seasonNum,
      episode: episodeNum
    });
  }

  // If Munopix API returned valid video_url, use it!
  if (apiResponse?.ok && apiResponse.response?.video_url) {
    const resp = apiResponse.response;
    const videoUrl: string = apiResponse.response.video_url;
    const streamUrl: string = apiResponse.response.stream_url || videoUrl;
    const remuxUrl = resp.remux_url;
    const endpoint = apiResponse.endpoint || `https://api.pearlpix.xyz/v1/${isSeries ? `series/${idInfo?.id}/seasons/${seasonNum}/episodes/${episodeNum}/stream` : `movies/${idInfo?.id}/stream`}`;

    // Build servers list
    const servers: ServerLink[] = [
      {
        id: 'server-primary-video',
        name: 'Server 1 (Primary High-Speed)',
        label: 'Primary Video Stream',
        quality: '1080p HD',
        url: videoUrl
      }
    ];

    if (streamUrl && streamUrl !== videoUrl) {
      servers.push({
        id: 'server-stream-proxy',
        name: 'Server 2 (Direct Proxy)',
        label: 'Direct Stream',
        quality: '1080p',
        url: streamUrl
      });
    }

    if (remuxUrl) {
      servers.push({
        id: 'server-remux',
        name: 'Server 3 (Remux Transcoded)',
        label: 'Remux Stream',
        quality: '1080p',
        url: remuxUrl
      });
    }

    // Append existing servers if available
    if (Array.isArray(movie.servers)) {
      movie.servers.forEach((s, idx) => {
        if (s.url && s.url !== videoUrl && s.url !== streamUrl && s.url !== remuxUrl) {
          servers.push({
            id: s.id || `server-legacy-${idx}`,
            name: s.name || `Server ${servers.length + 1}`,
            label: s.label || 'Mirror',
            quality: s.quality || 'HD',
            url: s.url
          });
        }
      });
    }

    return {
      streamUrl: videoUrl,
      downloadUrl: videoUrl,
      endpoint,
      requestUrl,
      format: resp.format,
      fileSize: resp.file_size || undefined,
      isMkv: resp.is_mkv,
      remuxUrl,
      embedUrl: resp.embed_url,
      expiresAt: resp.expires_at,
      servers,
      apiPayload: apiResponse
    };
  }

  // Graceful fallback to existing videoUrl / episode links
  const fallbackUrl = episode?.videoUrl ||
    episode?.downloadUrl ||
    movie.videoUrl ||
    (movie.servers && movie.servers[0]?.url) ||
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const defaultEndpoint = `https://api.pearlpix.xyz/v1/${isSeries ? `series/${idInfo?.id || movie.id}/stream` : `movies/${idInfo?.id || movie.id}/stream`}`;
  const defaultRequestUrl = idInfo
    ? `https://85.190.254.61/munopix/test.php?type=${isSeries ? 'series' : 'movie'}&id=${idInfo.id}`
    : `https://api.pearlpix.xyz/v1/movies/${movie.id}/stream`;

  const servers: ServerLink[] = Array.isArray(movie.servers) && movie.servers.length > 0
    ? movie.servers
    : [{ id: 'server-default', name: 'Server 1 (Default)', quality: '1080p', url: fallbackUrl }];

  return {
    streamUrl: fallbackUrl,
    downloadUrl: fallbackUrl,
    endpoint: defaultEndpoint,
    requestUrl: defaultRequestUrl,
    servers,
    apiPayload: apiResponse || undefined
  };
}
