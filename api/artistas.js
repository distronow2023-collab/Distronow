// GET /api/artistas · artistas visibles con foto de Spotify (oEmbed público, sin claves).
// La lista se gestiona desde /admin (Supabase). Si Supabase no está configurado, usa la de respaldo.
import { leerTabla, ARTISTAS_RESPALDO } from './_supabase.js';

async function fotoDe(url) {
  try {
    const r = await fetch('https://open.spotify.com/oembed?url=' + encodeURIComponent(url));
    if (!r.ok) return null;
    const d = await r.json();
    return d.thumbnail_url || null;
  } catch (e) {
    return null;
  }
}

export default async function handler(req, res) {
  let lista;
  try {
    const filas = await leerTabla('artists');
    lista = filas ? filas.slice(0, 50).map((f) => ({ nombre: f.name, id: f.spotify_id || '' })) : ARTISTAS_RESPALDO;
  } catch (e) {
    lista = ARTISTAS_RESPALDO;
  }
  const datos = await Promise.all(
    lista.map(async (a) => {
      const url = a.id ? 'https://open.spotify.com/artist/' + a.id : '';
      return { nombre: a.nombre, id: a.id, url, foto: url ? await fotoDe(url) : null };
    })
  );
  // Caché corta para que los cambios del panel se vean en pocos minutos
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  res.status(200).json(datos);
}
