// GET /api/settings · ajustes públicos de la web que se editan desde /admin.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './_supabase.js';

export default async function handler(req, res) {
  const ajustes = { carouselSpeed: 3 };
  try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const r = await fetch(SUPABASE_URL + '/rest/v1/settings?select=key,value', {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY }
      });
      if (r.ok) {
        (await r.json()).forEach((f) => {
          if (f.key === 'carousel_speed') ajustes.carouselSpeed = Number(f.value) || 3;
        });
      }
    }
  } catch (e) { /* se devuelven los valores por defecto */ }
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
  res.status(200).json(ajustes);
}
