// POST /api/invitar · el admin invita a una persona de un sello (le llega un email para entrar en /sellos).
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } from './_supabase.js';
import { leerCuerpo, limpio, emailValido } from './_forms.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !SUPABASE_URL || !SUPABASE_SERVICE_KEY) { res.status(401).json({ error: 'Falta configuración o sesión.' }); return; }

  // Solo administradores
  const adm = await fetch(SUPABASE_URL + '/rest/v1/admins?select=email', { headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token } });
  const lista = adm.ok ? await adm.json() : [];
  if (!lista.length) { res.status(403).json({ error: 'Solo administradores.' }); return; }

  const email = limpio(leerCuerpo(req).email, 160).toLowerCase();
  if (!emailValido(email)) { res.status(400).json({ error: 'Email no válido.' }); return; }
  const origen = (req.headers['x-forwarded-proto'] || 'https') + '://' + req.headers.host;
  const r = await fetch(SUPABASE_URL + '/auth/v1/invite?redirect_to=' + encodeURIComponent(origen + '/sellos'), {
    method: 'POST',
    headers: { apikey: SUPABASE_SERVICE_KEY, Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!r.ok) {
    const t = await r.text();
    if (/already/i.test(t)) { res.status(200).json({ ok: true, existente: true }); return; }
    res.status(400).json({ error: 'No se pudo invitar: ' + t.slice(0, 200) }); return;
  }
  res.status(200).json({ ok: true });
}
