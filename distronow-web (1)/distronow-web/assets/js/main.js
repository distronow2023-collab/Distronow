(function () {
  'use strict';

  /* ---------- Datos ---------- */
  var PLATFORMS = ['Spotify', 'Apple Music', 'YouTube Music', 'Amazon Music', 'TikTok', 'Deezer', 'Tidal', 'Instagram'];

  var STAGES = [
    { num: '01', name: 'Distribución', short: 'DISTRIBUCIÓN', big: 'DISTRIBUCIÓN', text: 'Preparamos y enviamos tu lanzamiento con metadatos, ISRC, UPC y portada revisados, para que llegue sin rechazos.' },
    { num: '02', name: 'Plataformas', short: 'PLATAFORMAS', big: 'PLATAFORMAS', text: 'Tu música disponible en las principales tiendas y plataformas digitales del mundo.' },
    { num: '03', name: 'Royalties', short: 'ROYALTIES', big: 'ROYALTIES', text: 'Cada reproducción genera ingresos. Te los reportamos cada mes de forma clara, tema a tema.' },
    { num: '04', name: 'Analytics', short: 'ANALYTICS', big: 'ANALYTICS', text: 'Datos de escucha por plataforma, país y tema para tomar decisiones con información, no a ciegas.' },
    { num: '05', name: 'Cobrar tu dinero', short: 'COBRAR', big: 'COBRAR TU DINERO', text: 'Lo que generan tus temas llega a tu cuenta, con el detalle de cada pago y sin letra pequeña.' }
  ];

  var SERVICES = [
    { num: '01', name: 'Distribución', text: 'Tu música en las plataformas digitales, con control de catálogo y royalties.' },
    { num: '02', name: 'Publishing · HANGAAR', text: 'Gestión editorial de tus obras para que cobres también como autor.' },
    { num: '03', name: 'Estrategia y asesoramiento', text: 'Lanzamientos planificados, datos claros y decisiones con cabeza.' },
    { num: '04', name: 'Desarrollo artístico', text: 'Acompañamiento real para crecer: roster pequeño, atención de verdad.' }
  ];

  // Respaldo si /api/artistas no responde (por ejemplo, abriendo el HTML en local).
  // La lista "oficial" vive en /api/artistas.js.
  var ARTISTS_FALLBACK = [
    ['Qba0gang', '2NMRlEX8JsYhetkzAEei4F'], ['Pochi', '7wbgA4GKIqnYmnUUJbRdrb'], ['TRAPMALOY', '2XDtNhmtCGeQb2JHM6VZH0'],
    ['Kiillyy', '6c2BhAXg9skFH774m3SMkl'], ['450DEMON', '3pxVZkdzJCb7brlCEr3iip'], ['RANDALL13', '7ITzhP0voK7pyFGUWNJ39v'],
    ['Soki Beats', ''], ['AP450', '2rF6qcSVrne9xB5SMONqOs'], ['Lilkovo', '5bXe0ibQ6lsPnTyx5pi4mP'], ['qymyco', '0QNlPXdnS7UtOSC2hyOje5'],
    ["GRINDIN'", ''], ['K9OG', ''], ['BabyMurda', '2kz8jl2xrOh8D7hP2VMvQP'], ['Mendez 47', '2UqlJuqPrNCJPVFa9cOEtg'],
    ['Dylanss0n', '0MjDqqTA28UrUZhOiRRour'], ['Sav28', '40mwZLIT1HDEiJ5YjqvBBD']
  ].map(function (a) {
    return { nombre: a[0], id: a[1], url: a[1] ? 'https://open.spotify.com/artist/' + a[1] : '', foto: null };
  });

  var LOGIN_URL = 'https://distro.distronow.com/login-iframe';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }

  /* ---------- Visuales de cada fase ---------- */
  function visual(i) {
    if (i === 0) {
      return '<div class="vis__label"><span>NUEVO LANZAMIENTO</span><span class="accent-text">ENVIADO</span></div>' +
        ['Metadatos', 'ISRC', 'UPC', 'Portada'].map(function (l, k) {
          return '<div class="vis__row" style="animation-delay:' + (k * 0.09) + 's"><span>' + l + '</span><b>✓</b></div>';
        }).join('') + '<div class="vis__bar"><span></span></div>';
    }
    if (i === 1) {
      return '<div class="chips">' + PLATFORMS.map(function (p, k) {
        return '<span class="chip" style="animation-delay:' + (k * 0.05) + 's">' + p + '</span>';
      }).join('') + '<span class="chip chip--plain" style="animation-delay:.5s">y muchas más</span></div>';
    }
    if (i === 2) {
      return '<div class="vis__label"><span>INGRESOS POR REPRODUCCIONES</span><span>MENSUAL</span></div>' +
        '<svg class="chart" viewBox="0 0 400 140" aria-hidden="true">' +
        '<line x1="0" y1="135" x2="400" y2="135" stroke="rgba(255,255,255,.15)"/>' +
        '<line x1="0" y1="90" x2="400" y2="90" stroke="rgba(255,255,255,.06)"/>' +
        '<line x1="0" y1="45" x2="400" y2="45" stroke="rgba(255,255,255,.06)"/>' +
        '<path d="M0 120 L50 112 L100 116 L150 96 L200 88 L250 70 L300 62 L350 40 L400 26" fill="none" stroke="#009DFF" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>';
    }
    if (i === 3) {
      return '<div class="vis__label"><span>ESCUCHAS POR PLATAFORMA</span></div>' +
        [['Spotify', 86], ['YouTube', 64], ['Apple Music', 47], ['TikTok', 38], ['Amazon Music', 22]].map(function (a, k) {
          return '<div class="hbar"><span>' + a[0] + '</span><div class="hbar__track"><span style="width:' + a[1] + '%;animation-delay:' + (k * 0.08) + 's"></span></div></div>';
        }).join('');
    }
    return '<div class="vis__label"><span>TU PAGO</span><span class="accent-text">ENVIADO</span></div>' +
      ['Liquidación del periodo', 'Detalle por tema', 'Transferencia a tu cuenta'].map(function (l, k) {
        return '<div class="vis__row" style="animation-delay:' + (k * 0.1) + 's"><span>' + l + '</span><b>✓</b></div>';
      }).join('') + '<div class="vis__bar"><span></span></div>';
  }

  /* ---------- Intro ---------- */
  function runIntro(done) {
    var intro = $('#intro');
    var seen = false;
    try { seen = sessionStorage.getItem('dn-intro') === '1'; } catch (e) { /* storage no disponible */ }
    if (seen || reduceMotion) { intro.hidden = true; done(); return; }

    document.body.classList.add('is-locked');
    var stageEl = $('#introStage');
    var segs = intro.querySelectorAll('.intro__segs span');
    var timers = [];
    var finished = false;

    function show(k) {
      if (k < 5) {
        var s = STAGES[k];
        stageEl.innerHTML = '<div class="intro__head"><span class="mono" style="font-size:13px;letter-spacing:.3em;color:#4FB8FF">' + s.num + ' / 05</span>' +
          '<span class="intro__big">' + s.big + '</span></div><div class="intro__card vis">' + visual(k) + '</div>';
      } else {
        stageEl.innerHTML = '<img class="intro__logo" src="assets/img/dn-mark-blue.png" alt="DistroNow">' +
          '<span class="intro__word">DISTRONOW</span><span class="intro__tag">TU EQUIPO, TU SOLUCIÓN</span>';
      }
      for (var j = 0; j < segs.length; j++) segs[j].classList.toggle('is-on', j <= k);
    }

    function end() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      try { sessionStorage.setItem('dn-intro', '1'); } catch (e) { /* ignorar */ }
      intro.classList.add('is-leaving');
      document.body.classList.remove('is-locked');
      setTimeout(function () { intro.hidden = true; }, 750);
      done();
    }

    var step = 1050;
    for (var k = 0; k <= 5; k++) {
      (function (n) { timers.push(setTimeout(function () { show(n); }, 250 + n * step)); })(k);
    }
    timers.push(setTimeout(end, 250 + 5 * step + 1250));
    $('#skipIntro').addEventListener('click', end);
  }

  /* ---------- Recorrido ---------- */
  function initJourney() {
    var panel = $('#journeyPanel');
    var track = $('#journeyTrack');
    var fill = $('#journeyFill');
    var dot = $('#journeyDot');
    var counter = $('#stageCounter');
    var playBtn = $('#playJourney');
    var nodesWrap = $('#journeyNodes');
    var p = 0.1, current = -1, playing = false, raf = null;

    nodesWrap.innerHTML = STAGES.map(function (s, i) {
      return '<div class="node" style="left:' + ((i + 0.5) / 5 * 100) + '%"><span class="node__dot"></span>' +
        '<span class="node__label"><b>' + s.num + '</b><span>' + s.short + '</span></span></div>';
    }).join('');
    var nodes = nodesWrap.querySelectorAll('.node');

    function render() {
      var idx = Math.min(4, Math.floor(p * 5));
      fill.style.width = (p * 100) + '%';
      dot.style.left = (p * 100) + '%';
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].classList.toggle('is-done', p >= (i + 0.5) / 5);
        nodes[i].classList.toggle('is-current', i === idx);
      }
      if (idx !== current) {
        current = idx;
        var s = STAGES[idx];
        counter.textContent = s.num + ' / 05';
        track.setAttribute('aria-valuenow', String(idx + 1));
        track.setAttribute('aria-valuetext', s.name);
        panel.innerHTML = '<div class="stage"><div class="stage__text"><span class="stage__num">' + s.num + ' / 05</span>' +
          '<h3 class="stage__name">' + s.name + '</h3><p class="stage__desc">' + s.text + '</p></div>' +
          '<div class="vis">' + visual(idx) + '</div></div>';
      }
    }

    function play() {
      cancelAnimationFrame(raf);
      playing = true;
      playBtn.textContent = 'Reproduciendo…';
      var t0 = performance.now();
      var dur = reduceMotion ? 1 : 10000;
      (function tick(now) {
        p = Math.min(1, (now - t0) / dur);
        render();
        if (p < 1) { raf = requestAnimationFrame(tick); }
        else { playing = false; playBtn.textContent = '▶ Ver el recorrido'; }
      })(t0);
    }

    function setFromEvent(e) {
      if (playing) return;
      var r = track.getBoundingClientRect();
      p = Math.max(0, Math.min(1, (e.clientX - r.left) / Math.max(1, r.width)));
      render();
    }

    track.addEventListener('mousemove', setFromEvent);
    track.addEventListener('click', function (e) {
      if (playing) { cancelAnimationFrame(raf); playing = false; playBtn.textContent = '▶ Ver el recorrido'; }
      setFromEvent(e);
    });
    track.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      cancelAnimationFrame(raf); playing = false; playBtn.textContent = '▶ Ver el recorrido';
      var idx = Math.min(4, Math.floor(p * 5)) + (e.key === 'ArrowRight' ? 1 : -1);
      idx = Math.max(0, Math.min(4, idx));
      p = (idx + 0.5) / 5;
      render();
    });
    playBtn.addEventListener('click', play);

    render();
    return { play: play };
  }

  /* ---------- Artistas ---------- */
  function initials(name) {
    var clean = name.replace(/[^A-Za-z0-9 ]/g, '').trim();
    var parts = clean.split(/\s+/);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : clean.slice(0, 2)).toUpperCase();
  }

  function renderArtists(list) {
    var tones = [['#009DFF', '#050B10'], ['#4FB8FF', '#0A1824'], ['#8FD4FF', '#003A66'], ['#0A1824', '#009DFF']];
    $('#artistsTrack').innerHTML = list.map(function (a, i) {
      var t = tones[i % tones.length];
      var tag = a.url ? 'a' : 'div';
      var attrs = a.url ? ' href="' + esc(a.url) + '" target="_blank" rel="noopener"' : '';
      var img = a.foto ? '<img src="' + esc(a.foto) + '" alt="' + esc(a.nombre) + '" loading="lazy" onerror="this.remove()">' : '';
      return '<' + tag + ' class="artist"' + attrs + '>' +
        '<div class="artist__photo"><div class="artist__ph" style="background:linear-gradient(145deg,' + t[0] + ' 0%,' + t[1] + ' 100%)">' + esc(initials(a.nombre)) + '</div>' + img + '</div>' +
        '<div class="artist__body"><h3 class="artist__name">' + esc(a.nombre) + '</h3>' +
        (a.url ? '<span class="artist__cta">Escuchar en Spotify ↗</span>' : '') + '</div></' + tag + '>';
    }).join('');
  }

  function initArtists() {
    renderArtists(ARTISTS_FALLBACK);
    fetch('/api/artistas')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { if (Array.isArray(data) && data.length) renderArtists(data); })
      .catch(function () { /* se queda el respaldo con iniciales */ });

    var tr = $('#artistsTrack');
    function scroll(dir) { tr.scrollBy({ left: dir * Math.max(252, tr.clientWidth * 0.8), behavior: reduceMotion ? 'auto' : 'smooth' }); }
    $('#artistsPrev').addEventListener('click', function () { scroll(-1); });
    $('#artistsNext').addEventListener('click', function () { scroll(1); });
  }

  /* ---------- Servicios ---------- */
  function initServices() {
    var tabs = $('#servicesTabs');
    var panel = $('#servicesPanel');
    var cur = 0, timer = null;

    function render() {
      tabs.innerHTML = SERVICES.map(function (s, i) {
        var on = i === cur;
        return '<button type="button" class="tab" role="tab" aria-selected="' + on + '" data-i="' + i + '">' +
          '<span class="tab__num">' + s.num + '</span><span class="tab__name">' + s.name + '</span>' +
          (on && !reduceMotion ? '<span class="tab__prog"></span>' : '') + '</button>';
      }).join('');
      var s = SERVICES[cur];
      panel.innerHTML = '<div class="svc"><span class="svc__num" aria-hidden="true">' + s.num + '</span><h3>' + s.name + '</h3><p>' + s.text + '</p></div>';
    }
    function restart() {
      clearInterval(timer);
      if (!reduceMotion) timer = setInterval(function () { cur = (cur + 1) % SERVICES.length; render(); }, 5000);
    }
    tabs.addEventListener('click', function (e) {
      var b = e.target.closest('[data-i]');
      if (!b) return;
      cur = Number(b.getAttribute('data-i'));
      render(); restart();
    });
    render(); restart();
  }

  /* ---------- Login ---------- */
  function initLogin() {
    var modal = $('#loginModal');
    var frameBox = modal.querySelector('.modal__frame');
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      if (!frameBox.querySelector('iframe')) {
        frameBox.innerHTML = '<iframe src="' + LOGIN_URL + '" title="Acceso al panel DistroNow"></iframe>';
      }
      modal.hidden = false;
      document.body.classList.add('is-locked');
      modal.querySelector('.modal__close').focus();
    }
    function close() {
      modal.hidden = true;
      document.body.classList.remove('is-locked');
      if (lastFocus) lastFocus.focus();
    }
    document.querySelectorAll('[data-open-login]').forEach(function (b) { b.addEventListener('click', open); });
    modal.querySelector('[data-close-login]').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
  }

  /* ---------- Halo y parallax ---------- */
  function initPointer() {
    if (reduceMotion) return;
    var glow = $('.glow');
    var mark = $('#heroMark');
    var raf = null;
    window.addEventListener('mousemove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        var x = e.clientX / window.innerWidth - 0.5;
        var y = e.clientY / window.innerHeight - 0.5;
        glow.style.transform = 'translate(' + (x * window.innerWidth * 0.6) + 'px,' + (y * window.innerHeight * 0.6) + 'px)';
        mark.style.transform = 'translate(' + (x * -14) + 'px,' + (y * -14) + 'px)';
      });
    }, { passive: true });
  }

  /* ---------- Arranque ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var journey = initJourney();
    initArtists();
    initServices();
    initLogin();
    initPointer();
    runIntro(function () { setTimeout(journey.play, 1200); });
  });
})();
