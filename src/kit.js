/* Comic-making toolkit: panels, balloons, captions, sound, and generated line art. */
const DIMS = {absolutely_jacked:[1012,1800],prettiest_girl:[1012,1800],nice2:[1800,1434],nice3:[1650,1800],nice4:[1800,1588],costume:[1012,1800],gym:[1018,1800],me:[1012,1800],nice1:[1644,1800],sixflags:[1800,1012],candle:[1200,1800],museum:[1350,1800],waterfall:[1350,1800],diner:[1800,1350],masks:[1800,1350],flowers:[1350,1800],hood:[1013,1800],mirror:[1206,1769],facetime:[885,1800],headphones:[1012,1800],fence:[1012,1800],burger:[1012,1800],suit:[1170,1560],picnic:[1800,1350],flex:[1013,1800],buckethat:[1350,1800],lift:[1003,1800],braids:[1800,1350],bluechair:[1012,1800],us:[1206,1539],capper:[1350,1800],hero:[1800,1350]};
const SIZE = {L:[1700,960],P:[900,1500]};
let MODE = 'L';
const R = (l, p) => (MODE === 'L' ? l : p);
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
function place(e, x, y, w, h) {
  e.style.left = x + 'px'; e.style.top = y + 'px';
  if (w != null) e.style.width = w + 'px';
  if (h != null) e.style.height = h + 'px';
  return e;
}
const svgNS = 'http://www.w3.org/2000/svg';
function svg(parent, cls, w, h, inner) {
  const s = document.createElementNS(svgNS, 'svg');
  if (cls) s.setAttribute('class', cls);
  s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  s.innerHTML = inner || '';
  parent.appendChild(s);
  return s;
}
function seeded(n) { let s = n; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

/* A rectangle with slanted corners, as polygon points. */
function Q(x, y, w, h, d = [0, 0, 0, 0]) {
  return [[x + d[0], y], [x + w + d[1], y], [x + w + d[2], y + h], [x + d[3], y + h]];
}

/* A comic panel: arbitrary polygon, cover-fitted art, hold to see the real photo. */
function panel(root, poly, img, opt = {}) {
  const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
  const local = poly.map(p => [p[0] - x, p[1] - y]);
  const P = place(el('div', 'panel', root), x, y, w, h);
  const clip = el('div', 'clip', P);
  clip.style.clipPath = 'polygon(' + local.map(p => `${p[0]}px ${p[1]}px`).join(',') + ')';
  P.geo = {x, y, w, h};
  if (img) {
    const [iw, ih] = DIMS[img];
    const zoom = opt.zoom || 1, f = opt.focus || [.5, .5];
    const s = Math.max(w / iw, h / ih) * zoom, dw = iw * s, dh = ih * s;
    const ox = Math.min(0, Math.max(w - dw, w / 2 - f[0] * dw)), oy = Math.min(0, Math.max(h - dh, h / 2 - f[1] * dh));
    P.map = (fx, fy) => [x + ox + fx * dw, y + oy + fy * dh];
    for (const [dir, c] of [['img', 'im'], ['real', 'im rl']]) {
      if (dir === 'real' && opt.real === false) continue;
      const d = el('div', c, clip);
      d.style.backgroundImage = `url(assets/${dir}/${img}.webp)`;
      d.style.backgroundSize = `${dw}px ${dh}px`;
      d.style.backgroundPosition = `${ox}px ${oy}px`;
      if (dir === 'img') P.art = d;
    }
    if (opt.real !== false) {
      P.dataset.real = 1;
      let t;
      P.addEventListener('pointerdown', () => { t = setTimeout(() => P.classList.add('showreal'), 170); });
      const off = () => { clearTimeout(t); P.classList.remove('showreal'); };
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(n => P.addEventListener(n, off));
      P.addEventListener('contextmenu', e => e.preventDefault());
    }
  }
  svg(P, 'frame', w, h, `<polygon points="${local.map(p => p.join(',')).join(' ')}"/>`).setAttribute('style', `width:${w}px;height:${h}px`);
  P.clip = clip;
  return P;
}

/* Hand-feeling word balloon: a soft superellipse with a curved tail merged into the outline. */
function balloon(root, x, y, w, h, text, tail, opt = {}) {
  const B = place(el('div', 'balloon', root), x, y, w, h);
  const cx = w / 2, cy = h / 2, n = 2.5, pts = [];
  const rnd = seeded(Math.floor(x * 7 + y * 13 + w) + 11);
  const steps = 72;
  const ang = tail ? Math.atan2((tail[1] - y - cy) / h, (tail[0] - x - cx) / w) : 99;
  let d = '';
  const at = a => {
    const c = Math.cos(a), s = Math.sin(a);
    return [cx + Math.sign(c) * Math.abs(c) ** (2 / n) * w / 2, cy + Math.sign(s) * Math.abs(s) ** (2 / n) * h / 2];
  };
  const spread = opt.spread || .17;
  for (let i = 0; i <= steps; i++) {
    const a = -Math.PI + (i / steps) * Math.PI * 2;
    let da = a - ang; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (tail && Math.abs(da) < spread) continue;
    const j = (rnd() - .5) * 1.1;
    pts.push({a, p: at(a).map(v => v + j)});
  }
  if (tail) {
    // Rotate list so the gap sits at the end, then bridge it with the tail.
    let gap = 0;
    for (let i = 1; i < pts.length; i++) if (pts[i].a - pts[i - 1].a > .2) gap = i;
    const ordered = pts.slice(gap).concat(pts.slice(0, gap));
    d = 'M' + ordered.map(o => o.p.map(v => v.toFixed(1)).join(' ')).join('L');
    const a0 = ordered[ordered.length - 1].p, a1 = ordered[0].p;
    const tx = tail[0] - x, ty = tail[1] - y;
    const mx = (a0[0] + a1[0]) / 2, my = (a0[1] + a1[1]) / 2;
    const bend = (tx - mx) * .18;
    d += `Q${(a0[0] + tx) / 2 + bend} ${(a0[1] + ty) / 2} ${tx} ${ty}Q${(a1[0] + tx) / 2 + bend} ${(a1[1] + ty) / 2} ${a1[0]} ${a1[1]}Z`;
  } else {
    d = 'M' + pts.map(o => o.p.map(v => v.toFixed(1)).join(' ')).join('L') + 'Z';
  }
  svg(B, '', w, h, `<path d="${d}"/>`).setAttribute('style', `width:${w}px;height:${h}px`);
  const t = el('div', 't', B, `<span>${text}</span>`);
  if (opt.size) t.style.fontSize = opt.size + 'px';
  return B;
}

function cap(root, x, y, w, html, kind = '') { return place(el('div', 'cap ' + kind, root, html), x, y, w); }
function note(root, x, y, html, opt = {}) {
  const n = place(el('div', 'note' + (opt.black ? ' onblack' : '') + (opt.sticky ? ' sticky' : ''), root, html), x, y, opt.w);
  n.style.transform = `rotate(${opt.rot ?? -4}deg)`;
  if (opt.size) n.style.fontSize = opt.size + 'px';
  return n;
}
function sfxText(root, x, y, text, size, rot = -6, color) {
  const s = place(el('div', 'sfx', root, text), x, y);
  s.style.fontSize = size + 'px'; s.style.transform = `rotate(${rot}deg)`;
  s.style.webkitTextStrokeWidth = Math.max(5, size * .07) + 'px';
  if (color) s.style.color = color;
  return s;
}
function halftone(root, x, y, w, h, color, cell = 14, mask) {
  const d = place(el('div', 'halftone', root), x, y, w, h);
  d.style.color = color; d.style.backgroundSize = `${cell}px ${cell}px`; d.style.inset = 'auto';
  if (mask) { d.style.webkitMaskImage = mask; d.style.maskImage = mask; }
  return d;
}
/* Radial action lines, the signature comic energy burst. */
function burst(root, W, H, cx, cy, opts = {}) {
  const {n = 70, color = '#fff', seed = 3, inner = .05, opacity = 1} = opts;
  const rnd = seeded(seed), r = Math.hypot(W, H);
  let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rnd() * .03, s = (.012 + rnd() * .022);
    const r0 = r * (inner + rnd() * .1);
    d += `M${cx + Math.cos(a) * r0} ${cy + Math.sin(a) * r0}L${cx + Math.cos(a - s) * r} ${cy + Math.sin(a - s) * r}L${cx + Math.cos(a + s) * r} ${cy + Math.sin(a + s) * r}Z`;
  }
  const S = svg(root, 'fill', W, H, `<path d="${d}" fill="${color}" opacity="${opacity}"/>`);
  S.setAttribute('preserveAspectRatio', 'none');
  S.style.width = W + 'px'; S.style.height = H + 'px';
  return S;
}
/* Cosmic crackle: clustered blobs of black energy with bright halos. */
function krackle(root, W, H, opts = {}) {
  const {n = 26, seed = 5, color = '#0a0810', glow = 'rgba(255,255,255,.0)'} = opts;
  const rnd = seeded(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const X = rnd() * W, Y = rnd() * H, big = 18 + rnd() * 70, m = 5 + Math.floor(rnd() * 8);
    for (let j = 0; j < m; j++) {
      const a = rnd() * 6.28, dist = rnd() * big * 1.5, r = big * (.2 + rnd() * .6);
      s += `<circle cx="${X + Math.cos(a) * dist}" cy="${Y + Math.sin(a) * dist}" r="${r}"/>`;
    }
  }
  const S = svg(root, 'fill', W, H, `<g fill="${color}" stroke="${glow}">${s}</g>`);
  S.style.width = W + 'px'; S.style.height = H + 'px';
  return S;
}
function starburst(root, x, y, size, html, fill = '#d4122a') {
  const b = place(el('div', 'starburst', root, `<span>${html}</span>`), x, y, size, size);
  const n = 15; let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, r = i % 2 ? 37 : 50;
    d += (i ? 'L' : 'M') + (50 + Math.cos(a) * r) + ' ' + (50 + Math.sin(a) * r);
  }
  const S = svg(b, '', 100, 100, `<path d="${d}Z" fill="${fill}" stroke="#14101a" stroke-width="1.4"/>`);
  b.prepend(S);
  return b;
}
/* A red-pencil stroke with a hand wobble, drawn on with a stroke-dash animation. */
function pencil(root, W, H, segs, width = 11) {
  const rnd = seeded(Math.floor(segs[0][0] + segs[0][1]) + 7);
  let d = `M${segs[0][0]} ${segs[0][1]}`;
  for (let i = 1; i < segs.length; i++) {
    const [a, b] = [segs[i - 1], segs[i]];
    const mx = (a[0] + b[0]) / 2 + (rnd() - .5) * 42, my = (a[1] + b[1]) / 2 + (rnd() - .5) * 42;
    d += `Q${mx} ${my} ${b[0]} ${b[1]}`;
  }
  const S = svg(root, 'strike', W, H, `<path d="${d}" stroke-width="${width}"/>`);
  const p = S.querySelector('path'), len = p.getTotalLength();
  p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
  S.draw = p;
  return S;
}

