// Utilidades compartidas por las funciones de /api (los archivos que empiezan por _ no son rutas públicas).
// Acepta la URL con o sin /rest/v1 o barra final (https://xxxx.supabase.co)
export const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '').replace(/\/+$/, '');
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

export async function leerTabla(tabla) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const url = SUPABASE_URL + '/rest/v1/' + tabla + '?select=*&visible=eq.true&order=position.asc,name.asc';
  const r = await fetch(url, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY } });
  if (!r.ok) throw new Error('Supabase ' + r.status);
  return r.json();
}

// Lista de respaldo si Supabase aún no está configurado
export const ARTISTAS_RESPALDO = [{"nombre": "Qba0gang", "id": "2NMRlEX8JsYhetkzAEei4F"}, {"nombre": "Pochi", "id": "7wbgA4GKIqnYmnUUJbRdrb"}, {"nombre": "TRAPMALOY", "id": "2XDtNhmtCGeQb2JHM6VZH0"}, {"nombre": "Kiillyy", "id": "6c2BhAXg9skFH774m3SMkl"}, {"nombre": "450DEMON", "id": "3pxVZkdzJCb7brlCEr3iip"}, {"nombre": "RANDALL13", "id": "7ITzhP0voK7pyFGUWNJ39v"}, {"nombre": "Soki Beats", "id": "3HOFsPM3TlhWUQUqNM0An2"}, {"nombre": "AP450", "id": "2rF6qcSVrne9xB5SMONqOs"}, {"nombre": "Lilkovo", "id": "5bXe0ibQ6lsPnTyx5pi4mP"}, {"nombre": "qymyco", "id": "0QNlPXdnS7UtOSC2hyOje5"}, {"nombre": "K9OG", "id": "3ZuhUNDs6lQ3ifEwAQ22z5"}, {"nombre": "BabyMurda", "id": "2kz8jl2xrOh8D7hP2VMvQP"}, {"nombre": "Mendez 47", "id": "2UqlJuqPrNCJPVFa9cOEtg"}, {"nombre": "Dylanss0n", "id": "0MjDqqTA28UrUZhOiRRour"}, {"nombre": "Sav28", "id": "40mwZLIT1HDEiJ5YjqvBBD"}];

// Clave de servicio: solo en el servidor (variable SUPABASE_SERVICE_ROLE_KEY en Vercel). Nunca en el navegador.
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function insertarFila(tabla, fila) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return false;
  const r = await fetch(SUPABASE_URL + '/rest/v1/' + tabla, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify(fila)
  });
  if (!r.ok) throw new Error('Supabase ' + r.status + ' ' + (await r.text()));
  return true;
}

export async function leerAjustes() {
  const ajustes = { carouselSpeed: 3, applicationsOpen: true, loginDark: false, tsfThreshold: 1 };
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return ajustes;
  try {
    const r = await fetch(SUPABASE_URL + '/rest/v1/settings?select=key,value', {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + SUPABASE_ANON_KEY }
    });
    if (r.ok) {
      (await r.json()).forEach((f) => {
        if (f.key === 'carousel_speed') ajustes.carouselSpeed = Number(f.value) || 3;
        if (f.key === 'applications_open') ajustes.applicationsOpen = f.value === 'true';
        if (f.key === 'login_dark') ajustes.loginDark = f.value === 'true';
        if (f.key === 'tsf_threshold_aud') ajustes.tsfThreshold = Number(f.value) || 1;
      });
    }
  } catch (e) { /* valores por defecto */ }
  return ajustes;
}
