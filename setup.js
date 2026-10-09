// Setup: iconos (Lucide) y animaciones (GSAP + ScrollTrigger)
// Se carga con "defer" después de las librerías, así que gsap, ScrollTrigger y lucide ya existen.

document.addEventListener("DOMContentLoaded", () => {
    initIcons();
    initNavbar();
    initHero();
    initGallery();
    initServiceArea();
    initHours();
    initFooter();
    initReviews();
    initAnimations();
});

/* ===================== ICONOS ===================== */
// Uso en el HTML: <i data-lucide="phone"></i>
// Lista de iconos: https://lucide.dev/icons
function initIcons() {
    lucide.createIcons({
        attrs: { "stroke-width": 2 },
    });
}

/* ===================== ANIMACIONES ===================== */
// Uso en el HTML:
//   <h2 data-animate="fade-up">...</h2>          → aparece al hacer scroll
//   <div data-animate-stagger> <article>...</article> ... </div>
//                                                → los hijos aparecen uno tras otro
//   <span data-counter="8">0</span>+             → número que cuenta hasta 8
//   Elementos del hero: data-hero="title" | "text" | "buttons"
//
// Tipos de data-animate: fade-up, fade-down, fade-left, fade-right, zoom, fade
// Retraso opcional: data-delay="0.2"

const ANIMATIONS = {
    "fade-up": { y: 50 },
    "fade-down": { y: -50 },
    "fade-left": { x: 60 },
    "fade-right": { x: -60 },
    zoom: { scale: 0.85 },
    fade: {},
};

function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // Solo animar si el usuario no pidió reducir movimiento
    mm.add("(prefers-reduced-motion: no-preference)", () => {
        heroIntro();
        revealOnScroll();
        staggerOnScroll();
        counters();
        parallax();
        drawSwooshes();
    });

    // Con movimiento reducido, los contadores muestran el número final directamente
    mm.add("(prefers-reduced-motion: reduce)", () => {
        document.querySelectorAll("[data-counter]").forEach((el) => {
            el.textContent = el.dataset.counter;
        });
    });

    // Recalcular posiciones cuando terminan de cargar las imágenes
    window.addEventListener("load", () => ScrollTrigger.refresh());
}

// gsap.from() que funciona aunque el elemento tenga la clase "transition" de Tailwind
// (la transición CSS pelea con GSAP y deja el elemento invisible).
// Apaga la transición durante la animación y al final limpia los estilos inline
// para que los efectos hover (translate, opacity) sigan funcionando.
function animateFrom(targets, vars, timeline, position) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;
    els.forEach((el) => (el.style.transition = "none"));

    const tween = {
        ...vars,
        clearProps: "opacity,transform",
        onComplete: () => els.forEach((el) => (el.style.transition = "")),
    };
    timeline ? timeline.from(els, tween, position) : gsap.from(els, tween);
}

// Entrada del hero al cargar la página
function heroIntro() {
    if (!document.querySelector("[data-hero]")) return;

    const tl = gsap.timeline({ defaults: { duration: 0.9, ease: "power3.out" } });

    animateFrom("[data-hero='title']", { y: 60, opacity: 0 }, tl);
    animateFrom("[data-hero='text']", { y: 40, opacity: 0 }, tl, "-=0.6");
    animateFrom("[data-hero='buttons'] > *", { y: 30, opacity: 0, stagger: 0.15 }, tl, "-=0.5");
}

// Elementos individuales con data-animate
function revealOnScroll() {
    gsap.utils.toArray("[data-animate]").forEach((el) => {
        const from = ANIMATIONS[el.dataset.animate] ?? ANIMATIONS["fade-up"];

        animateFrom(el, {
            ...from,
            opacity: 0,
            duration: 0.9,
            delay: parseFloat(el.dataset.delay) || 0,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
                once: true,
            },
        });
    });
}