/* The villain always talks the same way, so you always know it's him. */
function villain(root, x, y, w, html) {
  return place(el('div', 'cap vill', root, `<i>THE ERASER:</i> ${html}`), x, y, w);
}
/* The running scoreboard: which of the five memories this page is. */
function memoryBadge(root, n, title, x, y, w) {
  const b = place(el('div', 'mem', root, `<div class="mem-n">MEMORY ${n} OF 6</div><div class="mem-t">${title}</div><div class="pips">${[1, 2, 3, 4, 5, 6].map(i => `<s class="${i < n ? 'on' : ''}"></s>`).join('')}</div>`), x, y, w);
  b.saved = () => {
    b.classList.add('won'); b.querySelector('.mem-n').textContent = `MEMORY ${n} SAVED!`;
    b.querySelectorAll('.pips s')[n - 1].classList.add('on');
    gsap.fromTo(b, {scale: 1.12}, {scale: 1, duration: .4, ease: 'back.out(3)'});
  };
  return b;
}

/* Days until Divij turns 21. The break-up ends then. */
function daysToDec2() {
  const now = new Date(), end = new Date(now.getFullYear(), 11, 2);
  return Math.max(0, Math.ceil((end - now) / 864e5));
}
/* The villain: a large, furious pink eraser. */
function eraserArt(root, x, y, size, mood = 'angry') {
  const face = {
    angry: `<path d="M126 130l72 26M314 130l-72 26" stroke="#14101a" stroke-width="15" stroke-linecap="round"/>
      <circle cx="170" cy="172" r="24" fill="#fff" stroke="#14101a" stroke-width="7"/><circle cx="270" cy="172" r="24" fill="#fff" stroke="#14101a" stroke-width="7"/>
      <circle cx="178" cy="176" r="9" fill="#14101a"/><circle cx="262" cy="176" r="9" fill="#14101a"/>
      <path d="M150 240h140v34H150z" fill="#fff" stroke="#14101a" stroke-width="7"/><path d="M178 240v34M206 240v34M234 240v34M262 240v34" stroke="#14101a" stroke-width="5"/>`,
    scared: `<path d="M130 126l54-24M310 126l-54-24" stroke="#14101a" stroke-width="13" stroke-linecap="round"/>
      <circle cx="170" cy="172" r="34" fill="#fff" stroke="#14101a" stroke-width="7"/><circle cx="270" cy="172" r="34" fill="#fff" stroke="#14101a" stroke-width="7"/>
      <circle cx="170" cy="172" r="6" fill="#14101a"/><circle cx="270" cy="172" r="6" fill="#14101a"/>
      <ellipse cx="220" cy="262" rx="42" ry="30" fill="#14101a"/>
      <path d="M340 90q16 26 0 40q-16-14 0-40z" fill="#7cc8ff" stroke="#14101a" stroke-width="4"/>`,
    dead: `<path d="M150 150l44 44M194 150l-44 44M246 150l44 44M290 150l-44 44" stroke="#14101a" stroke-width="12" stroke-linecap="round"/>
      <path d="M170 262q50-34 100 0" fill="none" stroke="#14101a" stroke-width="11" stroke-linecap="round"/>`,
  }[mood];
  const s = svg(root, 'abs eraser', 440, 500, `<g stroke="#14101a" stroke-width="8" stroke-linejoin="round">
    <path d="M58 72l44-50h300l-44 50z" fill="#ffb6c6"/><path d="M358 72l44-50v330l-44 56z" fill="#c74c6e"/>
    <path d="M58 72h300v336H58z" fill="#ff8aa6"/>
    <path d="M58 300h300v108H58z" fill="#2158c8"/><path d="M358 300l44-46v98l-44 56z" fill="#143f9e"/>
    <path d="M58 300h300" /></g>
    <text x="208" y="376" text-anchor="middle" font-family="Anton" font-size="54" letter-spacing="4" fill="#fff">ERASER</text>
    <path d="M58 72h300v36H58z" fill="#fff" opacity=".22"/>
    <g transform="translate(-12 -8)">${face}</g>
    <g class="limbs" stroke="#14101a" stroke-width="13" stroke-linecap="round" fill="none"><path d="M58 220q-40-10-48-54M402 220q30 6 34-44"/><path d="M140 408v62h-30M280 408v62h30"/></g>`);
  s.style.width = size + 'px'; s.style.height = size * 500 / 440 + 'px'; s.style.left = x + 'px'; s.style.top = y + 'px'; s.style.overflow = 'visible'; s.style.zIndex = 8;
  return s;
}
/* Case 1: a diagram of exactly where she parked. */
function roadScene(P) {
  const {w, h} = P.geo;
  const car = (x, y, c, flip) => `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)"><rect x="-62" y="-30" width="124" height="60" rx="16" fill="${c}" stroke="#14101a" stroke-width="6"/><rect x="-18" y="-22" width="46" height="44" rx="8" fill="#bfe6ff" stroke="#14101a" stroke-width="5"/><rect x="52" y="-22" width="12" height="12" fill="#fff36b" stroke="#14101a" stroke-width="3"/><rect x="52" y="10" width="12" height="12" fill="#fff36b" stroke="#14101a" stroke-width="3"/></g>`;
  const s = svg(P.clip, 'fill', 600, 480, `
    <rect width="600" height="480" fill="#5a9a4a"/>
    <rect y="100" width="600" height="280" fill="#3a3a44" stroke="#14101a" stroke-width="6"/>
    <rect y="100" width="600" height="46" fill="#7a7a84"/><rect y="334" width="600" height="46" fill="#7a7a84"/>
    <path d="M0 240h600" stroke="#ffd21f" stroke-width="10" stroke-dasharray="46 30"/>
    <path d="M140 190h-70m24-22l-24 22 24 22" fill="none" stroke="#fff" stroke-width="8"/><path d="M460 290h70m-24-22l24 22-24 22" fill="none" stroke="#fff" stroke-width="8"/>
    ${car(390, 124, '#d4122a', false)}
    ${car(530, 192, '#ffc81f', true)}
    <text x="565" y="74" text-anchor="end" font-family="Anton" font-size="36" fill="#fff" stroke="#14101a" stroke-width="7" paint-order="stroke">YOU, FACING TRAFFIC</text>
    <text x="300" y="440" text-anchor="middle" font-family="Anton" font-size="38" fill="#fff" stroke="#14101a" stroke-width="7" paint-order="stroke">THE CORRECT SIDE (EMPTY)</text>
    <path d="M300 396v-18" stroke="#fff" stroke-width="8"/>`);
  s.setAttribute('preserveAspectRatio', 'xMidYMid slice'); s.style.width = w + 'px'; s.style.height = h + 'px';
  return s;
}

