export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const urlObj = new URL(req.url || '', `http://${req.headers?.host || 'localhost'}`);
    const type = urlObj.searchParams.get('type') || req.query?.type || 'movie';
    const id = urlObj.searchParams.get('id') || req.query?.id || '';
    const season = urlObj.searchParams.get('season') || req.query?.season;
    const episode = urlObj.searchParams.get('episode') || req.query?.episode;

    const queryParams = new URLSearchParams();
    if (type) queryParams.set('type', String(type));
    if (id) queryParams.set('id', String(id));
    if (season) queryParams.set('season', String(season));
    if (episode) queryParams.set('episode', String(episode));

    const targetUrl = `http://85.190.254.61/munopix/test.php?${queryParams.toString()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PearlPix-Vercel-Proxy/1.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    const data = await upstreamRes.json();
    return res.status(200).json(data);
  } catch (err: any) {
    console.error('Munopix stream proxy error:', err);
    return res.status(500).json({
      ok: false,
      error: err?.message || 'Failed to fetch stream from Munopix upstream'
    });
  }
}
