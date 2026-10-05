// GET /api/artistas: foto y enlace de Spotify de cada artista (oEmbed público, sin claves).
// Para cambiar la lista, edita ARTISTAS. Si un artista no tiene ID, deja id: ''.

const ARTISTAS = [
  { nombre: 'Qba0gang', id: '2NMRlEX8JsYhetkzAEei4F' },
  { nombre: 'Pochi', id: '7wbgA4GKIqnYmnUUJbRdrb' },
  { nombre: 'TRAPMALOY', id: '2XDtNhmtCGeQb2JHM6VZH0' },
  { nombre: 'Kiillyy', id: '6c2BhAXg9skFH774m3SMkl' },
  { nombre: '450DEMON', id: '3pxVZkdzJCb7brlCEr3iip' },
  { nombre: 'RANDALL13', id: '7ITzhP0voK7pyFGUWNJ39v' },
  { nombre: 'Soki Beats', id: '' },
  { nombre: 'AP450', id: '2rF6qcSVrne9xB5SMONqOs' },
  { nombre: 'Lilkovo', id: '5bXe0ibQ6lsPnTyx5pi4mP' },
  { nombre: 'qymyco', id: '0QNlPXdnS7UtOSC2hyOje5' },
  { nombre: "GRINDIN'", id: '' },
  { nombre: 'K9OG', id: '' },
  { nombre: 'BabyMurda', id: '2kz8jl2xrOh8D7hP2VMvQP' },
  { nombre: 'Mendez 47', id: '2UqlJuqPrNCJPVFa9cOEtg' },
  { nombre: 'Dylanss0n', id: '0MjDqqTA28UrUZhOiRRour' },
  { nombre: 'Sav28', id: '40mwZLIT1HDEiJ5YjqvBBD' }
];

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
  const datos = await Promise.all(
    ARTISTAS.map(async (a) => {
      const url = a.id ? 'https://open.spotify.com/artist/' + a.id : '';
      const foto = url ? await fotoDe(url) : null;
      return { nombre: a.nombre, id: a.id, url, foto };
    })
  );
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  res.status(200).json(datos);
}
