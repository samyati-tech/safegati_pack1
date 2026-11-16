/* =================================================================
   Safegati v7 — motion layer
   GSAP 3 (ScrollTrigger, SplitText, DrawSVG, MorphSVG, MotionPath,
   Flip) + Lenis. Personality: calm and precise. Firm settles, no
   bounce, expressive type only where it earns attention.
   ================================================================= */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = doc.classList.contains('rm');
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  if (!window.gsap) { doc.classList.remove('intro', 'pre'); return; }
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, Flip);
  var fine = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Smooth scroll ---------- */
  var lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- Things that are built in every mode ---------- */
  var journey = setupJourneyPath();
  var liquid = setupLiquid();
  var board = setupBoard();
  var track = $('#ticker'); track.innerHTML += track.innerHTML;

  if (reduce) { staticState(); return; }

  /* =================================================================
     1. LOADER — animated logo, then a curtain lifts
     ================================================================= */
  function runIntro() {
    var loader = $('.loader');
    if (!doc.classList.contains('intro') || !loader) { heroIn(0); return; }
    try { sessionStorage.setItem('sg-intro', '1'); } catch (e) {}
    if (lenis) lenis.stop();
    var dot = 'M0,-6 A6,6 0 1,1 0,6 A6,6 0 1,1 0,-6 Z';
    gsap.set(loader, { clipPath: 'inset(0% 0% 0% 0%)' });
    gsap.timeline({ onComplete: function () { loader.remove(); doc.classList.remove('intro'); if (lenis) lenis.start(); } })
      .from('.petal', { morphSVG: dot, duration: 1, stagger: 0.08, ease: 'power3.out' }, 0)
      .from('.loader__petals', { scale: 0.2, svgOrigin: '0 0', duration: 1, ease: 'power3.out' }, 0)
      .from('.loader__ring', { drawSVG: '0%', duration: 1, ease: 'power2.inOut' }, 0.1)
      .from('.loader__teeth', { drawSVG: '0%', rotation: -120, svgOrigin: '0 0', duration: 1.2, ease: 'power2.inOut' }, 0.15)
      .from('.loader__word span', { yPercent: 110, duration: 0.6, stagger: 0.04, ease: 'power3.out' }, 0.45)
      .from('.loader__tag', { autoAlpha: 0, y: 8, duration: 0.4 }, 0.85)
      .to('.loader__bar span', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' }, 0.3)
      .to('.loader__petals', { rotation: 90, svgOrigin: '0 0', duration: 0.8, ease: 'power3.inOut' }, 1.1)
      .to(loader, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'power4.inOut' }, 1.65)
      .add(function () { heroIn(0); }, 1.7);
  }

  /* =================================================================
     2. HERO — expressive headline, pills open, deck flies in
     ================================================================= */
  var real = $('[data-real]'), skel = $('[data-skeleton]');
  gsap.set(real, { display: 'none' });
  gsap.set(['.dc-chat .bubble', '.typing'], { autoAlpha: 0, y: 8 });

  function heroIn(delay) {
    var split = SplitText.create('.ht__w', { type: 'chars', charsClass: 'ch' });
    gsap.set('.pill', { width: 0 });
    doc.classList.remove('pre');
    gsap.timeline({ delay: delay, defaults: { ease: 'power4.out' }, onComplete: startDeck })
      .from('.status', { y: 16, autoAlpha: 0, duration: 0.7 }, 0)
      .from(split.chars, { y: 50, rotationX: -70, autoAlpha: 0, fontWeight: 250, transformOrigin: '50% 100%', duration: 1.1, stagger: 0.018 }, 0.05)
      .to('.pill', { width: '2.3em', duration: 1.1, stagger: 0.12, ease: 'expo.out', clearProps: 'width' }, 0.55)
      .from('.hero__lede', { y: 20, autoAlpha: 0, duration: 0.8 }, 0.75)
      .from('.qbar', { y: 34, autoAlpha: 0, scale: 0.97, duration: 1 }, 0.85)
      .from('.deck__card', { y: 90, rotationX: -35, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2, stagger: 0.1 }, 1.0);
  }

  function startDeck() {
    // skeleton loading, then the real card content
    gsap.timeline({ delay: 0.6 })
      .to(skel, { autoAlpha: 0, duration: 0.3, onComplete: function () { skel.style.display = 'none'; } })
      .set(real, { display: 'block' })
      .from(real.children, { autoAlpha: 0, y: 8, duration: 0.5, stagger: 0.08, ease: 'power3.out' })
      .add(function () {
        gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
          .fromTo('.dc-fill', { width: '0%' }, { width: '62%', duration: 2.8, ease: 'power2.inOut' })
          .fromTo('.dc-truck', { left: '0%' }, { left: '62%', duration: 2.8, ease: 'power2.inOut' }, 0)
          .to({}, { duration: 1.2 });
      });
    // WhatsApp chat: message, typing, reply
    gsap.timeline({ repeat: -1, repeatDelay: 2.4 })
      .set(['.dc-chat .bubble', '.typing'], { autoAlpha: 0, y: 8 })
      .to('.bubble--me', { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 0.2)
      .to('.typing', { autoAlpha: 1, y: 0, duration: 0.3 }, 1)
      .to('.typing', { autoAlpha: 0, duration: 0.2 }, 2.6)
      .to('.bubble--us', { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 2.7)
      .to({}, { duration: 3 });
    // GST card: the tick redraws
    gsap.timeline({ repeat: -1, repeatDelay: 2.6 }).fromTo('.dc-gst .draw', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' });
  }

  // Deck tilts flat as it scrolls into view (faux 3D)
  gsap.fromTo('.deck', { rotationX: 24, transformPerspective: 1400, transformOrigin: '50% 0%', y: 20 },
    { rotationX: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '.deck', start: 'top bottom', end: 'top 35%', scrub: 0.6 } });
  gsap.to('.hero .aurora', { yPercent: 16, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Pointer light + deck parallax
  if (fine) {
    var hero = $('.hero'), light = $('.hero__light');
    var lx = gsap.quickTo(light, 'x', { duration: 0.6, ease: 'power3.out' }), ly = gsap.quickTo(light, 'y', { duration: 0.6, ease: 'power3.out' });
    var cards = $$('.deck__card').map(function (c, i) {
      return { x: gsap.quickTo(c, 'x', { duration: 1, ease: 'power3.out' }), y: gsap.quickTo(c, 'y', { duration: 1, ease: 'power3.out' }), k: [10, -14, 8][i] };
    });
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      lx(e.clientX - r.left); ly(e.clientY - r.top);
      cards.forEach(function (c) { c.x(nx * c.k); c.y(ny * c.k * 0.6); });
    });
  }

  /* =================================================================
     3. VELOCITY TICKER — speeds up and reverses with your scroll
     ================================================================= */
  (function () {
    var x = 0, dir = 1, vel = 0, half = 0, on = false;
    function measure() { half = track.scrollWidth / 2; }
    measure(); window.addEventListener('resize', measure);
    if (document.fonts) document.fonts.ready.then(measure);
    if (lenis) lenis.on('scroll', function (l) { vel = l.velocity; if (l.direction) dir = l.direction; });
    ScrollTrigger.create({ trigger: '.ticker', start: 'top bottom', end: 'bottom top', onToggle: function (s) { on = s.isActive; } });
    gsap.ticker.add(function () {
      if (!on || !half) return;
      x -= (0.9 + Math.min(Math.abs(vel) * 0.5, 16)) * dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      vel *= 0.94;
    });
  })();

  /* =================================================================
     4. HEADINGS — split, masked, weight rises as letters land
     ================================================================= */
  $$('[data-split]').forEach(function (h) {
    var s = SplitText.create(h, { type: 'words,chars', mask: 'words' });
    gsap.from(s.chars, { yPercent: 115, fontWeight: 300, duration: 1, stagger: 0.014, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 86%', once: true } });
  });

  /* =================================================================
     5. PROOF — icons draw themselves, numbers count
     ================================================================= */
  gsap.from('.proof .draw-ico > *', { drawSVG: '0%', duration: 1.3, stagger: 0.06, ease: 'power2.inOut', scrollTrigger: { trigger: '.proof', start: 'top 80%', once: true } });
  gsap.from('.pf', { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.proof', start: 'top 85%', once: true } });
  $$('[data-count]').forEach(function (el) {
    var end = +el.getAttribute('data-count'), o = { v: 0 };
    el.textContent = '0';
    gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
  });

  /* =================================================================
     6. SERVICES — vertical scroll drives a horizontal track
     ================================================================= */
  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', function () {
    var trackEl = $('#hs-track'), cards = $$('.sc', trackEl);
    function dist() { return Math.max(0, trackEl.scrollWidth - window.innerWidth); }
    var tw = gsap.to(trackEl, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: '.hs', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var i = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
          $('#hs-now').textContent = String(i + 1).padStart(2, '0');
          $('#hs-bar').style.transform = 'scaleX(' + (0.125 + self.progress * 0.875) + ')';
        }
      }
    });
    cards.forEach(function (c) {
      ScrollTrigger.create({ trigger: c, containerAnimation: tw, start: 'left 100%', end: 'right 0%', toggleClass: 'is-live' });
      gsap.from(c, { rotationY: -18, transformPerspective: 1000, transformOrigin: '0% 50%', autoAlpha: 0.4, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tw, start: 'left 105%', end: 'left 60%', scrub: true } });
    });
    return function () { cards.forEach(function (c) { c.classList.remove('is-live'); }); };
  });
  mm.add('(max-width: 899px)', function () {
    $('.hs').classList.add('no-hpin');
    return function () { $('.hs').classList.remove('no-hpin'); };
  });
  // 3D tilt on hover (desktop)
  if (fine) $$('.sc').forEach(function (c) {
    var rx = gsap.quickTo(c, 'rotationX', { duration: 0.6, ease: 'power3.out' }), ry = gsap.quickTo(c, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(c, { transformPerspective: 900 });
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 12); rx(((e.clientY - r.top) / r.height - 0.5) * -10); });
    c.addEventListener('pointerleave', function () { rx(0); ry(0); });
  });

  /* =================================================================
     7. JOURNEY — the path draws itself and the truck follows it
     ================================================================= */
  function runJourney() {
    journey.build();
    var st = { trigger: '#jr', start: 'top 62%', end: 'bottom 62%', scrub: 0.6 };
    journey.ctx = gsap.context(function () {
      gsap.fromTo('#jr-draw', { drawSVG: '0%' }, { drawSVG: '100%', ease: 'none', scrollTrigger: st });
      gsap.to('#jr-truck', { motionPath: { path: '#jr-draw', align: '#jr-draw', alignOrigin: [0.5, 0.5] }, ease: 'none', scrollTrigger: Object.assign({}, st) });
    });
  }
  runJourney();
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { if (journey.ctx) journey.ctx.revert(); runJourney(); ScrollTrigger.refresh(); }, 250); });
  $$('.js-step').forEach(function (s) {
    ScrollTrigger.create({ trigger: s, start: 'top 62%', end: 'bottom 38%', toggleClass: 'is-active' });
    gsap.from($('.jr__scene', s), { y: 60, scale: 0.92, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 80%', once: true } });
  });

  /* =================================================================
     7b. PARALLAX PHOTOS — bands, head office frame, CTA background
     ================================================================= */
  $$('.pband').forEach(function (b) {
    var img = $('.pband__img', b), media = $('.pband__media', b), content = $('.pband__content', b);
    var range = { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo(img, { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: range });
    gsap.fromTo(content, { y: 60 }, { y: -40, ease: 'none', scrollTrigger: Object.assign({}, range) });
    if (b.classList.contains('pband--zoom')) gsap.fromTo(img, { scale: 1.2 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'center center', scrub: true } });
    if (b.classList.contains('pband--reveal')) gsap.fromTo(media, { clipPath: 'inset(8% 4% 8% 4% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: b, start: 'top 95%', end: 'top 20%', scrub: true } });
    gsap.from($$('.pband__chips li', b), { y: 16, autoAlpha: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: b, start: 'top 60%', once: true } });
  });
  (function () {
    var hq = { trigger: '.hq__frame', start: 'top bottom', end: 'bottom top', scrub: true };
    gsap.fromTo('.hq__img', { yPercent: -10 }, { yPercent: 10, ease: 'none', scrollTrigger: hq });
    gsap.fromTo('.hq__chip--a', { y: 70 }, { y: -70, ease: 'none', scrollTrigger: Object.assign({}, hq) });
    gsap.fromTo('.hq__chip--b', { y: -40 }, { y: 50, ease: 'none', scrollTrigger: Object.assign({}, hq) });
    gsap.from('.hq__clip', { clipPath: 'inset(100% 0% 0% 0% round 220px 220px 32px 32px)', duration: 1.3, ease: 'power4.inOut', scrollTrigger: { trigger: '.hq__frame', start: 'top 80%', once: true } });
    gsap.from('.hq__list .draw-ico > *', { drawSVG: '0%', duration: 1.1, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: '.hq__list', start: 'top 85%', once: true } });
    gsap.fromTo('.cta__photo img', { yPercent: -9 }, { yPercent: 9, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: true } });
  })();

  /* =================================================================
     8. TEAM BOARD — collaborative cursors hand the move along
     ================================================================= */
  ScrollTrigger.create({ trigger: '#board', start: 'top 85%', end: 'bottom 10%', onToggle: function (s) { board.toggle(s.isActive); } });
  gsap.from('.roles li', { x: -24, autoAlpha: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.roles', start: 'top 85%', once: true } });

  /* =================================================================
     9. COUNTDOWN — number pulses when the date changes
     ================================================================= */
  document.addEventListener('countdown:change', function () { gsap.fromTo('#cd-num', { scale: 1.25 }, { scale: 1, duration: 0.6, ease: 'power3.out' }); });
  gsap.from('.task', { x: 40, autoAlpha: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: '#cd-list', start: 'top 82%', once: true } });

  /* =================================================================
     10. WHY — layered parallax photos, doodles draw, tags pop
     ================================================================= */
  $$('.ph').forEach(function (p) {
    var d = parseFloat(p.getAttribute('data-depth')) || 0.1;
    gsap.fromTo(p, { y: d * 260 }, { y: d * -260, ease: 'none', scrollTrigger: { trigger: '.collage', start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.doodles .dd', { drawSVG: '0%', duration: 0.9, stagger: 0.12, ease: 'power2.inOut', scrollTrigger: { trigger: '.collage', start: 'top 65%', once: true } });
  gsap.from('.tag', { scale: 0.6, autoAlpha: 0, duration: 0.6, stagger: 0.15, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.collage', start: 'top 60%', once: true } });
  gsap.from('.reasons .draw-ico > *', { drawSVG: '0%', duration: 1.1, stagger: 0.05, ease: 'power2.inOut', scrollTrigger: { trigger: '.reasons', start: 'top 80%', once: true } });

  /* =================================================================
     11. BRANCHES — liquid fill rises inside the city name
     ================================================================= */
  ScrollTrigger.create({ trigger: '.br__name', start: 'top 80%', once: true, onEnter: function () { liquid.fill(); } });
  document.addEventListener('city:change', function (e) { liquid.set(e.detail.name); liquid.fill(); });

  /* =================================================================
     12. VERIFY — the card turns to show it has a back; tilt on hover
     ================================================================= */
  ScrollTrigger.create({ trigger: '#idtilt', start: 'top 72%', once: true, onEnter: function () {
    gsap.timeline().to('#idtilt', { rotationY: -28, transformPerspective: 1600, duration: 0.7, ease: 'power2.inOut' }).to('#idtilt', { rotationY: 0, duration: 0.9, ease: 'power3.out' });
  } });
  gsap.from('.flip-doodle .dd', { drawSVG: '0%', duration: 0.8, stagger: 0.2, ease: 'power2.inOut', scrollTrigger: { trigger: '#idtilt', start: 'top 70%', once: true } });
  if (fine) {
    var idt = $('#idtilt'), irx = gsap.quickTo(idt, 'rotationX', { duration: 0.6, ease: 'power3.out' }), iry = gsap.quickTo(idt, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    gsap.set(idt, { transformPerspective: 1600 });
    idt.addEventListener('pointermove', function (e) { var r = idt.getBoundingClientRect(); iry(((e.clientX - r.left) / r.width - 0.5) * 14); irx(((e.clientY - r.top) / r.height - 0.5) * -12); });
    idt.addEventListener('pointerleave', function () { irx(0); iry(0); });
  }

  /* =================================================================
     13. PRICING + REVIEWS
     ================================================================= */
  gsap.from('.circled .dd', { drawSVG: '0%', duration: 1, ease: 'power2.inOut', scrollTrigger: { trigger: '.ticket', start: 'top 70%', once: true } });
  gsap.from('.ticket', { y: 50, rotation: 2, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ticket', start: 'top 85%', once: true } });
  document.addEventListener('price:change', function () { gsap.fromTo('#ticket-sel', { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' }); });
  gsap.from('.rv__stars svg', { scale: 0, rotation: -90, duration: 0.5, stagger: 0.08, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.rv__stars', start: 'top 90%', once: true } });
  gsap.from('.rvc', { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: { trigger: '.rv__grid', start: 'top 85%', once: true } });

  /* =================================================================
     14. FAQ — the plus morphs into a minus
     ================================================================= */
  var PLUS_V = 'M12 5v14', MINUS_V = 'M5 12h14';
  $$('.faq details').forEach(function (d) { if (d.open) gsap.set($('.mx__v', d), { morphSVG: MINUS_V }); });
  document.addEventListener('faq:toggle', function (e) {
    var d = e.detail.el;
    gsap.to($('.mx__v', d), { morphSVG: d.open ? MINUS_V : PLUS_V, duration: 0.5, ease: 'power3.inOut' });
  });

  /* =================================================================
     15. CTA — letters gain weight near the pointer; liquid follows
     ================================================================= */
  (function () {
    var s = SplitText.create('.wv', { type: 'chars', charsClass: 'char' });
    gsap.from(s.chars, { yPercent: 100, fontWeight: 200, autoAlpha: 0, duration: 1.1, stagger: 0.025, ease: 'power4.out', scrollTrigger: { trigger: '.cta', start: 'top 70%', once: true } });
    if (!fine) return;
    var cta = $('.cta'), lq = $('.lq1'), rects = [];
    var qx = gsap.quickTo(lq, 'x', { duration: 1.2, ease: 'power3.out' }), qy = gsap.quickTo(lq, 'y', { duration: 1.2, ease: 'power3.out' });
    function measure() { rects = s.chars.map(function (c) { var r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); }
    cta.addEventListener('pointerenter', measure);
    cta.addEventListener('pointermove', function (e) {
      var r = cta.getBoundingClientRect();
      qx(e.clientX - r.left - r.width / 2); qy(e.clientY - r.top - r.height / 2);
      s.chars.forEach(function (c, i) {
        var p = rects[i]; if (!p) return;
        var d = Math.hypot(e.clientX - p.x, e.clientY - p.y), w = 300 + 600 * Math.max(0, 1 - d / 280);
        gsap.to(c, { fontWeight: Math.round(w), duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
      });
    });
    cta.addEventListener('pointerleave', function () { gsap.to(s.chars, { fontWeight: 600, duration: 0.8, ease: 'power3.out' }); qx(0); qy(0); });
  })();

  /* ---------- Footer wordmark rises ---------- */
  gsap.from('.ft__word span', { yPercent: 100, autoAlpha: 0, duration: 1, stagger: 0.05, ease: 'power4.out', scrollTrigger: { trigger: '.ft__word', start: 'top 95%', once: true } });

  /* ---------- Magnetic buttons ---------- */
  if (fine) $$('[data-magnetic]').forEach(function (b) {
    var mx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3.out' }), my = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3.out' });
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35); });
    b.addEventListener('pointerleave', function () { mx(0); my(0); });
  });

  /* ---------- Quote bar shake on error ---------- */
  document.addEventListener('quote:shake', function () { gsap.fromTo('#quote', { x: -10 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.35)', clearProps: 'x' }); });
  document.addEventListener('quote:done', function () { gsap.from('.done-tick circle, .done-tick path', { drawSVG: '0%', duration: 0.7, stagger: 0.2, ease: 'power2.inOut' }); });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  runIntro();

  /* =================================================================
     BUILDERS (shared with reduced motion)
     ================================================================= */
  function setupJourneyPath() {
    var jr = $('#jr'), svg = $('#jr-svg');
    var api = { ctx: null, build: function () {
      var W = jr.offsetWidth, H = jr.offsetHeight, b = jr.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      var pts = $$('.jr__node', jr).map(function (n) { var r = n.getBoundingClientRect(); return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2]; });
      var narrow = window.innerWidth < 900, d = 'M' + pts[0][0] + ' 0 L' + pts[0][0] + ' ' + pts[0][1];
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], c = pts[i], dy = c[1] - a[1], off = narrow ? 0 : (i % 2 ? 1 : -1) * Math.min(W * 0.16, 200);
        d += ' C' + (a[0] + off) + ' ' + (a[1] + dy * 0.4) + ' ' + (c[0] + off) + ' ' + (c[1] - dy * 0.4) + ' ' + c[0] + ' ' + c[1];
      }
      d += ' L' + pts[pts.length - 1][0] + ' ' + H;
      $('#jr-track').setAttribute('d', d);
      $('#jr-draw').setAttribute('d', d);
      gsap.set('#jr-truck', { x: pts[0][0], y: 0 });
    } };
    return api;
  }

  function setupLiquid() {
    var wave = $('#wave'), liq = $('#liquid'), txt = $('#city-text'), out = $('#city-outline');
    var d = 'M0 0', wl = 120;
    for (var x = 0; x < 2000; x += wl) d += ' Q' + (x + wl / 4) + ' -14 ' + (x + wl / 2) + ' 0 T' + (x + wl) + ' 0';
    wave.setAttribute('d', d + ' L2000 300 L0 300 Z');
    function fit() {
      [txt, out].forEach(function (t) { t.removeAttribute('textLength'); t.removeAttribute('lengthAdjust'); });
      var len = out.getComputedTextLength();
      if (len > 880) [txt, out].forEach(function (t) { t.setAttribute('textLength', 880); t.setAttribute('lengthAdjust', 'spacingAndGlyphs'); });
    }
    if (!reduce) gsap.to(wave, { x: -wl, duration: 2.4, ease: 'none', repeat: -1 });
    gsap.set(liq, { y: reduce ? 44 : 210 });
    if (document.fonts) document.fonts.ready.then(fit); else fit();
    return {
      set: function (name) { txt.textContent = name; out.textContent = name; fit(); },
      fill: function () { if (reduce) return; gsap.fromTo(liq, { y: 210 }, { y: 44, duration: 1.8, ease: 'power3.out', overwrite: true }); }
    };
  }

  function setupBoard() {
    var el = $('#board'), cols = $$('.col', el), card = $('#mcard'), chip = $('#mcard-chip'), cursors = $$('.cursor', el), note = $('#board-note');
    var STATES = [['Booked', '#16ACEF'], ['Packed', '#FF8A1F'], ['In transit', '#10A34F'], ['Delivered', '#EF2B3E']];
    var NOTES = ['Date confirmed. Packing planned.', 'Wrapped, boxed and labelled.', 'Loaded and on the road.', 'Unpacked at the new home.'];
    var tl = null, playing = false;
    function slot(i) { var s = $('.col__slot', cols[i]), b = el.getBoundingClientRect(), r = s.getBoundingClientRect(); return { x: r.left - b.left, y: r.top - b.top, w: r.width }; }
    function setState(i) { chip.textContent = STATES[i][0]; chip.style.background = STATES[i][1]; }
    function build() {
      if (tl) tl.kill();
      var p0 = slot(0), H = el.offsetHeight;
      gsap.set(card, { x: p0.x, y: p0.y, width: p0.w, autoAlpha: 1, scale: 1, rotation: 0 });
      setState(0);
      gsap.set(cursors, { autoAlpha: 0 }); gsap.set(note, { autoAlpha: 0 });
      if (reduce) { var p3 = slot(3); gsap.set(card, { x: p3.x, y: p3.y }); setState(3); return; }
      tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: !playing });
      for (var i = 0; i < 4; i++) (function (i) {
        var cur = cursors[i], p = slot(i), n = i < 3 ? slot(i + 1) : null;
        tl.set(cur, { x: p.x + p.w * 0.5 + 40, y: H - 30 })
          .to(cur, { autoAlpha: 1, duration: 0.25 })
          .to(cur, { x: p.x + p.w * 0.55, y: p.y + 34, duration: 0.8, ease: 'power2.inOut' })
          .call(function () { note.textContent = NOTES[i]; })
          .set(note, { x: Math.min(p.x + p.w * 0.55 + 22, el.offsetWidth - 230), y: p.y - 26 })
          .to(note, { autoAlpha: 1, duration: 0.3 })
          .to({}, { duration: 0.9 });
        if (n) {
          tl.to(card, { scale: 1.05, rotation: -3, boxShadow: '0 30px 40px -18px rgba(0,0,0,.8)', duration: 0.2 })
            .to(note, { autoAlpha: 0, duration: 0.2 })
            .to(card, { x: n.x, y: n.y, duration: 0.9, ease: 'power2.inOut' })
            .to(cur, { x: n.x + n.w * 0.55, y: n.y + 34, duration: 0.9, ease: 'power2.inOut' }, '<')
            .to(card, { scale: 1, rotation: 0, boxShadow: '0 18px 30px -16px rgba(0,0,0,.7)', duration: 0.25 })
            .call(function () { setState(i + 1); })
            .fromTo(chip, { scale: 1.3 }, { scale: 1, duration: 0.35, ease: 'power3.out' })
            .to(cur, { autoAlpha: 0, x: '+=30', y: '+=60', duration: 0.5 }, '+=0.2');
        } else {
          tl.to([cur, note], { autoAlpha: 0, duration: 0.4 }, '+=0.8')
            .to(card, { autoAlpha: 0, y: '-=12', duration: 0.4 })
            .call(function () { setState(0); })
            .set(card, { x: p0.x, y: p0.y + 12 })
            .to(card, { autoAlpha: 1, y: p0.y, duration: 0.5, ease: 'power3.out' });
        }
      })(i);
    }
    build();
    var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 250); });
    if (document.fonts) document.fonts.ready.then(build);
    return { toggle: function (on) { playing = on; if (tl) on ? tl.play() : tl.pause(); } };
  }

  function staticState() {
    doc.classList.remove('intro', 'pre');
    if (skel) skel.style.display = 'none';
    if (real) real.style.display = 'block';
    gsap.set(['.dc-chat .bubble'], { autoAlpha: 1, y: 0 });
    gsap.set('.dc-fill', { width: '62%' }); gsap.set('.dc-truck', { left: '62%' });
    journey.build();
    gsap.set('#jr-truck', { autoAlpha: 0 });
    $$('.js-step').forEach(function (s) { s.classList.add('is-active'); });
    $$('.faq details').forEach(function (d) { if (d.open) gsap.set($('.mx__v', d), { morphSVG: 'M5 12h14' }); });
    document.addEventListener('faq:toggle', function (e) { gsap.set($('.mx__v', e.detail.el), { morphSVG: e.detail.el.open ? 'M5 12h14' : 'M12 5v14' }); });
    document.addEventListener('city:change', function (e) { liquid.set(e.detail.name); });
    window.addEventListener('resize', function () { journey.build(); });
    if (document.fonts) document.fonts.ready.then(function () { journey.build(); });
  }
})();
