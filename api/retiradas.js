// POST /api/retiradas · un sello pide retirar pistas que no compensan el track fee.
// Usa el token del usuario: las reglas de la base de datos (RLS) solo le dejan pedir pistas de sus propias cuentas.
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './_supabase.js';
import { enviarCorreo, tablaHtml } from './_mail.js';
import { leerCuerpo, limpio } from './_forms.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token || !SUPABASE_URL) { res.status(401).json({ error: 'Sesión no válida' }); return; }
  const b = leerCuerpo(req);
  const labelId = parseInt(b.label_id, 10);
  const items = Array.isArray(b.items) ? b.items.slice(0, 500) : [];
  const motivo = limpio(b.reason, 500);
  if (!labelId || !items.length) { res.status(400).json({ error: 'No hay pistas seleccionadas.' }); return; }

  const h = { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  const filas = items.map((it) => ({ label_id: labelId, isrc: limpio(it.isrc, 20), email: limpio(it.email, 160).toLowerCase(), reason: motivo }));
  const r = await fetch(SUPABASE_URL + '/rest/v1/takedown_requests', { method: 'POST', headers: { ...h, Prefer: 'return=minimal' }, body: JSON.stringify(filas) });
  if (!r.ok) { res.status(403).json({ error: 'No se ha podido registrar la solicitud (¿pistas de otro sello?).' }); return; }

  let quien = '', sello = '';
  try {
    const u = await fetch(SUPABASE_URL + '/auth/v1/user', { headers: h }); quien = (await u.json()).email || '';
    const l = await fetch(SUPABASE_URL + '/rest/v1/labels?select=name&id=eq.' + labelId, { headers: h }); sello = ((await l.json())[0] || {}).name || '';
  } catch (e) { /* solo para el correo */ }
  try {
    await enviarCorreo({
      asunto: 'Retirada solicitada · ' + sello + ' · ' + filas.length + ' pista(s)',
      responderA: quien,
      html: tablaHtml('Solicitud de retirada de pistas', [
        ['Sello', sello], ['Solicitado por', quien], ['Pistas', String(filas.length)], ['Motivo', motivo],
        ['ISRC', filas.map((f) => f.isrc + ' (' + f.email + ')').join('\n')]
      ])
    });
  } catch (e) { console.error(e); }
  res.status(200).json({ ok: true, count: filas.length });
}
