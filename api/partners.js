// GET /api/partners · partners visibles para la sección "Trabajamos con".
import { leerTabla } from './_supabase.js';

export default async function handler(req, res) {
  let datos = [];
  try {
    const filas = await leerTabla('partners');
    datos = (filas || []).map((f) => ({ nombre: f.name, logo: f.logo_url || '', web: f.website || '' }));
  } catch (e) {
    datos = [];
  }
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=3600');
  res.status(200).json(datos);
}
