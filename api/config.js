// GET /api/config · datos públicos que necesita /admin para conectarse a Supabase.
// La "anon key" es pública por diseño: la seguridad la ponen las reglas (RLS) de la base de datos.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './_supabase.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY });
}