// Grupos (tarjetas de servicios, fotos de la galería…) que aparecen en cascada
function staggerOnScroll() {
    gsap.utils.toArray("[data-animate-stagger]").forEach((group) => {
        animateFrom(group.children, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
            ease: "power2.out",
            scrollTrigger: {
                trigger: group,
                start: "top 80%",
                once: true,
            },
        });
    });
}

// Subrayado de pincel (.swoosh) que se dibuja de izquierda a derecha mientras haces scroll
function drawSwooshes() {
    gsap.utils.toArray(".swoosh").forEach((el) => {
        gsap.fromTo(
            el,
            { "--draw": 0 },
            {
                "--draw": 1,
                ease: "none",
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    end: "top 55%",
                    scrub: 0.6,
                },
            }
        );
    });
}

// Parallax suave: <img data-parallax="10"> se mueve 10% de su alto mientras pasa por la pantalla
// (números negativos = se mueve en sentido contrario)
function parallax() {
    gsap.utils.toArray("[data-parallax]").forEach((el) => {
        const amount = parseFloat(el.dataset.parallax) || 10;
        gsap.fromTo(
            el,
            { yPercent: -amount / 2 },
            {
                yPercent: amount / 2,
                ease: "none",
                scrollTrigger: {
                    trigger: el.closest("section") || el,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                },
            }
        );
    });
}

// Contadores animados (ej. "8+ Years")
function counters() {
    gsap.utils.toArray("[data-counter]").forEach((el) => {
        const target = { value: 0 };

        gsap.to(target, {
            value: parseFloat(el.dataset.counter),
            duration: 2,
            ease: "power1.out",
            onUpdate: () => (el.textContent = Math.round(target.value)),
            scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
            },
        });
    });
}

/* ===================== NAVBAR ===================== */
// ============ NAVBAR ============
function initNavbar() {
  const header = document.getElementById('top-nav');
  if (!header) return;

  const toggle = document.getElementById('nav-toggle');
  const panel = document.getElementById('mobile-menu');
  const hero = document.getElementById('hero');
  const links = Array.from(header.querySelectorAll('[data-nav-link]'));
  const SCROLL_THRESHOLD = 40;
  let menuOpen = false;

  // ---- Solid / transparent state ----
  const updateSolid = () => {
    const solid = !hero || menuOpen || window.scrollY > SCROLL_THRESHOLD;
    header.toggleAttribute('data-solid', solid);
  };
  updateSolid();
  window.addEventListener('scroll', updateSolid, { passive: true });

  // ---- Mobile menu ----
  const setMenu = (open) => {
    if (!toggle || !panel) return;
    menuOpen = open;
    panel.hidden = !open;
    header.toggleAttribute('data-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.documentElement.style.overflow = open ? 'hidden' : '';
    updateSolid();
  };

  if (toggle && panel) {
    toggle.addEventListener('click', () => setMenu(!menuOpen));
    panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });
    // Close if resized to desktop while open
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
      if (e.matches && menuOpen) setMenu(false);
    });
  }

  // ---- In-page anchors ----
  // Links use "index.html#id" so they work from contact.html. When the target
  // exists on the current page, scroll in place (avoids a reload when the site
  // is served at "/" instead of "/index.html") and offset for the fixed header.
  const targetFor = (a) => {
    const url = new URL(a.href, location.href);
    if (!url.hash) return null;
    const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    return el ? { el, hash: url.hash } : null;
  };

  const scrollToEl = (el) => {
    const y = el.id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - header.offsetHeight;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
  };

  header.querySelectorAll('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const t = targetFor(a);
      if (!t) return; // section not on this page → normal navigation to index.html#...
      e.preventDefault();
      scrollToEl(t.el);
      history.replaceState(null, '', t.hash);
    });
  });

  // ---- Active link highlight ----
  const sections = new Map(); // element -> links[]
  links.forEach((a) => {
    const t = targetFor(a);
    if (!t) return;
    if (!sections.has(t.el)) sections.set(t.el, []);
    sections.get(t.el).push(a);
  });

  if (sections.size && 'IntersectionObserver' in window) {
    const setActive = (el) => {
      links.forEach((a) => {
        a.removeAttribute('data-active');
        a.removeAttribute('aria-current');
      });
      (sections.get(el) || []).forEach((a) => {
        a.setAttribute('data-active', '');
        a.setAttribute('aria-current', 'location');
      });
    };

    const visible = new Set();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
        // Pick the visible section closest to the top of the viewport
        let best = null;
        visible.forEach((el) => {
          if (!best || el.getBoundingClientRect().top < best.getBoundingClientRect().top) best = el;
        });
        setActive(best);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((_, el) => io.observe(el));
  }
}