/* A frantic back-and-forth scribble, the editor losing it. */
function scribble(root, W, H, x0, y0, x1, y1, passes, width, seed = 3) {
  const rnd = seeded(seed); const pts = [];
  for (let i = 0; i <= passes; i++) {
    const t = i / passes, side = i % 2;
    pts.push([x0 + (x1 - x0) * (side ? .86 + rnd() * .14 : rnd() * .14), y0 + (y1 - y0) * t + (rnd() - .5) * 26]);
  }
  return pencil(root, W, H, pts, width);
}

/* ---------- sound: everything is synthesised, no audio files ---------- */
const Sound = (() => {
  let ctx, master, muted = false, noiseBuf, scrubNode, scrubGain, musicTimer, musicGain;
  function ensure() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return false;
      ctx = new C(); master = ctx.createGain(); master.gain.value = muted ? 0 : .8; master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function noise(dur, type, f0, f1, g, q = 1, delay = 0) {
    if (!ensure()) return;
    const t = ctx.currentTime + delay, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), a = ctx.createGain();
    s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.0008, t + dur);
    s.connect(fl).connect(a).connect(master); s.start(t, Math.random()); s.stop(t + dur + .02);
  }
  function tone(type, f0, f1, dur, g, delay = 0) {
    if (!ensure()) return;
    const t = ctx.currentTime + delay, o = ctx.createOscillator(), a = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    a.gain.setValueAtTime(g, t); a.gain.exponentialRampToValueAtTime(.0008, t + dur);
    o.connect(a).connect(master); o.start(t); o.stop(t + dur + .02);
  }
  const api = {
    unlock: ensure,
    flip() { noise(.34, 'bandpass', 900, 3800, .5, .7); noise(.14, 'lowpass', 500, 120, .55, 1, .3); },
    thud() { tone('sine', 120, 38, .34, .85); noise(.1, 'lowpass', 1800, 200, .4); },
    pop() { tone('sine', 300, 720, .08, .16); },
    tear() { noise(.5, 'highpass', 1800, 5200, .4, 2); },
    pencil() { noise(.42, 'bandpass', 2600, 1500, .3, 6); },
    stamp() { tone('sine', 170, 42, .24, 1); noise(.09, 'bandpass', 1300, 500, .7, 1.2); noise(.04, 'highpass', 3000, 3000, .25); },
    boom() { tone('sine', 86, 24, 1.3, 1); noise(1.1, 'lowpass', 3400, 60, .9); tone('sawtooth', 58, 30, .7, .24); },
    chomp() { noise(.09, 'lowpass', 1400, 300, .8, 2); noise(.08, 'lowpass', 900, 220, .6, 2, .1); },
    buzz() { tone('square', 118, 112, .28, .16); },
    ding() { tone('triangle', 880, 880, .28, .22); tone('sine', 1320, 1320, .36, .12, .05); },
    /* The "ahh" moment: a warm little two-note marimba chime, not a voice. */
    ahh(pitch = 150) {
      const base = pitch > 150 ? 523.25 : 440;
      [[base, 0, .26], [base * 1.5, .11, .22]].forEach(([f, delay, g]) => {
        tone('sine', f, f, .5, g, delay);
        tone('sine', f * 4, f * 4, .09, g * .22, delay);
      });
    },
    scrub(level) {
      if (!ensure()) return;
      if (!scrubNode) {
        scrubNode = ctx.createBufferSource(); scrubNode.buffer = noiseBuf; scrubNode.loop = true;
        const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = .8;
        scrubGain = ctx.createGain(); scrubGain.gain.value = 0;
        scrubNode.connect(f).connect(scrubGain).connect(master); scrubNode.start();
      }
      scrubGain.gain.setTargetAtTime(level * .28, ctx.currentTime, .025);
    },
    /* A slow, gentle piano-like progression for the quiet final pages. */
    music(on) {
      if (!ensure()) return;
      if (!on) { clearInterval(musicTimer); musicTimer = null; if (musicGain) musicGain.gain.setTargetAtTime(0, ctx.currentTime, .9); return; }
      if (musicTimer) return;
      musicGain = ctx.createGain(); musicGain.gain.value = .0001; musicGain.gain.setTargetAtTime(.5, ctx.currentTime, 1.5); musicGain.connect(master);
      const chords = [[261.6, 329.6, 392, 493.9], [220, 261.6, 329.6, 392], [174.6, 220, 261.6, 349.2], [196, 246.9, 293.7, 392]];
      let c = 0;
      const note = (f, delay, g) => {
        const t = ctx.currentTime + delay;
        [[1, g], [2, g * .24], [3, g * .07]].forEach(([h, a]) => {
          const o = ctx.createOscillator(), n = ctx.createGain(); o.frequency.value = f * h;
          n.gain.setValueAtTime(.0001, t); n.gain.exponentialRampToValueAtTime(a, t + .012); n.gain.exponentialRampToValueAtTime(.0005, t + 3.6);
          o.connect(n).connect(musicGain); o.start(t); o.stop(t + 3.7);
        });
      };
      const bar = () => {
        const ch = chords[c++ % chords.length];
        note(ch[0] / 2, 0, .16);
        [0, 1, 2, 3, 2, 1].forEach((k, i) => note(ch[k], i * .56 + .02, .075 + (i === 3 ? .025 : 0)));
      };
      bar(); musicTimer = setInterval(bar, 3360);
    },
    toggle() { muted = !muted; if (ctx) master.gain.setTargetAtTime(muted ? 0 : .8, ctx.currentTime, .02); return muted; },
    get muted() { return muted; },
  };
  return api;
})();

