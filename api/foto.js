// GET /api/foto?id=<spotify_artist_id> · redirige a la foto del artista en Spotify (para las miniaturas del panel).
export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || '');
  if (!/^[A-Za-z0-9]{22}$/.test(id)) { res.status(400).end(); return; }
  try {
    const url = 'https://open.spotify.com/artist/' + id;
    const r = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
    const d = r.ok ? await r.json() : {};
    if (!d.thumbnail_url) { res.status(404).end(); return; }
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.redirect(302, d.thumbnail_url);
  } catch (e) {
    res.status(502).end();
  }
}