/* ===================== HERO ===================== */
// HERO: slider de fondo con crossfade + Ken Burns (GSAP), dots, pausa con pestaña oculta
function initHero() {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) return;

    const INTERVAL = 6000; // ms entre cambios
    const FADE = 1.4; // s de crossfade
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hasGsap = typeof gsap !== "undefined";

    let current = 0;
    let timer = null;
    let zoomTween = null;

    const imgOf = (i) => slides[i].querySelector("img");

    // Estado inicial
    slides.forEach((s, i) => {
        if (hasGsap) gsap.set(s, { opacity: i === 0 ? 1 : 0, zIndex: i === 0 ? 1 : 0 });
        else s.style.opacity = i === 0 ? "1" : "0";
    });

    function kenBurns(i) {
        if (!hasGsap || reduceMotion.matches) return;
        if (zoomTween) zoomTween.kill();
        zoomTween = gsap.fromTo(
            imgOf(i),
            { scale: 1 },
            { scale: 1.12, duration: INTERVAL / 1000 + FADE + 1, ease: "none" }
        );
    }

    function updateDots() {
        dots.forEach((d, i) => d.setAttribute("aria-pressed", i === current ? "true" : "false"));
        slides.forEach((s, i) => s.setAttribute("aria-hidden", i === current ? "false" : "true"));
    }

    function goTo(next) {
        next = (next + slides.length) % slides.length;
        if (next === current) return;
        const prev = current;
        current = next;

        // Asegurar que la imagen lazy se cargue antes de mostrarse
        const img = imgOf(next);
        if (img && img.loading === "lazy") img.loading = "eager";

        if (hasGsap && !reduceMotion.matches) {
            gsap.killTweensOf(slides);
            gsap.set(slides[next], { zIndex: 2 });
            gsap.set(slides[prev], { zIndex: 1 });
            kenBurns(next);
            gsap.fromTo(slides[next], { opacity: 0 }, {
                opacity: 1,
                duration: FADE,
                ease: "power2.inOut",
                overwrite: true,
                onComplete: () => {
                    slides.forEach((s, i) => {
                        if (i !== current) gsap.set(s, { opacity: 0, zIndex: 0 });
                    });
                    gsap.set(imgOf(prev), { scale: 1 });
                },
            });
        } else {
            // Sin animación: cambio inmediato
            slides.forEach((s, i) => {
                s.style.opacity = i === current ? "1" : "0";
                s.style.zIndex = i === current ? "1" : "0";
            });
        }
        updateDots();
    }

    function start() {
        if (reduceMotion.matches || timer) return;
        timer = setInterval(() => goTo(current + 1), INTERVAL);
        if (zoomTween) zoomTween.resume();
    }

    function stop() {
        clearInterval(timer);
        timer = null;
        if (zoomTween) zoomTween.pause();
    }

    function restart() {
        stop();
        start();
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            goTo(parseInt(dot.dataset.heroDot, 10));
            restart();
        });
    });

    // Pausar cuando la pestaña está oculta
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
    });

    // Pausar cuando el hero sale de la pantalla (ahorra CPU)
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !document.hidden) start();
            else stop();
        }).observe(hero);
    }

    // Si el usuario cambia la preferencia de movimiento en vivo
    reduceMotion.addEventListener?.("change", () => {
        if (reduceMotion.matches) {
            stop();
            if (zoomTween) zoomTween.kill();
            if (hasGsap) gsap.set(slides.map(imgOf), { scale: 1 });
        } else {
            kenBurns(current);
            start();
        }
    });

    updateDots();
    kenBurns(0);
    start();
}