/* ---------- generated line art ---------- */
function coffeeScene(root, W, H) {
  const s = svg(root, 'fill', 1000, 850, `
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a1f2e"/><stop offset="1" stop-color="#7a3a26"/></linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc768"/><stop offset=".55" stop-color="#f38a3d"/><stop offset="1" stop-color="#b8432e"/></linearGradient>
    <linearGradient id="table" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b2f1c"/><stop offset="1" stop-color="#2a1016"/></linearGradient>
    <pattern id="ht" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="6.5" cy="6.5" r="3.5" fill="#14101a"/></pattern>
    <pattern id="ht2" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="5" cy="5" r="2.1" fill="#14101a"/></pattern>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <mask id="m1"><rect width="1000" height="850" fill="url(#fade)"/></mask>
  </defs>
  <rect width="1000" height="850" fill="url(#wall)"/>
  <rect width="1000" height="560" fill="url(#ht)" mask="url(#m1)" opacity=".45"/>
  <!-- window -->
  <g stroke="#14101a" stroke-width="7">
    <path d="M90 470V170q0-112 410-112t410 112v300z" fill="url(#glass)"/>
    <path d="M500 60v410M90 270h820" stroke-width="9"/>
  </g>
  <g fill="#2a1420" opacity=".78">
    <path d="M96 470v-90l60-20 28 34 42-92 72 88 40-38 54 118zM590 470v-150l66-30v-46l58 30v50l52-20 50 50 88-30v146z"/>
  </g>
  <path d="M130 170 Q300 90 460 80 L340 460 H150Z" fill="#fff" opacity=".13"/>
  <!-- lettering on the glass -->
  <path id="arc" d="M150 240 Q500 74 850 240" fill="none"/>
  <text font-family="Anton" font-size="66" letter-spacing="3" fill="#fff4d6" stroke="#14101a" stroke-width="6" paint-order="stroke"><textPath href="#arc" startOffset="50%" text-anchor="middle">MICHELANGELO'S</textPath></text>
  <text x="500" y="256" text-anchor="middle" font-family="Barlow" font-weight="700" font-style="italic" font-size="38" letter-spacing="9" fill="#14101a">COFFEE SHOP</text>
  <!-- pendant lamps -->
  
  <!-- table -->
  <path d="M-10 610 Q500 545 1010 610 V860 H-10Z" fill="url(#table)" stroke="#14101a" stroke-width="8"/>
  <path d="M-10 620 Q500 557 1010 620" fill="none" stroke="#f1a65a" stroke-width="5" opacity=".7"/>
  <rect y="640" width="1000" height="210" fill="url(#ht2)" opacity=".42"/>
  <!-- cups -->
  ${[[318, 1], [682, -1]].map(([x, f]) => `<g transform="translate(${x} 0) scale(${f} 1)">
    <ellipse cx="0" cy="694" rx="172" ry="38" fill="#f6efe0" stroke="#14101a" stroke-width="7"/>
    <ellipse cx="0" cy="692" rx="114" ry="20" fill="#d9cfbb"/>
    <path d="M-104 512 C-104 660 -74 690 0 690 S104 660 104 512Z" fill="#fbf6ea" stroke="#14101a" stroke-width="8"/>
    <path d="M40 684 C86 660 104 590 104 512 H60 C60 590 62 650 40 684Z" fill="#14101a" opacity=".2"/>
    <path d="M100 548 c78 -22 92 86 -22 94" fill="none" stroke="#14101a" stroke-width="24"/>
    <path d="M100 548 c78 -22 92 86 -22 94" fill="none" stroke="#fbf6ea" stroke-width="10"/>
    <ellipse cx="0" cy="512" rx="104" ry="26" fill="#fbf6ea" stroke="#14101a" stroke-width="8"/>
    <ellipse cx="0" cy="514" rx="86" ry="17" fill="#3d1c10"/>
    <path d="M-48 512 q24 -9 48 0 q24 9 48 0" fill="none" stroke="#c98a4e" stroke-width="5"/>
  </g>`).join('')}
  <!-- steam meets in a heart -->
  <g fill="none" stroke="#fff" stroke-linecap="round" stroke-width="10" class="steam">
    <path d="M318 480 C280 440 356 410 330 370 C312 340 372 330 420 348"/>
    <path d="M682 480 C720 440 644 410 670 370 C688 340 628 330 580 348"/>
  </g>
  <path d="M500 410 C440 366 430 318 466 304 C484 297 496 308 500 322 C504 308 516 297 534 304 C570 318 560 366 500 410Z" fill="#e8123a" stroke="#14101a" stroke-width="7"/>`);
  s.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  s.style.width = W + 'px'; s.style.height = H + 'px';
  return s;
}

