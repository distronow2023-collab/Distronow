// Utilidades de validación compartidas por los formularios.
export function leerCuerpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}
export const limpio = (v, max) => String(v == null ? '' : v).trim().slice(0, max || 500);
export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
export function urlValida(u, dominios) {
  if (!u) return true;
  try {
    const x = new URL(u);
    return /^https?:$/.test(x.protocol) && (!dominios || dominios.some((d) => x.hostname === d || x.hostname.endsWith('.' + d)));
  } catch (e) { return false; }
}
// Antispam: campo oculto relleno o envío demasiado rápido (< 3 s desde que se abrió el formulario)
export function pareceSpam(b) {
  if (b.website) return true;
  const t = Number(b.t || 0);
  return !t || Date.now() - t < 3000;
}