/* ===================== GALERÍA ===================== */
// ===================== GALLERY + LIGHTBOX =====================
function initGallery() {
  const dialog = document.getElementById('gallery-lightbox');
  const thumbs = Array.from(document.querySelectorAll('#gallery [data-gallery-item]'));
  if (!dialog || !thumbs.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector('[data-lb-image]');
  const caption = dialog.querySelector('[data-lb-caption]');
  const label = dialog.querySelector('[data-lb-label]');
  const thumbsBox = dialog.querySelector('[data-lb-thumbs]');
  const counter = dialog.querySelector('[data-lb-counter]');
  const btnsPrev = dialog.querySelectorAll('[data-lb-prev]');
  const btnsNext = dialog.querySelectorAll('[data-lb-next]');
  const btnClose = dialog.querySelector('[data-lb-close]');

  // Categoría de cada foto según su data-caption (o data-group si se quiere forzar)
  const groupOf = (btn) => {
    if (btn.dataset.group) return btn.dataset.group;
    const c = (btn.dataset.caption || '').toLowerCase();
    if (c.includes('fence') || c.includes('enclosure')) return 'fences';
    if (c.includes('pressure')) return 'pressure';
    return 'landscaping';
  };

  const items = thumbs.map((btn) => {
    const t = btn.querySelector('img');
    return { src: btn.dataset.full || t.src, alt: t.alt, label: btn.dataset.caption || '', group: groupOf(btn) };
  });

  let list = items.map((_, i) => i); // índices visibles según el filtro
  let pos = 0;                        // posición dentro de "list"
  let current = 0;                    // índice real en "items"
  let opener = null;

  /* ---------- Filtros ---------- */
  const filterBtns = Array.from(document.querySelectorAll('#gallery [data-gallery-filter]'));
  filterBtns.forEach((b) => {
    const f = b.dataset.galleryFilter;
    const n = f === 'all' ? items.length : items.filter((it) => it.group === f).length;
    const badge = b.querySelector('[data-filter-count]');
    if (badge) badge.textContent = n;
    if (!n) b.hidden = true;
  });

  function applyFilter(f) {
    list = items.map((it, i) => i).filter((i) => f === 'all' || items[i].group === f);
    thumbs.forEach((btn, i) => {
      const wrap = btn.parentElement;
      const n = list.indexOf(i);
      const show = n !== -1;
      wrap.hidden = !show;
      if (show) { wrap.style.opacity = ''; wrap.style.transform = ''; }
      if (n !== -1) btn.setAttribute('aria-label', 'Open photo ' + (n + 1) + ' of ' + list.length + ': ' + items[i].label);
    });
    miniBtns.forEach((b, i) => { if (b) b.hidden = !list.includes(i); });
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.galleryFilter === f)));
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }
  filterBtns.forEach((b) => b.addEventListener('click', () => applyFilter(b.dataset.galleryFilter)));


  // Enlaces externos tipo <a href="#gallery" data-gallery-show="fences">
  document.querySelectorAll('[data-gallery-show]').forEach((a) => {
    a.addEventListener('click', () => applyFilter(a.dataset.galleryShow));
  });

  // Miniaturas (solo escritorio)
  const miniBtns = items.map((it, i) => {
    if (!thumbsBox) return null;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'h-14 w-20 shrink-0 overflow-hidden rounded-lg opacity-50 ring-2 ring-transparent transition hover:opacity-100 focus-visible:outline-none focus-visible:ring-brand-500 aria-[current=true]:opacity-100 aria-[current=true]:ring-brand-500';
    b.setAttribute('aria-label', 'Show photo ' + (i + 1));
    b.innerHTML = '<img src="' + it.src + '" alt="" loading="lazy" class="h-full w-full object-cover">';
    b.addEventListener('click', () => show(list.indexOf(i)));
    thumbsBox.appendChild(b);
    return b;
  });

  applyFilter('all');

  function preload(p) {
    const img = new Image();
    img.src = items[list[(p + list.length) % list.length]].src;
  }

  function show(p) {
    pos = (p + list.length) % list.length;
    current = list[pos];
    const it = items[current];
    img.style.opacity = '0';
    img.onload = () => { img.style.opacity = '1'; };
    img.src = it.src;
    img.alt = it.alt;
    if (img.complete) img.style.opacity = '1';
    caption.textContent = it.alt;
    if (label) label.textContent = it.label;
    miniBtns.forEach((b, n) => b && b.setAttribute('aria-current', n === current ? 'true' : 'false'));
    centerMini();
    counter.textContent = (pos + 1) + ' / ' + list.length;
    preload(pos + 1);
    preload(pos - 1);
  }

  // Desliza la tira de miniaturas para que la foto actual quede en el centro
  function centerMini() {
    const mini = miniBtns[current];
    if (!mini || !thumbsBox) return;
    const box = thumbsBox.getBoundingClientRect();
    const r = mini.getBoundingClientRect();
    thumbsBox.scrollLeft += r.left - box.left - (box.width - r.width) / 2;
  }

  function open(i, trigger) {
    opener = trigger || null;
    show(i);
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    centerMini(); // antes de abrir el diálogo la tira no tiene tamaño
    btnClose.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  thumbs.forEach((btn, i) => {
    btn.addEventListener('click', () => open(Math.max(0, list.indexOf(i)), btn));
  });

  btnsPrev.forEach((b) => b.addEventListener('click', () => show(pos - 1)));
  btnsNext.forEach((b) => b.addEventListener('click', () => show(pos + 1)));
  btnClose.addEventListener('click', close);

  // Esc is handled natively by <dialog> (fires "cancel" then "close").
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(pos - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); show(pos + 1); }
  });

  // Click on the backdrop / empty area closes (not on the image or buttons).
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || e.target.hasAttribute('data-lb-backdrop')) close();
  });

  // Swipe on touch devices.
  let startX = 0, startY = 0, tracking = false;
  dialog.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { tracking = false; return; }
    tracking = true;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      show(dx < 0 ? pos + 1 : pos - 1);
    }
  }, { passive: true });
}

