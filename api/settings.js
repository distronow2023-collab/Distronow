// GET /api/settings · ajustes públicos de la web que se editan desde /admin.
import { leerAjustes } from './_supabase.js';

export default async function handler(req, res) {
  const ajustes = await leerAjustes();
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=600');
  res.status(200).json(ajustes);
}
