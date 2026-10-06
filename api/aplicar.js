// POST /api/aplicar · recibe una solicitud de distribución, la guarda y avisa por correo.
import { leerAjustes, insertarFila } from './_supabase.js';
import { enviarCorreo, tablaHtml } from './_mail.js';
import { leerCuerpo, limpio, emailValido, urlValida, pareceSpam } from './_forms.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return; }
  const b = leerCuerpo(req);
  if (pareceSpam(b)) { res.status(200).json({ ok: true }); return; }

  const ajustes = await leerAjustes();
  if (!ajustes.applicationsOpen) { res.status(403).json({ error: 'Ahora mismo no aceptamos nuevas solicitudes.' }); return; }

  const s = {
    artist_name: limpio(b.artist_name, 120),
    name: limpio(b.name, 120),
    email: limpio(b.email, 160).toLowerCase(),
    spotify: limpio(b.spotify, 300),
    instagram: limpio(b.instagram, 300),
    youtube: limpio(b.youtube, 300),
    motivation: limpio(b.motivation, 2000),
    tracks: Math.max(0, Math.min(100000, parseInt(b.tracks, 10) || 0)),
    listeners: Math.max(0, Math.min(1000000000, parseInt(b.listeners, 10) || 0))
  };
  const errores = [];
  if (!s.artist_name) errores.push('nombre artístico');
  if (!s.name) errores.push('nombre');
  if (!emailValido(s.email)) errores.push('email');
  if (!s.spotify || !urlValida(s.spotify, ['spotify.com'])) errores.push('enlace de Spotify');
  if (!urlValida(s.instagram, ['instagram.com'])) errores.push('enlace de Instagram');
  if (!urlValida(s.youtube, ['youtube.com', 'youtu.be'])) errores.push('enlace de YouTube');
  if (s.motivation.length < 20) errores.push('por qué quieres distribuir con DistroNow (mínimo 20 caracteres)');
  if (!b.consent) errores.push('aceptación de la política de privacidad');
  if (errores.length) { res.status(400).json({ error: 'Revisa: ' + errores.join(', ') + '.' }); return; }

  let guardado = false, enviado = false;
  try { guardado = await insertarFila('applications', s); } catch (e) { console.error(e); }
  try {
    enviado = await enviarCorreo({
      asunto: 'Nueva solicitud de distribución · ' + s.artist_name,
      responderA: s.email,
      html: tablaHtml('Nueva solicitud de distribución', [
        ['Nombre artístico', s.artist_name], ['Nombre', s.name], ['Email', s.email],
        ['Spotify', s.spotify], ['Instagram', s.instagram], ['YouTube', s.youtube],
        ['Nº de tracks', String(s.tracks)], ['Oyentes mensuales', s.listeners.toLocaleString('es-ES')],
        ['Por qué DistroNow', s.motivation]
      ])
    });
  } catch (e) { console.error(e); }

  if (!guardado && !enviado) { res.status(500).json({ error: 'No hemos podido enviar tu solicitud. Escríbenos a info@distronow.com.' }); return; }
  res.status(200).json({ ok: true });
}