/* ===================== ÁREA DE SERVICIO (MAPA) ===================== */
/* ===== Service Area map (Leaflet) ===== */
function initServiceArea() {
  var el = document.getElementById('service-area-map');
  if (!el || typeof window.L === 'undefined') return;

  var L = window.L;
  var BRAND = '#1f7a3a';
  var WILMINGTON = [34.2257, -77.9447];
  var LELAND = [34.2563, -78.0447];
  var CENTER = [(WILMINGTON[0] + LELAND[0]) / 2, (WILMINGTON[1] + LELAND[1]) / 2];
  var touch = window.matchMedia('(pointer: coarse)').matches;
  var map = null;
  var hint = document.querySelector('#service-area .sa-map-hint');

  // Iconos SVG (Lucide) dentro de los pines
  var HOUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>';
  var LEAF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>';

  function pin(main) {
    var size = main ? 46 : 34;
    return L.divIcon({
      className: 'sa-marker' + (main ? ' sa-marker--main' : ''),
      html: '<span class="sa-marker__pulse"></span><span class="sa-marker__pin">' + (main ? HOUSE : LEAF) + '</span>',
      iconSize: [size, size + 10],
      iconAnchor: [size / 2, size + 6],
      tooltipAnchor: [0, -(size / 2 + 6)]
    });
  }

  function createMap() {
    if (map) return;

    map = L.map(el, {
      center: CENTER,
      zoom: 11,
      scrollWheelZoom: false,
      dragging: !touch, // en celular, un dedo sigue moviendo la página hasta que tocas el mapa
      zoomControl: false,
      attributionControl: true
    });
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Zona de servicio: relleno suave + borde punteado
    var circle = L.circle(CENTER, {
      radius: 20000,
      color: BRAND,
      weight: 2.5,
      opacity: 0.8,
      dashArray: '8 10',
      fillColor: BRAND,
      fillOpacity: 0.1,
      interactive: false
    }).addTo(map);
    L.circle(CENTER, {
      radius: 9000,
      stroke: false,
      fillColor: BRAND,
      fillOpacity: 0.08,
      interactive: false
    }).addTo(map);

    [
      { pos: WILMINGTON, name: 'Wilmington', main: true, side: 'right' },
      { pos: LELAND, name: 'Leland', main: false, side: 'left' }
    ].forEach(function (c) {
      L.marker(c.pos, { icon: pin(c.main), title: c.name + ', NC', alt: c.name + ', NC', keyboard: true, riseOnHover: true })
        .addTo(map)
        // Etiquetas a los lados para que no se encimen (las ciudades están muy cerca)
        .bindTooltip(c.name, { permanent: true, direction: c.side, offset: [c.side === 'right' ? 18 : -18, 0], className: 'sa-label' });
    });

    // Deja espacio arriba para la tarjeta flotante
    var fit = window.innerWidth < 640
      ? { paddingTopLeft: [10, 70], paddingBottomRight: [10, 10] }
      : { paddingTopLeft: [24, 90], paddingBottomRight: [24, 24] };
    map.fitBounds(circle.getBounds(), fit);

    // Evita "secuestrar" el scroll: zoom con rueda / arrastre en móvil solo después de tocar el mapa
    function activate() {
      if (!map.scrollWheelZoom.enabled()) map.scrollWheelZoom.enable();
      if (touch && !map.dragging.enabled()) map.dragging.enable();
      if (hint) hint.classList.add('is-hidden');
    }
    function deactivate() {
      if (map.scrollWheelZoom.enabled()) map.scrollWheelZoom.disable();
      if (touch && map.dragging.enabled()) map.dragging.disable();
      if (hint) hint.classList.remove('is-hidden');
    }
    map.on('click focus', activate);
    el.addEventListener('focus', activate);
    el.addEventListener('mouseleave', deactivate);
    el.addEventListener('blur', function (e) {
      if (!el.contains(e.relatedTarget)) deactivate();
    });
    if (touch) {
      document.addEventListener('touchstart', function (e) {
        if (!el.contains(e.target)) deactivate();
      }, { passive: true });
    }

    // El contenedor puede cambiar de tamaño después de crearse (animaciones)
    requestAnimationFrame(function () { map.invalidateSize(); });
    setTimeout(function () {
      map.invalidateSize();
      map.fitBounds(circle.getBounds(), fit);
    }, 400);
    window.addEventListener('resize', function () { map.invalidateSize(); });
  }

  if ('IntersectionObserver' in window) {
    var section = document.getElementById('service-area') || el;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          io.disconnect();
          createMap();
        }
      });
    }, { rootMargin: '200px 0px' });
    io.observe(section);
  } else {
    createMap();
  }
}

