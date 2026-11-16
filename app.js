(() => {
  'use strict';

  // Always open at the top: phone browsers otherwise jump back to where the page was left last time
  try {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  } catch (e) { /* older browsers: nothing to do */ }

  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = n => S.currency + ' ' + Number(n).toLocaleString('id-ID');
  const treatment = id => S.treatments.find(t => t.id === id) || S.treatments[0];
  const zone = id => S.zones.find(z => z.id === id);
  const waNumber = String((S.whatsapp && S.whatsapp.number) || '').replace(/\D/g, '');
  const areaNames = S.areas.map(a => a.name);
  const areaOf = () => S.areas.find(a => a.name === state.area) || null;
  // transport fee of the chosen area: a number, null = area not in the list (fee on request), undefined = no area chosen yet
  const transport = () => { const a = areaOf(); return a ? a.fee : (state.area === '__else' ? null : undefined); };

  const state = {
    zones: [],
    treatment: S.defaults.treatment,
    minutes: S.defaults.minutes,
    pressure: 'Medium',
    day: 'today',
    date: '',
    time: '',
    place: '',
    area: '',
    people: 1,
    note: '',
    manual: false, // true once the visitor picks massage or length by hand
    dirty: false   // true once anything in the booking was touched
  };
  const updaters = [];

  /* ---------- config -> page ---------- */
  const read = path => path.split('.').reduce((o, k) => (o == null ? o : o[k]), S);
  $$('[data-bind]').forEach(n => {
    const v = read(n.dataset.bind);
    if (v != null && v !== '') n.textContent = v;
  });
  document.title = S.brand.name;

  if (S.draft) {
    document.documentElement.classList.add('is-draft');
    $('#draftbar').hidden = false;
    $('#draft-count').textContent = '· ' + S.todo.length + T(' details are still examples (dashed boxes). Tap for the list.');
    S.todo.forEach(t => $('#draft-list').appendChild(el('li', '', t)));
  }

  $('#hero-areas').textContent = areaNames.slice(0, 4).join(', ') + (areaNames.length > 4 ? T(' and nearby') : '');
  areaNames.forEach((a, i) => {
    const s = el('span', '', a);
    if (i < areaNames.length - 1) s.appendChild(el('i', '', '·'));
    $('#where-names').append(s, ' ');
  });
  $('#foot-areas').textContent = areaNames.join(' · ');

  // transport fee by distance: areas grouped by fee, nearest first
  (() => {
    const list = $('#where-fees');
    [...new Set(S.areas.map(a => a.fee))].sort((x, y) => x - y).forEach(fee => {
      const li = el('li');
      li.append(el('b', '', fee ? T('Transport fee {fee}', { fee: money(fee) }) : T('No transport fee')), S.areas.filter(a => a.fee === fee).map(a => a.name).join(', '));
      list.appendChild(li);
    });
    const far = el('li');
    far.append(el('b', '', T('Further away')), T('Ask. You hear the fee before you book.'));
    list.appendChild(far);
  })();

  // FAQ entry on transport, built from the same fees so the numbers can never disagree with the booking
  (() => {
    const near = S.areas.filter(a => !a.fee).map(a => a.name).join(', ');
    const list = S.areas.filter(a => a.fee).map(a => a.name + ' ' + money(a.fee)).join(', ');
    const d = el('details');
    d.setAttribute('data-todo', '');
    d.append(el('summary', '', T('Is transport included?')), el('p', '', T('In {near} there is no transport fee. Further out a fee is added by distance: {list}. Anywhere else, ask and you hear the fee before you book.', { near, list })));
    $$('.faq__list details')[3].after(d);
  })();
  $('#foot-wa').textContent = S.whatsapp.display ? 'WhatsApp ' + S.whatsapp.display : 'WhatsApp';

  /* ---------- camera: put a point of the figure in the middle of a frame ---------- */
  function aim(cam, frame, xPct, yPct, scale) {
    const fw = frame.clientWidth, fh = frame.clientHeight;
    const cw = cam.offsetWidth, ch = cam.offsetHeight;
    if (!fw || !cw) return;
    const s = Math.max(scale, fw / cw, fh / ch);
    let tx = fw / 2 - (xPct / 100) * cw * s;
    let ty = fh / 2 - (yPct / 100) * ch * s;
    tx = Math.min(0, Math.max(fw - cw * s, tx));
    ty = Math.min(0, Math.max(fh - ch * s, ty));
    cam.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
  }

  /* ---------- suggestion from the chosen zones ---------- */
  function suggest(z) {
    const n = z.length;
    const only = ids => n > 0 && z.every(id => ids.includes(id));
    let pick;
    if (n === 0) pick = { t: S.defaults.treatment, m: S.defaults.minutes };
    else if (n >= 4) pick = { t: 'balinese', m: 90 };
    else if (z.includes('feet') && only(['feet', 'legs'])) pick = { t: 'feet', m: 60 };
    else if (only(['head', 'neck'])) pick = { t: 'head', m: 60 };
    else if (only(['arms'])) pick = { t: 'balinese', m: 60 };
    else pick = { t: 'deep', m: n === 1 ? 60 : 90 };
    const t = treatment(pick.t);
    return { t: t.id, m: t.prices[pick.m] ? pick.m : Number(Object.keys(t.prices)[0]) };
  }
  function afterZones() {
    state.zones.sort((a, b) => S.zones.findIndex(z => z.id === a) - S.zones.findIndex(z => z.id === b));
    state.dirty = true;
    if (!state.manual) {
      const s = suggest(state.zones);
      state.treatment = s.t;
      state.minutes = s.m;
    }
    update();
  }
  function toggleZone(id, force) {
    const i = state.zones.indexOf(id);
    const want = force == null ? i < 0 : force;
    if (want && i < 0) state.zones.push(id);
    if (!want && i >= 0) state.zones.splice(i, 1);
    afterZones();
  }

  /* ---------- muscle fibres (canvas): a knot that loosens while you hold ---------- */
  function Fibres(canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0;
    let lines = [], rings = [], ringClock = 0;
    let angle = 0, tension = 1, pressing = false, px = 0, py = 0, done = false, onDone = null;

    function resize() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    }
    function seed() {
      const n = W < 340 ? 62 : 84;
      lines = [];
      for (let i = 0; i < n; i++) {
        lines.push({ off: (i + Math.random() * .9) / n - .5, ph: Math.random() * 6.283, amp: .35 + Math.random(), w: .7 + Math.random() * 1.9, a: .22 + Math.random() * .55 });
      }
    }
    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const t = now / 1000;
      if (pressing && tension > 0) {
        tension = Math.max(0, tension - dt / 2.2);
        ringClock += dt;
        if (ringClock > .3) { ringClock = 0; rings.push({ x: px, y: py, r: 10, a: .6 }); }
        if (tension === 0 && !done) { done = true; if (onDone) onDone(); }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const kx = W / 2, ky = H * .5;

      if (tension > .01) { // heat of the knot
        const g = ctx.createRadialGradient(kx, ky, 0, kx, ky, Math.min(W, H) * .6);
        g.addColorStop(0, 'rgba(255,150,120,' + (.4 * tension).toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,150,120,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }

      ctx.save();
      ctx.translate(kx, ky); ctx.rotate(angle);
      ctx.lineCap = 'round';
      ctx.globalCompositeOperation = 'lighter';
      const L = Math.hypot(W, H) * .62, span = Math.max(W, H) * .98, sig = L * .2;
      for (const ln of lines) {
        const base = ln.off * span;
        ctx.beginPath();
        for (let s = -L; s <= L; s += 12) {
          const g = Math.exp(-(s * s) / (2 * sig * sig));
          const y = base
            - base * .7 * g * tension                                             // fibres pulled into the knot
            + Math.sin(s * .05 + ln.ph + t * 1.7) * 15 * g * tension * ln.amp     // nervous kink inside it
            + Math.sin(s * .007 + ln.ph + t * .4) * (13 - 6 * tension) * ln.amp;  // calm drift everywhere
          if (s === -L) ctx.moveTo(s, y); else ctx.lineTo(s, y);
        }
        const heat = tension * (1 - Math.min(1, Math.abs(ln.off) * 1.7));
        ctx.strokeStyle = 'rgba(' + Math.round(222 + 33 * heat) + ',' + Math.round(150 + 45 * heat) + ',' + Math.round(132 + 32 * heat) + ',' + (ln.a * (.85 + .15 * heat)).toFixed(3) + ')';
        ctx.lineWidth = ln.w * (1 + .7 * heat);
        ctx.stroke();
      }
      ctx.restore();

      for (const r of rings) { // ripples under the finger
        r.r += dt * 95; r.a -= dt * .62;
        if (r.a > 0) { ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.strokeStyle = 'rgba(243,236,228,' + r.a.toFixed(3) + ')'; ctx.lineWidth = 1.5; ctx.stroke(); }
      }
      rings = rings.filter(r => r.a > 0);

      if (!done && (pressing || tension < 1)) { // progress ring
        ctx.beginPath(); ctx.arc(px, py, 34, 0, 6.283); ctx.strokeStyle = 'rgba(243,236,228,.25)'; ctx.lineWidth = 3; ctx.stroke();
        ctx.beginPath(); ctx.arc(px, py, 34, -1.5708, -1.5708 + 6.283 * (1 - tension)); ctx.strokeStyle = '#F3ECE4'; ctx.lineWidth = 3; ctx.stroke();
      }
      raf = requestAnimationFrame(frame);
    }
    const at = e => { const r = canvas.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; };
    canvas.addEventListener('pointerdown', e => { at(e); pressing = true; });
    canvas.addEventListener('pointermove', e => { if (pressing) at(e); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => canvas.addEventListener(n, () => { pressing = false; }));
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    return {
      start(o) {
        angle = o.angle * Math.PI / 180; tension = o.tension; done = tension <= 0; onDone = o.onDone;
        resize(); seed(); rings = []; pressing = false; px = W / 2; py = H / 2;
        cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(frame);
      },
      stop() { cancelAnimationFrame(raf); raf = 0; pressing = false; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); },
      relax() { tension = 0; done = true; },
      tense() { tension = 1; done = false; },
      resize
    };
  }

  /* ---------- hero stage: tap a spot -> camera moves in -> fibres ---------- */
  const stage = $('#stage'), cam = $('#cam');
  const fibres = Fibres($('#fibres'));
  let current = null, zoomTimer = 0;

  S.zones.forEach(z => {
    const b = el('button', 'spot');
    b.type = 'button';
    b.dataset.side = z.side; b.dataset.zone = z.id;
    b.style.left = z.x + '%'; b.style.top = z.y + '%';
    b.style.setProperty('--lead', z.lead + 'cqw');
    b.style.setProperty('--room', (z.side === 'r' ? 100 - z.x - z.lead : z.x - z.lead) + 'cqw'); // space left for the label
    b.setAttribute('aria-label', z.label + T(', zoom in'));
    b.append(el('span', 'spot__dot'), el('span', 'spot__label', z.label));
    b.addEventListener('click', () => zoomIn(z.id));
    $('#spots').appendChild(b);
    updaters.push(() => b.classList.toggle('on', state.zones.includes(z.id)));
  });

  // The picture is taller than the stage: centre it once, without the camera animation
  function rest() {
    cam.style.transition = 'none';
    aim(cam, stage, 50, 50, 1);
    void cam.offsetWidth;
    cam.style.transition = '';
  }
  rest();

  function paintZoom() {
    const z = zone(current);
    if (!z) return;
    const picked = state.zones.includes(z.id);
    $('#zoom-title').textContent = z.label;
    $('#zoom-fibres').textContent = T('Fibres: ') + z.fibres;
    $('#zoom-line').textContent = z.line;
    $('#zoom-hint').textContent = picked ? T('Loosened. It is in your booking.') : T('Press and hold to loosen the knot.');
    $('#zoom-add').textContent = picked ? T('Take it out') : T('Add to my massage');
  }
  function zoomIn(id) {
    const z = zone(id);
    current = id;
    paintZoom();
    stage.dataset.view = 'zoom';
    aim(cam, stage, z.x, z.y, 3.3);
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => {
      stage.dataset.view = 'fibre';
      aim(cam, stage, z.x, z.y, 5);
      fibres.start({ angle: z.angle, tension: state.zones.includes(id) ? 0 : 1, onDone: () => toggleZone(id, true) });
      $('#zoom-back').focus({ preventScroll: true });
    }, reduceMotion ? 0 : 720);
  }
  function zoomOut() {
    if (!current) return;
    const back = $('.spot[data-zone="' + current + '"]');
    clearTimeout(zoomTimer);
    current = null;
    stage.dataset.view = 'body';
    aim(cam, stage, 50, 50, 1);
    setTimeout(() => { if (!current) fibres.stop(); }, 650);
    if (back) back.focus({ preventScroll: true });
  }
  $('#zoom-back').addEventListener('click', zoomOut);
  $('#zoom-add').addEventListener('click', () => {
    const picked = state.zones.includes(current);
    if (picked) fibres.tense(); else fibres.relax();
    toggleZone(current, !picked);
  });
  $('#zoom-book').addEventListener('click', () => setTimeout(zoomOut, 400));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') zoomOut(); });

  /* ---------- team ---------- */
  (() => {
    const grid = $('#team-grid');
    const people = S.team.filter(m => S.draft || m.name || m.photo);
    people.forEach((m, i) => {
      const empty = !m.name && !m.photo;
      const li = el('li', 'member' + (i === 0 ? ' member--lead' : '') + (empty ? ' member--empty' : ''));
      const pic = el('span', 'member__pic');
      if (m.photo) { const img = new Image(); img.src = m.photo; img.alt = m.name; img.loading = 'lazy'; pic.appendChild(img); }
      else pic.textContent = empty ? T('Photo') : m.name.charAt(0);
      li.append(pic, el('span', '', m.name || T('Name')));
      if (m.role) li.appendChild(el('small', '', m.role));
      grid.appendChild(li);
    });
    if (people.length <= 1 && !S.draft) grid.hidden = true;
  })();

  /* ---------- builder controls ---------- */
  function chip(label) { const b = el('button', 'chip', label); b.type = 'button'; return b; }
  function radio(container, options, key, onPick) {
    options.forEach(o => {
      const b = chip(o.label);
      b.addEventListener('click', () => { state[key] = o.value; state.dirty = true; if (onPick) onPick(o.value); update(); });
      container.appendChild(b);
      updaters.push(() => { b.setAttribute('aria-pressed', String(state[key] === o.value)); b.disabled = !!(o.off && o.off()); });
    });
  }
  S.zones.forEach(z => {
    const b = chip(z.label);
    b.addEventListener('click', () => toggleZone(z.id));
    $('#f-zones').appendChild(b);
    updaters.push(() => b.setAttribute('aria-pressed', String(state.zones.includes(z.id))));
  });
  (() => {
    const all = chip(T('Whole body'));
    all.addEventListener('click', () => { state.zones = state.zones.length === S.zones.length ? [] : S.zones.map(z => z.id); afterZones(); });
    $('#f-zones').appendChild(all);
    updaters.push(() => all.setAttribute('aria-pressed', String(state.zones.length === S.zones.length)));
  })();
  radio($('#f-treat'), S.treatments.map(t => ({ label: t.name, value: t.id })), 'treatment', id => {
    state.manual = true;
    const t = treatment(id);
    if (!t.prices[state.minutes]) state.minutes = Number(Object.keys(t.prices)[0]);
  });
  radio($('#f-len'), [60, 90, 120].map(m => ({ label: m + T(' min'), value: m, off: () => !treatment(state.treatment).prices[m] })), 'minutes', () => { state.manual = true; });
  radio($('#f-press'), ['Gentle', 'Medium', 'Firm'].map(p => ({ label: T(p), value: p })), 'pressure');
  radio($('#f-day'), [{ label: T('Today'), value: 'today' }, { label: T('Tomorrow'), value: 'tomorrow' }, { label: T('Pick a date'), value: 'date' }], 'day');
  radio($('#f-time'), ['Morning', 'Afternoon', 'Evening'].map(p => ({ label: T(p), value: p })), 'time');
  radio($('#f-people'), [1, 2, 3, 4].map(n => ({ label: String(n), value: n })), 'people');

  const fDate = $('#f-date'), fPlace = $('#f-place'), fArea = $('#f-area'), fNote = $('#f-note');
  const pad = n => String(n).padStart(2, '0');
  const today = new Date();
  fDate.min = today.getFullYear() + '-' + pad(today.getMonth() + 1) + '-' + pad(today.getDate());
  fArea.appendChild(new Option(T('Area'), ''));
  S.areas.forEach(a => fArea.appendChild(new Option(a.name + (a.fee ? ' · + ' + money(a.fee) : T(' · no transport fee')), a.name)));
  fArea.appendChild(new Option(T('Somewhere else · fee on request'), '__else'));
  [[fDate, 'date'], [fPlace, 'place'], [fArea, 'area'], [fNote, 'note']].forEach(([n, key]) => {
    n.addEventListener('input', () => { state[key] = n.value.trim(); state.dirty = true; update(); });
  });

  /* ---------- message ---------- */
  function whenText() {
    const now = new Date();
    let d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let label = '';
    if (state.day === 'today') label = T('Today');
    else if (state.day === 'tomorrow') { d.setDate(d.getDate() + 1); label = T('Tomorrow'); }
    else if (state.date) { const p = state.date.split('-').map(Number); d = new Date(p[0], p[1] - 1, p[2]); }
    else d = null;
    const nice = d ? d.toLocaleDateString(window.DATE_LOCALE, { weekday: 'short', day: 'numeric', month: 'short' }) : T('Date to be agreed');
    return (label ? label + ' (' + nice + ')' : nice) + ', ' + (state.time ? T(state.time).toLowerCase() : T('time flexible'));
  }
  function bookingMessage() {
    const t = treatment(state.treatment);
    const lines = [T('Hi {name}! I would like to book a massage.', { name: S.brand.short }), ''];
    lines.push(T('Massage: ') + t.name + ', ' + state.minutes + T(' min'));
    lines.push(T('Pressure: ') + T(state.pressure).toLowerCase());
    if (state.zones.length) lines.push(T('Focus: ') + (state.zones.length === S.zones.length ? T('whole body') : state.zones.map(id => zone(id).label).join(', ').toLowerCase()));
    lines.push(T('When: ') + whenText());
    const ar = areaOf(), fee = transport();
    const where = [state.place, ar ? ar.name : (state.area === '__else' ? T('other area') : '')].filter(Boolean).join(', ');
    if (where) lines.push(T('Where: ') + where);
    lines.push(T('People: ') + state.people);
    if (fee !== undefined) lines.push(T('Transport: ') + (fee === null ? T('please tell me the fee') : fee ? money(fee) : T('no fee')));
    lines.push(T('Total: ') + money(total()) + (typeof fee === 'number' ? '' : T(' plus transport')));
    if (state.note) lines.push(T('Note: ') + state.note);
    return lines.join('\n');
  }
  const helloMessage = () => T('Hi {name}! I found you on your website. Do you have time for a massage?', { name: S.brand.short });
  const price = () => (treatment(state.treatment).prices[state.minutes] || 0) * state.people;
  const total = () => price() + (typeof transport() === 'number' ? transport() : 0); // massage for everyone + one transport fee
  const waUrl = text => 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(text);

  const toast = $('#toast');
  let toastTimer;
  function say(text) {
    toast.textContent = text;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('on'), 4200);
  }
  $$('.js-wa').forEach(a => a.addEventListener('click', e => {
    if (!waNumber) {
      e.preventDefault();
      say(S.draft ? T('Preview: WhatsApp opens here once the number is set.') : T('WhatsApp is not available right now.'));
    }
  }));

  /* ---------- render ---------- */
  const picked = $('#picked');
  function update() {
    updaters.forEach(fn => fn());
    fDate.hidden = state.day !== 'date';
    if (current) paintZoom();

    const t = treatment(state.treatment);
    const line = t.name + ', ' + state.minutes + T(' min') + ' · ' + money(t.prices[state.minutes]);
    picked.textContent = '';
    if (state.zones.length) {
      const names = state.zones.length === S.zones.length ? T('Whole body') : state.zones.map(id => zone(id).label).join(', ');
      picked.append(el('strong', '', names + '.'), ' ' + (state.manual ? T('Your pick: ') : T('We would suggest: ')) + line + '. ');
    } else {
      picked.append(T('Tap a spot. The view moves in, right down to the muscle fibres. '));
    }
    const go = el('a', '', state.zones.length ? T('Book this ↓') : T('Or book straight away ↓'));
    go.href = '#book';
    picked.appendChild(go);

    $('#ticket-msg').textContent = bookingMessage();
    const now = new Date();
    $('#ticket-time').textContent = pad(now.getHours()) + ':' + pad(now.getMinutes());
    $('#ticket-price').textContent = money(total());
    const ar = areaOf(), fee = transport();
    $('#ticket-transport').textContent = fee === undefined ? T('choose your area to see the transport fee')
      : fee === null ? T('plus a transport fee, you hear it before you book')
      : fee ? T('incl. {fee} transport to {area}', { fee: money(fee), area: ar.name }) : T('no transport fee in {area}', { area: ar.name });
    $('#ticket-pay').textContent = (state.people > 1 ? T('for {n} people, ', { n: state.people }) : '') + T('paid after the massage, ') + S.facts.payment;

    if (waNumber) {
      $$('.js-wa').forEach(a => {
        const kind = a.dataset.wa === 'auto' ? (state.dirty ? 'booking' : 'hello') : a.dataset.wa;
        a.href = waUrl(kind === 'booking' ? bookingMessage() : helloMessage());
        a.target = '_blank';
        a.rel = 'noopener';
      });
    }
  }
  update();

  /* ---------- statement lights up word by word ---------- */
  (() => {
    const box = $('#statement');
    const words = box.textContent.trim().split(/\s+/);
    box.textContent = '';
    const spans = words.map(w => { const s = el('span', 'w', w); box.append(s, ' '); return s; });
    if (reduceMotion) { spans.forEach(s => s.classList.add('on')); return; }
    let ticking = false;
    function paint() {
      ticking = false;
      const r = box.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (r.height + vh * 0.4)));
      const lit = Math.round(p * spans.length);
      spans.forEach((s, i) => s.classList.toggle('on', i < lit));
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
    window.addEventListener('resize', paint);
    paint();
  })();

  /* ---------- keep the cameras right when the window changes ---------- */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const z = current && zone(current);
      if (z) { aim(cam, stage, z.x, z.y, stage.dataset.view === 'fibre' ? 5 : 3.3); fibres.resize(); } else rest();
    }, 120);
  });
  window.addEventListener('load', () => { if (!current) rest(); });

  /* ---------- shared with film.js ---------- */
  window.ROS = {
    S, $, el, money, reduceMotion,
    pick(t) {
      state.treatment = t.id; state.manual = true; state.dirty = true;
      if (!t.prices[state.minutes]) state.minutes = Number(Object.keys(t.prices)[0]);
      update();
      $('#book').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  /* ---------- phone dock: visible while no other WhatsApp button is on screen ---------- */
  (() => {
    const dock = $('#dock');
    if (!('IntersectionObserver' in window)) { dock.classList.add('on'); return; }
    const seen = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => seen.set(en.target, en.isIntersecting));
      dock.classList.toggle('on', !Array.from(seen.values()).some(Boolean));
    });
    [$('.topline'), $('.hero__cta'), $('#ticket-send'), $('.foot__big')].forEach(n => { seen.set(n, true); io.observe(n); });
  })();
})();