function burgerArt(root, size) {
  const s = svg(root, '', 500, 430, `
  <defs>
    <mask id="bites"><rect width="500" height="430" fill="#fff"/><g id="biteG" fill="#000"></g></mask>
    <pattern id="ht3" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="5.5" cy="5.5" r="2.7" fill="#14101a"/></pattern>
    <linearGradient id="bun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b64a"/><stop offset="1" stop-color="#d67f22"/></linearGradient>
    <clipPath id="shadeTop"><path d="M250 150 C400 150 454 110 438 120 C460 180 470 170 462 190 H38 C30 60 130 18 250 18z"/></clipPath>
  </defs>
  <g mask="url(#bites)" stroke="#14101a" stroke-width="7" stroke-linejoin="round">
    <path d="M44 340 H456 C462 396 420 412 380 412 H120 C80 412 38 396 44 340Z" fill="#e39a33"/>
    <path d="M22 312 Q250 278 478 312 Q470 352 250 352 Q30 352 22 312Z" fill="#5b2a18"/>
    <path d="M30 262 Q70 322 120 282 Q164 342 214 286 Q264 346 308 284 Q356 338 400 282 Q440 318 472 262 Z" fill="#ffd21f"/>
    <path d="M24 226 Q250 196 476 226 Q478 280 250 280 Q22 280 24 226Z" fill="#7c3a1d"/>
    <path d="M24 226 Q250 196 476 226 Q478 246 250 246 Q22 246 24 226Z" fill="#a24f26" stroke-width="0"/>
    <path d="M14 196 Q60 238 110 202 Q160 244 214 204 Q270 246 322 204 Q378 244 420 200 Q456 230 488 192 Q470 176 250 172 Q30 176 14 196Z" fill="#6dbb3a"/>
    <path d="M36 182 C30 62 130 16 250 16 S470 62 464 182 Q250 210 36 182Z" fill="url(#bun)"/>
    <path d="M300 22 C410 34 470 90 464 182 Q410 192 350 196 C410 130 370 60 300 22Z" fill="url(#ht3)" stroke-width="0" opacity=".42"/>
    <g fill="#fff4cf" stroke-width="3">
      <ellipse cx="170" cy="70" rx="16" ry="8" transform="rotate(-20 170 70)"/><ellipse cx="250" cy="52" rx="16" ry="8"/><ellipse cx="330" cy="76" rx="16" ry="8" transform="rotate(22 330 76)"/>
      <ellipse cx="120" cy="120" rx="16" ry="8" transform="rotate(-30 120 120)"/><ellipse cx="212" cy="112" rx="16" ry="8" transform="rotate(8 212 112)"/><ellipse cx="294" cy="128" rx="16" ry="8" transform="rotate(-10 294 128)"/><ellipse cx="384" cy="130" rx="16" ry="8" transform="rotate(30 384 130)"/>
    </g>
  </g>`);
  s.style.width = size + 'px'; s.style.height = size * .86 + 'px'; s.style.overflow = 'visible';
  s.bite = (cx, cy, r) => {
    const g = s.querySelector('#biteG');
    for (let i = -1; i <= 1; i++) {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', cx + i * r * .85); c.setAttribute('cy', cy + Math.abs(i) * r * .12); c.setAttribute('r', r * .72);
      g.appendChild(c);
    }
  };
  return s;
}