/* ===================== HORARIO ===================== */
// ===================== HOURS =====================
function initHours() {
  const pill = document.getElementById('hours-status');
  const pillText = document.getElementById('hours-status-text');
  const list = document.getElementById('hours-list');
  if (!pill || !pillText || !list) return;

  const TZ = 'America/New_York';
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Opening hours per weekday (0 = Sunday), in minutes from midnight. null = closed.
  const SCHEDULE = [
    null,
    [420, 1080], [420, 1080], [420, 1080], [420, 1080], [420, 1080],
    [420, 1020]
  ];
  const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  let fmt;
  try {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    });
  } catch (e) {
    return; // Very old browser without timeZone support: keep static fallback text.
  }

  const fmtTime = (mins) => {
    const h = Math.floor(mins / 60), m = mins % 60;
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM');
  };

  const nowInBusinessTz = () => {
    const parts = {};
    fmt.formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    const hour = parseInt(parts.hour, 10) % 24;
    return { day: WEEKDAY_INDEX[parts.weekday], minutes: hour * 60 + parseInt(parts.minute, 10) };
  };

  const rows = list.querySelectorAll('[data-day]');

  const update = () => {
    const { day, minutes } = nowInBusinessTz();
    if (day === undefined) return;

    // Highlight today's row
    rows.forEach((row) => {
      const isToday = Number(row.dataset.day) === day;
      row.dataset.today = isToday ? 'true' : 'false';
      if (isToday) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
      const badge = row.querySelector('[data-today-badge]');
      if (badge) badge.hidden = !isToday;
    });

    // Live status
    const today = SCHEDULE[day];
    if (today && minutes >= today[0] && minutes < today[1]) {
      pill.dataset.state = 'open';
      pillText.textContent = 'Open now · closes at ' + fmtTime(today[1]);
      return;
    }

    let label = '';
    if (today && minutes < today[0]) {
      label = 'today ' + fmtTime(today[0]);
    } else {
      for (let i = 1; i <= 7; i++) {
        const d = (day + i) % 7;
        if (SCHEDULE[d]) {
          label = (i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' ' + fmtTime(SCHEDULE[d][0]);
          break;
        }
      }
    }
    pill.dataset.state = 'closed';
    pillText.textContent = 'Closed now · opens ' + label;
  };

  update();
  // Re-check at the start of every minute
  const msToNextMinute = 60000 - (Date.now() % 60000) + 50;
  setTimeout(() => {
    update();
    setInterval(update, 60000);
  }, msToNextMinute);
}

