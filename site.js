/* =================================================================
   Safegati v7 — interactions (works without the animation layer)
   ================================================================= */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = doc.classList.contains('rm');
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function emit(name, detail) { document.dispatchEvent(new CustomEvent(name, { detail: detail })); }
  var hasFlip = function () { return !!(window.gsap && window.Flip && !reduce); };

  /* ---------- Open now (India time) ---------- */
  (function () {
    var h = parseInt(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(new Date()), 10);
    var open = h >= 6 && h < 22;
    $('#open-text').textContent = open ? 'Open now, until 10 PM' : 'Closed now. We open at 6 AM';
    $('#open-status').classList.toggle('is-closed', !open);
  })();

  /* ---------- Smooth in-page links ---------- */
  function scrollToEl(el, focusSel) {
    var y = el.getBoundingClientRect().top + window.scrollY - 96;
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.3 });
    else window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    if (focusSel) setTimeout(function () { var f = $(focusSel); if (f) f.focus({ preventScroll: true }); }, reduce ? 0 : 1200);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (href === '#') { e.preventDefault(); return; } // preview: outside links are disabled
    if (href.charAt(0) !== '#') return;
    var el = document.querySelector(href);
    if (!el) return;
    e.preventDefault();
    closeMenu(false);
    scrollToEl(el, a.getAttribute('data-focus'));
  });

  /* ---------- Header: hide on scroll down, progress, scroll-spy ---------- */
  var hdr = $('.hdr'), bar = $('.hdr__bar'), lastY = window.scrollY, ticking = false;
  var spyLinks = $$('.hdr__nav a'), spyTargets = spyLinks.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY, max = doc.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      if (!menuOpen) hdr.classList.toggle('is-hidden', y > lastY && y > 300);
      lastY = y;
      var mid = window.innerHeight * 0.4, active = -1;
      spyTargets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < mid) active = i; });
      spyLinks.forEach(function (a, i) { a.classList.toggle('is-active', i === active && spyTargets[i].getBoundingClientRect().bottom > mid); });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu (circular reveal) ---------- */
  var menuBtn = $('.hdr__menu'), menu = $('#menu'), menuOpen = false, menuTimer;
  var behind = ['main', 'footer', '.mbar', '.pnote', '.hdr__nav', '.hdr__cta'].map(function (sel) { return $(sel); }).filter(Boolean);
  function setInert(on) { behind.forEach(function (el) { if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert'); }); }
  function openMenu() {
    if (menuOpen) return;
    menuOpen = true; clearTimeout(menuTimer);
    menu.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add('is-open'); }); });
    doc.classList.add('menu-open'); hdr.classList.remove('is-hidden');
    menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.setAttribute('aria-label', 'Close menu');
    setInert(true);
    if (window.__lenis) window.__lenis.stop();
    setTimeout(function () { var first = $('nav a', menu); if (first && menuOpen) first.focus({ preventScroll: true }); }, reduce ? 0 : 350);
  }
  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    menuOpen = false; menu.classList.remove('is-open');
    doc.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.setAttribute('aria-label', 'Open menu');
    setInert(false);
    menuTimer = setTimeout(function () { if (!menuOpen) menu.hidden = true; }, reduce ? 0 : 700);
    if (window.__lenis) window.__lenis.start();
    if (returnFocus) menuBtn.focus({ preventScroll: true });
  }
  menuBtn.addEventListener('click', function () { menuOpen ? closeMenu(true) : openMenu(); });
  document.addEventListener('keydown', function (e) {
    if (!menuOpen) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); return; }
    if (e.key !== 'Tab') return;
    // keep focus inside the header button and the menu
    var items = [menuBtn].concat($$('a, button', menu));
    var i = items.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); items[items.length - 1].focus(); }
    else if (!e.shiftKey && (i === items.length - 1 || i === -1)) { e.preventDefault(); items[0].focus(); }
  });
  // the menu only exists below 1121px: close it if the window grows past that
  var wide = window.matchMedia('(min-width: 1121px)');
  function onWide() { if (wide.matches) closeMenu(false); }
  if (wide.addEventListener) wide.addEventListener('change', onWide); else wide.addListener(onWide);

  /* ---------- Buttons: fill grows from where the pointer enters ---------- */
  document.addEventListener('pointerover', function (e) {
    var b = e.target.closest && e.target.closest('.btn');
    if (!b || b.contains(e.relatedTarget)) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty('--x', (e.clientX - r.left) + 'px');
    b.style.setProperty('--y', (e.clientY - r.top) + 'px');
  });

  /* ---------- Quote bar: two steps, then a confirmation ---------- */
  var form = $('#quote'), s1 = $('.qbar__step--1', form), s2 = $('.qbar__step--2', form), done = $('.qbar__done', form), err = $('#q-error');
  var fFrom = $('#q-from'), fTo = $('#q-to'), fDate = $('#q-date'), fName = $('#q-name'), fWa = $('#q-wa');
  var today = new Date();
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  fDate.min = iso(today);
  function mark(input, bad) { input.closest('.qf').classList.toggle('has-error', bad); input.setAttribute('aria-invalid', bad ? 'true' : 'false'); }
  [fFrom, fTo, fWa].forEach(function (i) { i.addEventListener('input', function () { mark(i, false); err.textContent = ''; }); });
  function swapStep(from, to) {
    var state = hasFlip() ? Flip.getState(form) : null;
    from.hidden = true; to.hidden = false;
    if (state) Flip.from(state, { duration: 0.6, ease: 'power3.inOut', scale: false, simple: true });
    if (window.gsap && !reduce) gsap.from(to.children, { y: 14, autoAlpha: 0, duration: 0.5, stagger: 0.05, ease: 'power3.out', delay: 0.15 });
    var f = to.querySelector('input:not([type=radio]), button'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 350);
  }
  $('.qbar__swap').addEventListener('click', function () {
    var a = fFrom.value; fFrom.value = fTo.value; fTo.value = a;
    this.style.transform = 'rotate(' + ((parseInt(this.dataset.r || 0, 10) + 180)) + 'deg)';
    this.dataset.r = (parseInt(this.dataset.r || 0, 10) + 180);
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var step = s1.hidden ? 2 : 1;
    if (step === 1) {
      var bad = [];
      if (!fFrom.value.trim()) { mark(fFrom, true); bad.push(fFrom); }
      if (!fTo.value.trim()) { mark(fTo, true); bad.push(fTo); }
      if (bad.length) { err.textContent = 'Enter where you\'re moving from and to.'; bad[0].focus(); emit('quote:shake'); return; }
      swapStep(s1, s2);
    } else {
      var digits = fWa.value.replace(/\D/g, '').slice(-10);
      if (digits.length !== 10) { mark(fWa, true); err.textContent = 'Enter a 10-digit WhatsApp number.'; fWa.focus(); emit('quote:shake'); return; }
      var name = fName.value.trim().split(' ')[0];
      $('#done-name').textContent = name ? 'Thanks, ' + name + '.' : 'Thanks.';
      $('#done-msg').textContent = 'We\'ll send your price for ' + fFrom.value.trim() + ' to ' + fTo.value.trim() + ' on WhatsApp shortly.';
      swapStep(s2, done);
      emit('quote:done');
    }
  });
  $('#q-again').addEventListener('click', function () { form.reset(); swapStep(done, s1); });

  /* ---------- Isometric scenes (drawn here, animated by CSS) ---------- */
  var ISO = (function () {
    var C30 = 0.866, S30 = 0.5, OX = 140, OY = 104;
    function P(x, y, z) { return [(OX + (x - y) * C30).toFixed(1), (OY + (x + y) * S30 - z).toFixed(1)]; }
    function poly(pts, fill, extra) { return '<polygon points="' + pts.map(function (p) { return P(p[0], p[1], p[2]).join(','); }).join(' ') + '" fill="' + fill + '"' + (extra || '') + '/>'; }
    function box(x, y, z, w, d, h, c, extra) {
      return '<g' + (extra || '') + '>' +
        poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], c[1]) +
        poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], c[2]) +
        poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], c[0]) + '</g>';
    }
    var KRAFT = ['#EBCB9C', '#C4925A', '#A8773F'], KRAFT_IN = '#5C3D1E';
    var SLAB = ['#FFFFFF', '#DCE5F0', '#C7D3E2'], BLUE = ['#3D95DD', '#0070CB', '#005AA6'], NAVY = ['#24406A', '#13284A', '#0B1324'];
    var WHITE = ['#FFFFFF', '#E9EEF5', '#D3DCE8'], GREEN = ['#4CC57E', '#10A34F', '#0B7A3A'];
    function slab() { return box(-72, -72, -12, 144, 144, 12, SLAB); }
    function bubble(x, y, w, cls, fill) { return '<g class="' + cls + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="18" rx="9" fill="' + fill + '"/><rect x="' + (x + 8) + '" y="' + (y + 7) + '" width="' + (w - 22) + '" height="4" rx="2" fill="#fff" opacity=".85"/></g>'; }
    function tick(cx, cy, cls) { return '<g class="' + cls + '"><circle cx="' + cx + '" cy="' + cy + '" r="13" fill="#10A34F"/><path d="M' + (cx - 6) + ' ' + cy + 'l4 4 8-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g>'; }
    var scenes = {
      book: function () {
        return slab() +
          box(-16, -34, 0, 30, 10, 70, NAVY) +
          poly([[-12, -24, 8], [10, -24, 8], [10, -24, 64], [-12, -24, 64]], '#DDF3E2') +
          bubble(150, 30, 70, 'pop1', '#0B7A2A') + bubble(166, 54, 54, 'pop2', '#0070CB') + bubble(150, 78, 64, 'pop3', '#0B7A2A') +
          tick(214, 118, 'pop3');
      },
      pack: function () {
        var x = -32, y = -32, w = 64, d = 64, h = 48, t = h;
        var open = '<g class="sm-a">' + box(x, y, 0, w, d, h, [KRAFT_IN, KRAFT[1], KRAFT[2]]) +
          poly([[x, y, t], [x + w, y, t], [x + w, y - 12, t + 24], [x, y - 12, t + 24]], '#D7AD78') +
          poly([[x + w, y, t], [x + w, y + d, t], [x + w + 12, y + d, t + 24], [x + w + 12, y, t + 24]], '#C9A06B') +
          poly([[x, y + d, t], [x + w, y + d, t], [x + w, y + d + 12, t + 24], [x, y + d + 12, t + 24]], '#E2BC88') + '</g>';
        var half = '<g class="sm-b">' + box(x, y, 0, w, d, h, [KRAFT_IN, KRAFT[1], KRAFT[2]]) +
          poly([[x, y, t], [x + w, y, t], [x + w, y + 14, t + 16], [x, y + 14, t + 16]], '#D7AD78') +
          poly([[x, y + d, t], [x + w, y + d, t], [x + w, y + d - 14, t + 16], [x, y + d - 14, t + 16]], '#E2BC88') + '</g>';
        var shut = '<g class="sm-c">' + box(x, y, 0, w, d, h, KRAFT) +
          poly([[x, y + d / 2 - 5, t], [x + w, y + d / 2 - 5, t], [x + w, y + d / 2 + 5, t], [x, y + d / 2 + 5, t]], '#0070CB') +
          poly([[x + w, y + d / 2 - 5, t], [x + w, y + d / 2 + 5, t], [x + w, y + d / 2 + 5, t - 16], [x + w, y + d / 2 - 5, t - 16]], '#005AA6') +
          poly([[x + 10, y + d, 10], [x + 34, y + d, 10], [x + 34, y + d, 26], [x + 10, y + d, 26]], '#FFFFFF') +
          poly([[x + 13, y + d, 20], [x + 25, y + d, 20], [x + 25, y + d, 23], [x + 13, y + d, 23]], '#EF2B3E') + '</g>';
        return slab() + open + half + shut;
      },
      load: function () {
        return slab() +
          box(-4, -66, 0, 76, 56, 62, BLUE) +
          poly([[-4, -10, 4], [72, -10, 4], [72, -10, 58], [-4, -10, 58]], '#0F2E52') +
          box(-62, 14, 0, 26, 26, 22, KRAFT, ' class="pop1"') +
          box(-34, 14, 0, 26, 26, 22, KRAFT, ' class="pop2"') +
          box(-62, 14, 22, 26, 26, 22, KRAFT, ' class="pop3"') +
          box(-6, 30, 0, 6, 30, 46, NAVY);
      },
      move: function () {
        var dashes = '';
        for (var i = -5; i < 6; i++) dashes += poly([[i * 30, -2, 1], [i * 30 + 16, -2, 1], [i * 30 + 16, 2, 1], [i * 30, 2, 1]], '#FFFFFF');
        return box(-100, -30, -8, 200, 60, 8, ['#2A3A55', '#1B2B44', '#13213A']) +
          '<g class="iso-road">' + dashes + '</g>' +
          box(-60, -64, 0, 22, 22, 26, GREEN) + box(46, 36, 0, 20, 20, 22, GREEN) +
          '<g class="iso-bob">' + box(-40, -18, 6, 62, 36, 44, BLUE) + box(22, -18, 6, 24, 36, 30, NAVY) +
          poly([[46, -12, 22], [46, 12, 22], [46, 12, 32], [46, -12, 32]], '#9FD3FF') + '</g>';
      },
      deliver: function () {
        var x = -58, y = -60, w = 64, d = 54, h = 46, r = 26;
        return slab() +
          poly([[x, y, h], [x + w, y, h], [x + w, y + d / 2, h + r], [x, y + d / 2, h + r]], '#0B4F8F') +
          box(x, y, 0, w, d, h, WHITE) +
          poly([[x + w, y, h], [x + w, y + d, h], [x + w, y + d / 2, h + r]], '#E9EEF5') +
          poly([[x, y + d, h], [x + w, y + d, h], [x + w, y + d / 2, h + r], [x, y + d / 2, h + r]], '#0070CB') +
          poly([[x + 24, y + d, 0], [x + 40, y + d, 0], [x + 40, y + d, 28], [x + 24, y + d, 28]], '#0B1324') +
          poly([[x + w, y + 10, 18], [x + w, y + 24, 18], [x + w, y + 24, 32], [x + w, y + 10, 32]], '#BFE3FF') +
          box(20, 6, 0, 28, 28, 24, KRAFT, ' class="iso-bob"') +
          tick(196, 64, 'pop2');
      }
    };
    return { render: function (svg) { var f = scenes[svg.getAttribute('data-iso')]; if (f) svg.innerHTML = f(); } };
  })();
  $$('svg[data-iso]').forEach(ISO.render);

  /* ---------- Moving-day countdown ---------- */
  var cdDate = $('#cd-date'), cdList = $('#cd-list'), cdNum = $('#cd-num'), cdUnit = $('#cd-unit'), cdRing = $('#cd-ring');
  var ringLen = 2 * Math.PI * 52;
  cdRing.style.strokeDasharray = ringLen;
  var start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var def = new Date(start); def.setDate(def.getDate() + 14);
  cdDate.min = iso(start); cdDate.value = iso(def);
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TASKS = [
    { id: 'book', off: -4, title: 'Book your move', body: 'Message us on WhatsApp. A 25% advance confirms the date.' },
    { id: 'insure', off: -3, title: 'Insure your shipment', body: 'We recommend it for full cover.' },
    { id: 'vehicle', off: -2, when: 'vehicle', title: 'Get your car or bike ready', body: '<mark class="tbc">What to do before handing over your car or bike</mark>' },
    { id: 'storage', off: -2, when: 'storage', title: 'Plan your storage', body: 'Our Secunderabad warehouse charges a lower rate. Loading, unloading and local delivery are extra.' },
    { id: 'fridge', off: -1, title: 'Defrost and dry the fridge', body: 'Leave the door open overnight so it travels dry.' },
    { id: 'bag', off: -1, title: 'Pack a bag of essentials', body: 'Clothes, chargers, medicines and documents for the first night.' },
    { id: 'valuables', off: 0, title: 'Keep valuables with you', body: 'Jewellery, cash and important papers travel with you, not in the truck.' },
    { id: 'arrive', off: 0, title: 'Check every box on arrival', body: 'Tick each one off as it comes into your new home.' }
  ];
  function whenLabel(off) { return off === 0 ? 'Moving day' : (-off) + (off === -1 ? ' day before' : ' days before'); }
  var cdFirst = true;
  function renderCountdown() {
    var move = cdDate.value ? new Date(cdDate.value + 'T00:00') : def;
    var days = Math.max(0, Math.round((move - start) / 864e5));
    cdNum.textContent = days; cdUnit.textContent = days === 1 ? 'day to go' : days === 0 ? 'moving today' : 'days to go';
    cdRing.style.strokeDashoffset = ringLen * Math.min(1, days / 30);
    var flags = { vehicle: $('#cd-vehicle').checked, storage: $('#cd-storage').checked };
    var state = hasFlip() && !cdFirst ? Flip.getState($$('.task', cdList)) : null;
    var existing = {}; $$('.task', cdList).forEach(function (el) { existing[el.dataset.id] = el; });
    var frag = document.createDocumentFragment(), entering = [];
    TASKS.forEach(function (tk) {
      if (tk.when && !flags[tk.when]) return;
      var d = new Date(move); d.setDate(d.getDate() + tk.off);
      var late = d < start;
      var el = existing[tk.id];
      if (!el) { el = document.createElement('li'); el.className = 'task'; el.dataset.id = tk.id; entering.push(el); }
      delete existing[tk.id];
      el.innerHTML = '<span class="task__date"><span><b>' + d.getDate() + '</b><br><span>' + MONTHS[d.getMonth()] + '</span></span></span>' +
        '<div><h3>' + tk.title + '</h3><p>' + tk.body + '</p><span class="task__when' + (late ? ' is-late' : '') + '">' + (late ? 'Do this today' : whenLabel(tk.off)) + '</span></div>';
      frag.appendChild(el);
    });
    var leaving = Object.keys(existing).map(function (k) { return existing[k]; });
    cdList.innerHTML = ''; cdList.appendChild(frag);
    if (state) {
      Flip.from(state, { duration: 0.6, ease: 'power3.inOut', absolute: false });
      if (entering.length) gsap.from(entering, { autoAlpha: 0, scale: 0.9, y: -12, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    }
    if (!cdFirst) emit('countdown:change', { days: days });
    cdFirst = false;
  }
  cdDate.addEventListener('change', renderCountdown);
  $('#cd-vehicle').addEventListener('change', renderCountdown);
  $('#cd-storage').addEventListener('change', renderCountdown);
  renderCountdown();

  /* ---------- Branches: liquid tabs + card ---------- */
  var CITIES = [
    { city: 'Hyderabad', tag: 'Head office', email: 'safegatihyd@gmail.com', locs: [['Gachibowli office', 'Survey No. 136, Anjaiah Nagar, Opp. Jayabheri Enclave Lane, Gachibowli, Hyderabad 500081'], ['Warehouse', 'Plot 79/1, near MBR Talent School, Kanajiguda, Trimulgherry, Secunderabad, Telangana']] },
    { city: 'Bangalore', email: 'safegatibng2@gmail.com', locs: [['Dasarahalli', '#20, 12th Cross, Maruthi Layout, Dasarahalli, H.A. Farm Post, near Dasarahalli Bus Stop, Bengaluru 560024']] },
    { city: 'Chennai', email: 'sales@safegatipackers.org', locs: [['Anna Nagar', 'No. 48, 3rd Avenue, 23rd Main Road, Anna Nagar, Chennai 600040']] },
    { city: 'Pune', email: 'sales@safegatipackers.org', locs: [['Wakad', 'Shop No. 16, S No. 210, Buld-S, near Topaz Park, Wakad, Pune, Maharashtra 411057']] },
    { city: 'Mumbai', email: 'safegatimumbai@gmail.com', locs: [['Santacruz West', 'VM Bhargav Road, Hasmukh Nagar, Santacruz West, Mumbai 400054']] },
    { city: 'Kolkata', email: 'kolkatasafegati@gmail.com', locs: [['Rajarhat', 'Ground Floor G1, Soumily Green, Vill. Natunpra, Gopalpur, PO Rajarhat, PS Airport, Kolkata 700136']] },
    { city: 'Delhi NCR', email: 'sales@safegatipackers.org', locs: [['Gurugram', 'EZ-8, Choma Road, near RK Company, New Palam Vihar, Gurugram, Haryana 122017'], ['IMT Manesar', 'Shop No. 47, Amrapali Corporate Hub, Sector 2, IMT Manesar, Gurugram, Haryana 122052'], ['Greater Noida', 'H 57, Delta Sector, Greater Noida 201308']] }
  ];
  var tabsWrap = $('.ltabs__btns'), card = $('#br-card'), lbMain = $('.lb--main'), lbTrail = $('.lb--trail');
  tabsWrap.innerHTML = CITIES.map(function (c, i) {
    return '<button class="ltab" type="button" role="tab" id="lt-' + i + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' + c.city + (c.tag ? '<small>HQ</small>' : '') + '</button>';
  }).join('');
  var tabs = $$('.ltab', tabsWrap);
  function cardHTML(c) {
    return '<p class="bc-city">' + c.city + (c.tag ? '<small>' + c.tag + '</small>' : '') + '</p>' +
      c.locs.map(function (l) { return '<div class="loc"><svg class="ico"><use href="#i-pin"/></svg><b>' + l[0] + '</b><p>' + l[1] + '</p><a class="link" href="#"><svg class="ico"><use href="#i-dir"/></svg>Get directions</a></div>'; }).join('') +
      '<div class="bc-actions"><a class="btn btn--wa btn--sm" href="#"><svg class="ico"><use href="#i-wa"/></svg>Chat with ' + c.city + '</a><a class="bc-mail" href="#"><svg class="ico"><use href="#i-mail"/></svg>' + c.email + '</a></div>';
  }
  function placeBlob(i, instant) {
    var t = tabs[i], x = t.offsetLeft, y = t.offsetTop, w = t.offsetWidth, h = t.offsetHeight;
    if (window.gsap && !reduce && !instant) {
      gsap.to(lbMain, { x: x, y: y, width: w, height: h, duration: 0.55, ease: 'power3.inOut' });
      gsap.to(lbTrail, { x: x + w * 0.15, y: y + h * 0.1, width: w * 0.7, height: h * 0.8, duration: 0.85, ease: 'power3.inOut' });
    } else {
      [lbMain, lbTrail].forEach(function (b) { b.style.transform = 'translate(' + x + 'px,' + y + 'px)'; b.style.width = w + 'px'; b.style.height = h + 'px'; });
    }
  }
  function selectCity(i, focus) {
    tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    if (focus) tabs[i].focus();
    placeBlob(i);
    var html = cardHTML(CITIES[i]);
    if (window.gsap && !reduce) {
      gsap.to(card, { autoAlpha: 0, y: 10, duration: 0.18, ease: 'power2.in', onComplete: function () { card.innerHTML = html; gsap.to(card, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }); } });
    } else card.innerHTML = html;
    var n = CITIES[i].locs.length; $('#br-meta-t').textContent = CITIES[i].tag ? 'Head office and warehouse' : n === 1 ? '1 branch in ' + CITIES[i].city : n + ' branches across ' + CITIES[i].city;
    emit('city:change', { name: CITIES[i].city });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { if (t.getAttribute('aria-selected') !== 'true') selectCity(i); });
    t.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectCity((i + 1) % tabs.length, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectCity((i - 1 + tabs.length) % tabs.length, true); }
    });
  });
  card.innerHTML = cardHTML(CITIES[0]);
  placeBlob(0, true);
  window.addEventListener('resize', function () { var i = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); placeBlob(i, true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeBlob(0, true); });

  /* ---------- Flip ID card + copy GSTIN ---------- */
  var idcard = $('#idcard');
  idcard.addEventListener('click', function () {
    var f = !idcard.classList.contains('is-flipped');
    idcard.classList.toggle('is-flipped', f);
    idcard.setAttribute('aria-pressed', String(f));
  });
  var copyBtn = $('#copy-gstin');
  copyBtn.addEventListener('click', function () {
    var ok = function () {
      copyBtn.classList.add('is-done'); copyBtn.innerHTML = '<svg class="ico"><use href="#i-check"/></svg><span>Copied</span>';
      setTimeout(function () { copyBtn.classList.remove('is-done'); copyBtn.innerHTML = '<svg class="ico"><use href="#i-copy"/></svg><span>Copy GSTIN</span>'; }, 1800);
    };
    if (navigator.clipboard) navigator.clipboard.writeText('36ABHCS0027N1Z6').then(ok, ok); else ok();
  });

  /* ---------- Pricing segmented controls ---------- */
  var sel = { size: '1 BHK', dist: 'within city' };
  $$('.seg').forEach(function (seg) {
    var thumb = $('.seg__thumb', seg), btns = $$('button', seg), key = seg.getAttribute('data-seg');
    function place(b) { thumb.style.width = b.offsetWidth + 'px'; thumb.style.transform = 'translateX(' + (b.offsetLeft - 5) + 'px)'; }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
        place(b);
        sel[key] = key === 'dist' ? b.textContent.charAt(0).toLowerCase() + b.textContent.slice(1) : b.textContent;
        var t = $('#ticket-sel'); t.textContent = sel.size + ', ' + sel.dist;
        emit('price:change');
      });
    });
    var init = function () { place(btns.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0]); };
    init(); window.addEventListener('resize', init);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(init);
  });

  /* ---------- FAQ: tell the motion layer when an answer opens ---------- */
  $$('.faq details').forEach(function (d) { d.addEventListener('toggle', function () { emit('faq:toggle', { el: d }); }); });

  /* ---------- Preview note ---------- */
  var note = $('#pnote');
  $('button', note).addEventListener('click', function () { note.hidden = true; });

  /* If the animation layer never loads, never leave the loader up */
  window.addEventListener('load', function () { setTimeout(function () { if (!window.gsap) doc.classList.remove('intro'); }, 200); });
})();