/* ---------- animation shorthands ---------- */
function show(tl, e, kind = 'pop', at = '+=0.3', snd) {
  const K = {
    pop: {opacity: 0, scale: .55, duration: .36, ease: 'back.out(2.4)'},
    slam: {opacity: 0, scale: 1.7, rotation: '+=7', duration: .26, ease: 'power4.in'},
    panel: {opacity: 0, y: 26, scale: 1.035, duration: .55, ease: 'power3.out'},
    rise: {opacity: 0, y: 34, duration: .5, ease: 'power3.out'},
    fade: {opacity: 0, duration: .55, ease: 'none'},
    drop: {opacity: 0, y: -60, duration: .45, ease: 'bounce.out'},
    wipe: {clipPath: 'inset(0 100% -40% 0)', duration: .5, ease: 'power1.inOut'},
  }[kind];
  tl.from(e, kind === 'wipe' ? {...K, clearProps: 'clipPath'} : K, at);
  if (snd) tl.call(() => Sound[snd](), null, kind === 'slam' ? '>-0.02' : '<');
  return tl;
}
function shake(target, amt = 12, dur = .42) {
  if (REDUCED) return;
  gsap.fromTo(target, {x: 0, y: 0}, {duration: dur, ease: 'none', keyframes: Array.from({length: 7}, (_, i) => ({x: (i % 2 ? -1 : 1) * amt * (1 - i / 7) * (.6 + Math.random() * .4), y: (Math.random() - .5) * amt * (1 - i / 7)})).concat({x: 0, y: 0})});
}
function drawPencil(tl, S, at = '+=0.15', dur = .4) {
  tl.to(S.draw, {strokeDashoffset: 0, duration: dur, ease: 'power1.inOut', onStart: () => Sound.pencil()}, at);
  return tl;
}
