/* The menu film. The body picture fills the screen and stays pinned; the scroll position drives a camera
   that flies from massage to massage. Per scene, muscle fibres and tendons are drawn on a canvas in the
   place where they sit on the picture (all coordinates are percent of the picture, measured with
   tools/landmarks.py). Without motion the section stays a plain list. */
(() => {
  'use strict';
  const { S, $, el, money, reduceMotion, pick } = window.ROS;

  const film = $('#massages'), stage = $('#film-stage'), camEl = $('#film-cam'), dim = $('#film-dim'), canvas = $('#film-anat');
  const ASPECT = 2752 / 1536;
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = t => t * t * (3 - 2 * t);

  /* ---------- scenes: intro + one per massage ---------- */
  const scenes = [{ el: $('.scene--intro', film), cam: { x: 50, y: 52, s: 1.04, side: 'left' } }];
  S.treatments.forEach(t => {
    const box = el('div', 'scene');
    box.dataset.side = t.film.side;
    box.dataset.id = t.id;
    const dl = el('dl', 'scene__prices');
    dl.setAttribute('data-todo', '');
    Object.keys(t.prices).forEach(m => { const d = el('div'); d.append(el('dt', '', m + ' min'), el('dd', '', money(t.prices[m]))); dl.appendChild(d); });
    const btn = el('button', 'btn btn--ghost btn--sm', 'Choose this');
    btn.type = 'button';
    btn.addEventListener('click', () => pick(t));
    box.append(el('p', 'scene__shown', t.film.shown), el('h3', '', t.name), el('p', '', t.blurb), dl, btn);
    $('#film-scenes').appendChild(box);
    scenes.push({ el: box, cam: t.film, anat: t.film.anat });
  });
  if (reduceMotion || !canvas.getContext) return; // the plain list stays

  /* ---------- anatomy: lines in percent of the picture ---------- */
  function bez(a, c, b, n = 20) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
    return pts;
  }
  // n lines from an origin edge (o0..o1) to an insertion edge (i0..i1); bow shifts the middle of every line
  function fan(o0, o1, i0, i1, n, bow) {
    const out = [];
    for (let k = 0; k < n; k++) {
      const u = n === 1 ? .5 : k / (n - 1);
      const a = [lerp(o0[0], o1[0], u), lerp(o0[1], o1[1], u)], b = [lerp(i0[0], i1[0], u), lerp(i0[1], i1[1], u)];
      out.push(bez(a, [(a[0] + b[0]) / 2 + bow[0], (a[1] + b[1]) / 2 + bow[1]], b));
    }
    return out;
  }
  const mirror = lines => lines.map(l => l.map(p => [100 - p[0], p[1]]));
  const both = lines => lines.concat(mirror(lines));

  const erector = [];
  [1.0, 1.9, 2.8, 3.7].forEach(off => erector.push(bez([50 + off * .9, 45.3], [50 + off + .7, 36.5], [50 + off * .75, 27.4])));
  const lats = fan([51.3, 44.6], [51.3, 37.4], [61.4, 35.3], [62.0, 34.4], 6, [1.6, 1.5]);
  const trap = fan([50.5, 26.9], [50.5, 39.4], [63.0, 29.1], [55.8, 30.9], 10, [.4, -.5]);
  // upper trapezius: down along the neck first, then out along the shoulder (so it never leaves the body)
  const upperTrap = [];
  for (let k = 0; k < 7; k++) {
    const u = k / 6, a = [lerp(50.7, 53.4, u), lerp(22.9, 23.2, u)], b = [lerp(53.2, 62.6, u), lerp(26.9, 28.9, u)];
    upperTrap.push(bez(a, [a[0] + .3, lerp(a[1], b[1], .92)], b));
  }
  const cervical = [.7, 1.6].map(o => bez([50 + o, 22.9], [50 + o + .15, 25], [50 + o, 27.1]));
  // calf: cx = middle of the calf at its widest, top = how far the knee end sits off that middle, heel = middle of the heel
  function calf(cx, top, heel) {
    const belly = [], tendon = [];
    [-1, -.6, -.2, .2, .6, 1].forEach(u => belly.push(bez([cx + top + u * 2.9, 70.8], [cx + u * 4.5, 74.6], [cx + u * .55, 79.2])));
    [-1, -.33, .33, 1].forEach(u => tendon.push(bez([cx + u * .55, 79.2], [cx + u * .5, 83.5], [heel + u * .42, 87.3])));
    return { belly, tendon };
  }
  const calfL = calf(41.8, .8, 41.5), calfR = calf(57.8, -.8, 58.3);

  // label: at = anchor on the picture, to = offset of the text in screen px (wide screens / phones)
  const ANAT = {
    back: [
      { kind: 'muscle', lines: both(erector), label: { text: 'Long back muscles', at: [53.7, 40], to: [150, 46], toPhone: [40, 86] } },
      { kind: 'muscle', lines: both(lats), label: { text: 'Lats', at: [59.6, 37], to: [150, -30], toPhone: [26, -96] } }
    ],
    blade: [
      { kind: 'muscle', lines: both(trap), label: { text: 'Trapezius', at: [53, 36.4], to: [-150, 70], toPhone: [-70, 96] } },
      { kind: 'knot', at: [55.5, 31.9], label: { text: 'Knot', at: [55.5, 31.9], to: [-170, -70], toPhone: [-90, -96] } }
    ],
    calves: [
      { kind: 'muscle', lines: calfL.belly.concat(calfR.belly), label: { text: 'Calf muscle', at: [61, 74.6], to: [120, -40], toPhone: [20, -92] } },
      { kind: 'tendon', lines: calfL.tendon.concat(calfR.tendon), label: { text: 'Achilles tendon', at: [58.4, 84], to: [130, 30], toPhone: [-58, 44] } }
    ],
    neck: [
      { kind: 'muscle', lines: both(upperTrap), label: { text: 'Upper trapezius', at: [42.4, 27.4], to: [-150, 60], toPhone: [-20, 84] } },
      { kind: 'muscle', lines: both(cervical), label: { text: 'Neck muscles', at: [48.4, 24.6], to: [-170, -50], toPhone: [-96, -80] } }
    ]
  };

  /* ---------- timeline ---------- */
  film.classList.add('film--live');
  const N = scenes.length;
  const KP = scenes.map((_, i) => (i === 0 ? 0 : .22 + (i - 1) * (.72 / (N - 2)))); // 0, .22, .46, .70, .94
  const HOLD = .07;
  film.dataset.kp = KP.join(',');

  let W = 0, H = 0, dpr = 1, phone = false, target = 0, shown = -1, raf = 0, live = false;
  const ctx = canvas.getContext('2d');

  function measure() {
    if (window.innerHeight > 1100) film.style.setProperty('--film-h', '1100px'); else film.style.removeProperty('--film-h');
    W = stage.clientWidth; H = stage.clientHeight;
    phone = W <= 880;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    shown = -1;
  }
  // where a scene wants its focus point on the screen
  function anchor(i) {
    if (phone) return [.5, i === 0 ? .4 : .31];
    return [scenes[i].cam.side === 'left' ? .66 : .34, .5];
  }
  function key(i) {
    const base = scenes[i].cam, a = anchor(i);
    const c = phone && base.phone ? Object.assign({}, base, base.phone) : base; // a scene may look elsewhere on phones
    const fit = phone ? Math.min(1, W / (H * .5)) : 1; // narrow screens: pull back a little so both sides fit
    return { x: c.x, y: c.y, s: c.s * (i === 0 ? 1 : fit), ax: a[0], ay: a[1] };
  }
  function cameraAt(p) {
    let i = 0;
    while (i < N - 2 && p >= KP[i + 1]) i++;
    const A = key(i), B = key(i + 1);
    const from = KP[i] + (i === 0 ? .04 : HOLD), to = KP[i + 1] - HOLD;
    if (p <= from) return push(A, i, p);
    if (p >= to) return push(B, i + 1, p);
    const e = smooth((p - from) / (to - from));
    const dist = Math.hypot(B.x - A.x, (B.y - A.y) * ASPECT);
    const arc = 1 - Math.min(.5, dist * .012) * Math.sin(Math.PI * e); // pull back while travelling far
    return {
      x: lerp(A.x, B.x, e), y: lerp(A.y, B.y, e),
      s: Math.exp(lerp(Math.log(A.s * 1.0), Math.log(B.s * .97), e)) * arc,
      ax: lerp(A.ax, B.ax, e), ay: lerp(A.ay, B.ay, e)
    };
  }
  // while a scene holds, the camera keeps creeping in a little
  function push(K, i, p) {
    const local = clamp01((p - (KP[i] - HOLD)) / (2 * HOLD));
    return { x: K.x, y: K.y, s: K.s * (.97 + .06 * local), ax: K.ax, ay: K.ay };
  }

  function draw(p, time) {
    const c = cameraAt(p);
    const imgH = H, imgW = H / ASPECT;
    const tx = c.ax * W - (c.x / 100) * imgW * c.s, ty = c.ay * H - (c.y / 100) * imgH * c.s;
    camEl.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + c.s.toFixed(4) + ')';
    const sx = x => tx + (x / 100) * imgW * c.s, sy = y => ty + (y / 100) * imgH * c.s;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    let veil = 0;

    scenes.forEach((sc, i) => {
      const away = Math.abs(p - KP[i]) - (i === 0 ? .04 : HOLD);
      const o = clamp01(1 - away / .035);
      const lift = (1 - o) * (p < KP[i] ? 28 : -28);
      sc.el.style.opacity = o.toFixed(3);
      sc.el.style.transform = 'translateY(' + (phone ? lift.toFixed(1) + 'px' : 'calc(-50% + ' + lift.toFixed(1) + 'px)') + ')';
      sc.el.style.pointerEvents = o > .6 ? 'auto' : 'none';
      sc.el.style.visibility = o > 0 ? 'visible' : 'hidden';
      if (!sc.anat) return;

      const a = clamp01(1 - (away - .02) / .045);           // how visible the anatomy is
      if (a <= 0) return;
      const d = clamp01((p - (KP[i] - HOLD - .06)) / .1);   // how far it is drawn
      veil = Math.max(veil, a * .34);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      ANAT[sc.anat].forEach(g => {
        if (g.kind === 'knot') {
          const heal = clamp01((p - (KP[i] - HOLD * .4)) / (HOLD * 1.2)); // the knot melts while the scene holds
          const x = sx(g.at[0]), y = sy(g.at[1]), r = (26 + 5 * Math.sin(time * 3.2)) * (1 - heal * .75);
          const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.4);
          glow.addColorStop(0, 'rgba(255,150,110,' + (.75 * a * d * (1 - heal)).toFixed(3) + ')');
          glow.addColorStop(1, 'rgba(255,150,110,0)');
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, r * 2.4, 0, 6.283); ctx.fill();
          ctx.globalCompositeOperation = 'source-over';
          if (g.label) label(g.label, a * d * (1 - heal), sx, sy);
          return;
        }
        const rgb = g.kind === 'tendon' ? '255,244,232' : '255,170,140';
        ctx.globalCompositeOperation = 'lighter';
        g.lines.forEach((ln, k) => {
          const dd = clamp01(d * 1.35 - (k / g.lines.length) * .35);
          if (dd <= 0) return;
          const upto = dd * (ln.length - 1), full = Math.floor(upto), frac = upto - full;
          ctx.beginPath();
          ctx.moveTo(sx(ln[0][0]), sy(ln[0][1]));
          for (let j = 1; j <= full; j++) ctx.lineTo(sx(ln[j][0]), sy(ln[j][1]));
          let tip = ln[full];
          if (full < ln.length - 1) { tip = [lerp(ln[full][0], ln[full + 1][0], frac), lerp(ln[full][1], ln[full + 1][1], frac)]; ctx.lineTo(sx(tip[0]), sy(tip[1])); }
          const x0 = sx(ln[0][0]), y0 = sy(ln[0][1]), end = ln[ln.length - 1];
          const fade = alpha => { // muscle fibres fade in at their origin; tendons start at full strength (they continue the muscle)
            const gr = ctx.createLinearGradient(x0, y0, sx(end[0]), sy(end[1]));
            gr.addColorStop(0, 'rgba(' + rgb + ',' + (g.kind === 'tendon' ? alpha : 0).toFixed(3) + ')');
            gr.addColorStop(.14, 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')');
            gr.addColorStop(.86, 'rgba(' + rgb + ',' + alpha.toFixed(3) + ')');
            gr.addColorStop(1, 'rgba(' + rgb + ',' + (alpha * .55).toFixed(3) + ')');
            return gr;
          };
          ctx.strokeStyle = fade(.16 * a); ctx.lineWidth = g.kind === 'tendon' ? 7 : 6; ctx.stroke();
          ctx.strokeStyle = fade(.8 * a); ctx.lineWidth = g.kind === 'tendon' ? 1.9 : 1.4; ctx.stroke();
          // a spark that keeps running along the fibre
          const run = dd < 1 ? dd : ((time * .22 + k * .137) % 1);
          const q = run * (ln.length - 1), qi = Math.min(ln.length - 2, Math.floor(q)), qf = q - qi;
          ctx.beginPath();
          ctx.arc(sx(lerp(ln[qi][0], ln[qi + 1][0], qf)), sy(lerp(ln[qi][1], ln[qi + 1][1], qf)), dd < 1 ? 3 : 2.1, 0, 6.283);
          ctx.fillStyle = 'rgba(255,248,240,' + (.9 * a).toFixed(3) + ')'; ctx.fill();
        });
        ctx.globalCompositeOperation = 'source-over';
        if (g.label) label(g.label, a * clamp01(d * 2 - 1), sx, sy);
      });
    });
    dim.style.opacity = veil.toFixed(3);
  }

  function label(l, alpha, sx, sy) {
    if (alpha <= .01) return;
    const x = sx(l.at[0]), y = sy(l.at[1]);
    const to = phone ? l.toPhone : l.to;
    let lx = x + to[0], ly = y + to[1];
    ctx.font = '600 ' + (phone ? 13 : 14) + 'px Figtree, system-ui, sans-serif';
    const w = ctx.measureText(l.text).width;
    const right = to[0] >= 0;
    lx = Math.min(W - w - 14, Math.max(14 + (right ? 0 : w), lx)); // keep the text on the screen
    ly = Math.min(H - 20, Math.max(24, ly));
    ctx.strokeStyle = 'rgba(243,236,228,' + (.6 * alpha).toFixed(3) + ')'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lx + (right ? -8 : 8), ly); ctx.stroke();
    ctx.fillStyle = 'rgba(243,236,228,' + alpha.toFixed(3) + ')';
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 6.283); ctx.fill();
    ctx.textAlign = right ? 'left' : 'right'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(30,21,16,.95)'; ctx.shadowBlur = 10;
    ctx.fillText(l.text, lx, ly);
    ctx.shadowBlur = 0;
  }

  function progress() {
    const r = film.getBoundingClientRect();
    return clamp01(-r.top / Math.max(1, r.height - H));
  }
  function frame(now) {
    raf = 0;
    target = progress();
    shown = shown < 0 ? target : shown + (target - shown) * .16; // the camera eases after the scroll
    if (Math.abs(target - shown) < .0004) shown = target;
    draw(shown, now / 1000);
    if (live) raf = requestAnimationFrame(frame);
  }
  function wake() { if (!raf) raf = requestAnimationFrame(frame); }

  measure();
  draw(progress(), 0);
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { measure(); wake(); }, 120); });
  window.addEventListener('scroll', wake, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { live = es[0].isIntersecting; if (live) wake(); }, { rootMargin: '20% 0px 20% 0px' }).observe(film);
  } else { live = true; wake(); }
})();