/* ===================== FOOTER + BOTÓN DE LLAMADA ===================== */
/* ===================== FOOTER ===================== */
// Año actual en el copyright + ocultar el botón flotante de llamada cuando el footer es visible
function initFooter() {
    document.querySelectorAll("[data-year]").forEach((el) => {
        el.textContent = new Date().getFullYear();
    });

    const footer = document.getElementById("site-footer");
    const callBtn = document.getElementById("floating-call");
    if (!footer || !callBtn || !("IntersectionObserver" in window)) return;

    new IntersectionObserver(
        ([entry]) => {
            const hidden = entry.isIntersecting;
            callBtn.dataset.hidden = hidden;
            callBtn.toggleAttribute("aria-hidden", hidden);
            callBtn.tabIndex = hidden ? -1 : 0;
        },
        { threshold: 0.05 }
    ).observe(footer);
}

/* ===================== RESEÑAS (Elfsight) ===================== */
// Lee el ID de data-elfsight-id; si ya es un ID real, carga el widget y oculta el bloque de respaldo.
function initReviews() {
    const slot = document.querySelector("[data-elfsight-widget]");
    if (!slot) return;
    const id = (slot.dataset.elfsightId || "").trim();
    if (!id || id === "YOUR-WIDGET-ID") return;

    slot.classList.add("elfsight-app-" + id);
    slot.setAttribute("data-elfsight-app-lazy", "");
    document.querySelector("[data-reviews-fallback]")?.remove();

    if (!document.querySelector('script[src*="elfsight.com/platform"]')) {
        const s = document.createElement("script");
        s.src = "https://static.elfsight.com/platform/platform.js";
        s.async = true;
        document.body.appendChild(s);
    }
}
