/* THE NEW 22 #1. The script and art, page by page.
   Each page draws itself for the current layout (L = laptop spread, P = phone page). */

/* The words on the last page, kept here so they're easy to change. */
const LETTER = [
  'Hargun. Bubs. My goon. My elderly cougar weeb.',
  'Happy 22nd birthday, you dumbass.',
  'This whole comic is a very long way of saying one thing: I love you.',
  'This is just a short story about us so far. A coffee shop, a lot of slop, and an octopus I have now told you about several times. It’s my favorite thing I’ve ever been part of.',
  'And I can’t wait to keep writing it with you, for years and years to come.',
  'I love you, Bubs.',
  '(See you December 2nd, when we get back together.)',
];
const CAFE = 'Michelangelo’s Coffee Shop';

const PAGES = [

/* ===== COVER: sealed in a collector's bag, tear it open ===== */
{id: 'cover', cls: 'cover', gated: true, build(p) {
  const {root, W, H} = p, L = MODE === 'L';
  const bg = el('div', 'fill', root);
  bg.style.background = 'radial-gradient(ellipse at 58% 42%,#ffb31f 0,#e8321f 34%,#8d0c2d 66%,#23082b 100%)';
  burst(root, W, H, R(1080, 450), R(420, 640), {color: 'rgba(255,240,190,.3)', n: 64, seed: 9});
    halftone(root, 0, 0, W, H, 'rgba(15,5,30,.7)', 15, 'linear-gradient(0deg,#000 0,transparent 42%)');

  const num = place(el('div', 'abs', root, '22'), R(790, 60), R(52, 410));
  Object.assign(num.style, {font: `400 ${R(860, 860)}px/.92 Anton`, color: '#ffd21f', WebkitTextStroke: '10px #14101a', paintOrder: 'stroke fill', transform: 'skewX(-7deg)', filter: 'drop-shadow(14px 14px 0 rgba(20,8,20,.85))'});

  const logo = el('div', 'logo', root, '<span class="foil">Hargun</span>');
  logo.style.fontSize = R(318, 262) + 'px'; place(logo, R(46, 34), R(150, 160));
  const sub = cap(root, R(56, 40), R(462, 440), R(520, 560), 'She’s 22. He’s 20. <b>Somebody call the cops.</b>', 'dark');
  sub.style.fontSize = R(38, 44) + 'px';
  const hero = el('img', 'abs', root); hero.src = 'assets/cut/hero.webp'; hero.alt = 'Hargun, hands on hips, on a mountain';
  const hh = R(930, 1090); hero.style.height = hh + 'px'; place(hero, R(930, 190), R(26, H - hh + 22)); hero.style.zIndex = 7;

  const top = el('div', 'topbar', root, `<span class="dk" style="width:${R(56, 74)}px;height:${R(56, 74)}px;font-size:${R(29, 38)}px">DK</span><span>DK COMICS</span><span style="margin-left:auto">$22.00 US &nbsp;·&nbsp; NOV 2026 &nbsp;·&nbsp; #1</span>`);
  top.style.height = R(82, 96) + 'px';
  starburst(root, R(530, 620), R(556, 1040), R(230, 262), 'THE<br>NEW<br>22!');
  const creds = cap(root, R(56, 40), R(846, 1400), R(640, 560), 'Written &amp; loved by <b>Divij Kohli</b>', 'white');
  creds.style.fontSize = R(27, 33) + 'px';
  const bc = el('div', 'barcode', root, '<i></i>RATED C FOR CHUD'); place(bc, R(1440, 660), R(820, 1350), R(226, 214));

  /* the bag */
  const bag = el('div', 'bag', root, '<div class="sheen"></div>');
  const lbl = el('div', 'label', bag, '<b>1 OF 1</b>Collector’s edition.<br>For Hargun only.');
  place(lbl, R(60, 26), R(590, 1130), R(320, 300));
  const tz = el('div', 'tearzone', root, '<div class="fillr"></div><div class="dash"></div>'); tz.style.top = '0'; tz.style.height = R(82, 96) + 'px';
  const hint = el('div', 'tearhint pulse', root, 'Drag across to tear it open →'); place(hint, R(46, 90), R(92, 104));
  hint.style.transformOrigin = '0 50%';

  p.tl.from([logo, sub], {opacity: 0, x: -40, duration: .7, ease: 'power3.out', stagger: .1}, .1)
    .from(hero, {y: 80, opacity: 0, duration: .8, ease: 'power3.out'}, .1);

  root.addEventListener('pointermove', e => {
    const r = root.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    logo.style.setProperty('--fx', fx * 100 + '%');
    bag.style.setProperty('--sx', fx * 100 + '%'); bag.style.setProperty('--sy', fy * 100 + '%');
    if (!REDUCED) {
      gsap.to(hero, {x: (fx - .5) * -22, duration: .6, overwrite: 'auto'});
      gsap.to(num, {x: (fx - .5) * 16, y: (fy - .5) * 10, duration: .8, overwrite: 'auto'});
    }
  });
  gsap.to(logo, {'--fx': '100%', duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'});

  let startX = null, far = 0, torn = false;
  const fill = tz.querySelector('.fillr');
  const tear = () => {
    if (torn) return; torn = true; hint.remove(); Sound.unlock(); Sound.tear();
    gsap.timeline({onComplete() { bag.remove(); tz.remove(); p.unlock(); }})
      .to(tz, {y: -220, rotation: -3, duration: .35, ease: 'power2.in'}, 0)
      .to(bag, {y: H * 1.05, rotation: 3, duration: .7, ease: 'power3.in'}, .08)
      .call(() => Sound.thud(), null, .7);
    shake(root.parentElement, 7, .3);
  };
  tz.addEventListener('pointerdown', e => { startX = e.clientX; tz.setPointerCapture(e.pointerId); Sound.unlock(); });
  tz.addEventListener('pointermove', e => {
    if (startX == null || torn) return;
    const r = root.getBoundingClientRect(); far = Math.max(far, Math.abs(e.clientX - startX) / r.width);
    fill.style.width = far * 100 / .55 + '%';
    Sound.scrub(.8); if (far > .5) { Sound.scrub(0); tear(); }
  });
  tz.addEventListener('pointerup', () => { Sound.scrub(0); if (far < .02) tear(); startX = null; });
}},

/* ===== HELLO: who is talking, and who this is about ===== */
{id: 'file', build(p) {
  const {root, tl} = p;
  const pic = panel(root, R(Q(30, 30, 610, 900, [0, 50, 0, 0]), Q(30, 30, 840, 560, [0, 0, -40, 0])), 'capper', {focus: [.46, .35]});
  const c1 = cap(root, 52, 52, R(420, 500), 'Hi Hargun. It’s <b>Divij.</b>');
  c1.style.fontSize = R(40, 50) + 'px';
  const c2 = cap(root, 52, R(770, 450), R(520, 690), 'I made you a comic for your birthday. You’re the hero. God help us all.');
  const sh = place(el('div', 'sheet', root, `
    <h3>Hero file</h3>
    <div class="row"><span>NAME</span><span>Hargun</span></div>
    <div class="row"><span>ALIASES</span><span>Bubs. My goon.</span></div>
    <div class="row"><span>AGE</span><span>22. Basically elderly.</span></div>
    <div class="row"><span>CLASS</span><span><em>COUGAR</em> &nbsp;<em>WEEB</em></span></div>
    <div class="row"><span>FOREHEAD</span><span>Visible from space.</span></div>
    <div class="row"><span>HOBBIES</span><span>Pouring hot wax on her own hands. Nobody knows why.</span></div>
    <div class="row"><span>SIDEKICK</span><span>Me. Age 20. Usually eating.</span></div>`), R(680, 40), R(40, 610), R(980, 730));
  const st = place(el('div', 'classified', root, 'TOP SECRET'), R(1290, 560), R(60, 625)); st.style.transform = 'rotate(7deg)';
  st.style.fontSize = R(66, 40) + 'px';
  const tip = cap(root, R(680, 104), R(830, 1376), R(800, 570), 'Tip: <b>press and hold</b> a panel to see the real photo.', 'dark');
  if (MODE === 'P') tip.style.fontSize = '30px';
  show(tl, pic, 'panel', .1); show(tl, c1, 'pop', '+=.05', 'pop'); show(tl, c2, 'pop', '+=.3', 'pop'); show(tl, sh, 'rise', '+=.1');
  show(tl, st, 'slam', '+=.2', 'stamp'); show(tl, tip, 'rise', '+=.3');
}},

/* ===== TODAY: the problem ===== */
{id: 'today', build(p) {
  const {root, tl, W, H} = p;
  const a = panel(root, R(Q(30, 30, 590, 900, [0, 34, -10, 0]), Q(30, 30, 430, 554, [0, 22, -12, 0])), 'bluechair', {focus: [.6, .3]});
  const b = panel(root, R(Q(632, 30, 390, 900, [22, 30, -10, -22]), Q(472, 30, 398, 554, [10, 0, 0, -22])), 'absolutely_jacked', {focus: [.46, .5]});
  const c = panel(root, R(Q(1044, 30, 626, 900, [8, 0, 0, -22]), Q(30, 600, 840, 870)), 'prettiest_girl', {focus: [.5, .42]});
  const c1 = cap(root, 50, 50, R(400, 380), 'November 3rd. Happy birthday, Bubs. <b>You’re 22.</b>');
  const c2 = cap(root, R(674, 490), R(60, 50), R(310, 360), 'Absolutely jacked.');
  const c3 = cap(root, R(1060, 310), R(46, 618), R(590, 550), 'The prettiest girl.');
  const c4 = cap(root, R(674, 50), R(700, 1252), R(620, 800), `There’s just one problem. <b>I’m 20.</b> For the next ${daysToDec2()} days you’re two whole years older than me, and it’s fucking killing you.`, 'dark'); if (MODE === 'P') c4.style.fontSize = '33px';
  const c5 = cap(root, R(1090, 110), R(830, 1396), R(420, 560), 'And somebody else had a problem with it too.', 'red');
  show(tl, a, 'panel', .1); show(tl, c1, 'pop', '-=.15', 'pop');
  show(tl, b, 'panel', '+=.3'); show(tl, c2, 'pop', '-=.15', 'pop');
  show(tl, c, 'panel', '+=.3'); show(tl, c3, 'pop', '-=.15', 'pop');
  show(tl, c4, 'pop', '+=.9', 'pop'); show(tl, c5, 'pop', '+=1.2', 'thud');
}},

/* ===== THE VILLAIN AND THE MISSION ===== */
{id: 'villain', cls: 'black', build(p) {
  const {root, tl, W, H} = p;
  const pics = ['nice4', 'flowers', 'gym', 'burger', 'masks', 'nice2', 'picnic', 'us', 'waterfall', 'nice3', 'buckethat', 'nice1'];
  const cols = R(4, 3), rows = R(3, 4), tw = W / cols, th = H / rows;
  const tiles = pics.slice(0, cols * rows).map((n, i) => panel(root, Q((i % cols) * tw + 5, Math.floor(i / cols) * th + 5, tw - 10, th - 10), n, {real: false, focus: [.5, .35]}));
  tl.from(tiles, {opacity: 0, scale: .94, stagger: .05, duration: .3}, .05);
  const bh = H / 6;
  const strokes = Array.from({length: 7}, (_, i) => {
    const b = place(el('div', 'brush', root), -60, -40 + i * bh, W + 120, bh + 90);
    b.style.transformOrigin = i % 2 ? '100% 50%' : '0 50%';
    return b;
  });
  tl.call(() => Sound.scrub(1), null, '+=.5');
  strokes.forEach((b, i) => tl.from(b, {scaleX: 0, duration: .24, ease: 'power1.in', onStart: () => Sound.pencil()}, i ? '-=.04' : '>'));
  tl.call(() => { Sound.scrub(0); Sound.thud(); }, null, '>');
  tl.set(tiles, {visibility: 'hidden'}); tl.set(root, {background: '#f7f4ea'}); tl.set(strokes, {filter: 'none'});
  const villainArt = eraserArt(root, R(1140, 500), R(70, 160), R(500, 350));
  const memo = place(el('div', 'memo', root, `
    <p class="m" style="font:400 ${R(112, 104)}px/1 Anton;margin-bottom:.18em">I AM THE ERASER.</p>
    <p class="m">A 22-year-old dating a 20-year-old? Absolutely fucking not.</p>
    <p class="m">I just erased your six best memories. Get them back, or this relationship never happened.</p>`), R(70, 40), R(50, 40), R(1040, 820));
  memo.querySelectorAll('.m').forEach(m => { m.style.position = 'relative'; });
  if (MODE === 'P') { memo.querySelectorAll('.m')[1].style.width = '440px'; memo.querySelectorAll('.m')[2].style.marginTop = '210px'; }
  const c1 = cap(root, R(70, 40), R(560, 1010), R(1000, 820), 'He means it. I’d fight him myself, but I’m busy eating. <b>You’re the hero, Bubs. It has to be you.</b>', 'dark');
  const big = place(el('div', 'logo', root, 'Save all six.'), R(70, 40), R(760, 1240)); big.style.fontSize = R(130, 130) + 'px'; big.style.color = '#d4122a'; big.style.zIndex = 9; big.style.whiteSpace = 'nowrap';
  tl.from(villainArt, {y: -900, duration: .5, ease: 'bounce.out', onComplete: () => { Sound.thud(); shake(root, 12); }}, '+=.1');
  memo.querySelectorAll('.m').forEach((m, i) => { show(tl, m, 'wipe', i ? '+=.5' : '+=.1'); tl.call(() => Sound.pencil(), null, '<'); });
  show(tl, c1, 'pop', '+=.7', 'pop'); show(tl, big, 'slam', '+=.8', 'thud');
}},

/* ===== MEMORY 1: first date ===== */
{id: 'coffee', gated: true, build(p) {
  const {root, tl} = p;
  const pan = panel(root, R(Q(30, 30, 1040, 900, [0, 40, -10, 0]), Q(30, 150, 840, 610, [0, 0, -30, 0])), null);
  const g = pan.geo;
  coffeeScene(pan.clip, g.w, g.h);
  const cv = el('canvas', 'abs', pan.clip); cv.width = g.w; cv.height = g.h; place(cv, 0, 0, g.w, g.h); cv.style.touchAction = 'none'; cv.style.cursor = 'crosshair'; cv.dataset.nav = 'no';
  const x = cv.getContext('2d');
  x.fillStyle = '#f7f4ea'; x.fillRect(0, 0, g.w, g.h);
  x.strokeStyle = 'rgba(160,150,120,.2)';
  for (let i = 0; i < 60; i++) { x.lineWidth = 1 + Math.random() * 5; x.beginPath(); const y = Math.random() * g.h; x.moveTo(0, y); x.bezierCurveTo(g.w * .3, y + 18, g.w * .6, y - 18, g.w, y + 8); x.stroke(); }
  x.save(); x.translate(g.w / 2, g.h * .42); x.rotate(-.08); x.textAlign = 'center';
  x.fillStyle = '#d3141f'; x.font = '200px Scrawl'; x.fillText('ERASED', 0, 40); x.restore();
  const badge = memoryBadge(root, 1, 'The first date', R(1100, 30), R(40, 24), R(570, 840));
  const prompt = el('div', 'prompt pulse', pan, 'Scrub to bring it back'); place(prompt, g.w / 2 - R(180, 240), g.h - R(120, 110));
  const c0 = cap(root, R(1100, 30), R(170, 780), R(570, 840), 'He started at the very beginning. <b>Scrub off the white-out with your mouse or finger.</b>', 'dark');
  const c1 = cap(root, R(1100, 30), R(170, 772), R(570, 840), `${CAFE}. Our first date. <b>Where this insane lore began.</b>`);
  const side = panel(root, R(Q(1100, 296, 570, 330, [14, 0, 0, -14]), Q(30, 900, 840, 280)), 'nice4', {focus: [.55, .38]});
  const v = villain(root, R(1100, 30), R(640, 1192), R(570, 840), 'A coffee shop? On a first date? Wow. Nobody’s ever thought of that.');
  const c2 = cap(root, R(1100, 100), R(810, 1364), R(400, 590), 'Shut the fuck up, Pinky. <b>Look how it turned out.</b>', 'white');
  if (MODE === 'P') c2.style.fontSize = '30px';
  const after = [c1, side, v, c2]; gsap.set(after, {visibility: 'hidden'});
  let drawing = false, lx, ly, moves = 0, done = false;
  const pt = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * g.w / r.width, (e.clientY - r.top) * g.h / r.height]; };
  function rub(a, b) {
    x.globalCompositeOperation = 'destination-out'; x.strokeStyle = '#000'; x.lineCap = 'round'; x.lineWidth = R(116, 130);
    x.beginPath(); x.moveTo(lx, ly); x.lineTo(a, b); x.stroke(); lx = a; ly = b;
    if (++moves % 10 === 0) {
      const d = x.getImageData(0, 0, g.w, g.h).data; let left = 0, n = 0;
      for (let i = 3; i < d.length; i += 4 * 97) { n++; if (d[i] > 40) left++; }
      if (left / n < .46) finish();
    }
  }
  function finish() {
    if (done) return; done = true; drawing = false; Sound.scrub(0); Sound.ding(); prompt.remove(); c0.remove(); badge.saved();
    const t = gsap.timeline({onComplete: p.unlock});
    t.to(cv, {opacity: 0, duration: .5});
    gsap.set(after, {visibility: 'visible'});
    show(t, c1, 'pop', '-=.2', 'pop'); show(t, v, 'pop', '+=.9', 'pop'); show(t, side, 'panel', '+=.5'); show(t, c2, 'pop', '-=.1', 'pop');
  }
  cv.addEventListener('pointerdown', e => { drawing = true; cv.setPointerCapture(e.pointerId); [lx, ly] = pt(e); Sound.unlock(); rub(lx + .1, ly); });
  cv.addEventListener('pointermove', e => { if (!drawing) return; const [a, b] = pt(e); rub(a, b); Sound.scrub(.9); clearTimeout(cv._q); cv._q = setTimeout(() => Sound.scrub(0), 90); });
  ['pointerup', 'pointercancel'].forEach(n => cv.addEventListener(n, () => { drawing = false; Sound.scrub(0); }));
  show(tl, pan, 'panel', .1); show(tl, badge, 'pop', '-=.2', 'pop'); show(tl, c0, 'pop', '+=.1', 'pop');
}},

/* ===== MEMORY 2: look, ahh ===== */
{id: 'ahh', gated: true, build(p) {
  const {root, tl} = p;
  const pan = panel(root, R(Q(600, 0, 1100, 960, [30, 0, 0, -20]), Q(0, 420, 900, 1080)), 'picnic', {focus: [.5, .5], real: false});
  const badge = memoryBadge(root, 2, 'Look. Ahh.', R(30, 24), R(24, 14), R(540, 760));
  const c1 = cap(root, R(30, 24), R(130, 104), R(540, 852), 'Our dumbest joke. When something looks <b>exactly</b> like what it is, we point at it and say so:');
  const b1 = balloon(root, R(30, 40), R(310, 232), R(260, 390), R(116, 96), '<small class="who">Me</small>Look. <b>House.</b>', null);
  const b2 = balloon(root, R(306, 470), R(310, 232), R(264, 390), R(116, 96), '<small class="who">You</small>Ahh. <b>House.</b>', null);
  const c2 = cap(root, R(30, 24), R(450, 336), R(540, 852), 'He erased that too. <b>Tap the circles in the picture</b> and say it with me.', 'dark');
  const log = el('div', 'log', root, '<b><span class="ct">0</span> of 5 found</b>'); place(log, R(30, 100), R(590, 1384), R(330, 430)); log.style.whiteSpace = 'nowrap';
  const v = villain(root, R(30, 24), R(660, 1170), R(540, 852), 'That’s not a joke. You’re just saying nouns. …That IS a big forehead, though.');
  const ans = cap(root, R(30, 24), R(850, 336), R(540, 852), 'Correct. <b>And we’re never fucking stopping.</b>', 'white');
  gsap.set([v, ans], {visibility: 'hidden'});
  const [fx, fy] = pan.map(.5, .15);
  const L_ = balloon(root, R(680, 10), R(40, 436), R(380, 310), R(120, 130), '', null);
  const A_ = balloon(root, R(1270, 580), R(40, 436), R(370, 310), R(120, 130), '', [fx + R(10, 10), fy + R(0, 10)], {spread: .12});
  gsap.set([L_, A_], {visibility: 'hidden'});
  const items = [['Pumpkin', .59, .84], ['Cinnamon roll', .43, .86], ['Flowers', .56, .57], ['Basket', .36, .70], ['Forehead', .515, .075]];
  let found = 0, pending;
  items.forEach(([name, ix, iy]) => {
    const [sx, sy] = pan.map(ix, iy);
    const s = place(el('button', 'spot', root), sx, sy); s.setAttribute('aria-label', 'Look at the ' + name);
    s.addEventListener('click', () => {
      if (s.classList.contains('done')) return;
      s.classList.add('done'); found++;
      root.querySelectorAll('.ct').forEach(c => c.textContent = found);
      if (pending) pending.kill();
      L_.querySelector('.t').innerHTML = `<span><small class="who">Me</small>Look. <b>${name}.</b></span>`;
      A_.querySelector('.t').innerHTML = `<span><small class="who">You</small>Ahh. <b>${name}.</b></span>`;
      gsap.set(A_, {visibility: 'hidden'}); gsap.set(L_, {visibility: 'visible'});
      gsap.fromTo(L_, {scale: .6, opacity: 0}, {scale: 1, opacity: 1, duration: .28, ease: 'back.out(2.5)'}); Sound.pop();
      pending = gsap.delayedCall(.65, () => {
        gsap.set(A_, {visibility: 'visible'});
        gsap.fromTo(A_, {scale: .6, opacity: 0}, {scale: 1, opacity: 1, duration: .28, ease: 'back.out(2.5)'}); Sound.ahh(found % 2 ? 165 : 130);
      });
      if (found === 4) gsap.delayedCall(1.3, () => { p.foreheadSpot.style.visibility = 'visible'; gsap.from(p.foreheadSpot, {scale: 0, duration: .4, ease: 'back.out(3)'}); Sound.ding(); });
      if (found === items.length) {
        badge.saved();
        gsap.timeline({onComplete: p.unlock, delay: 1.5})
          .call(() => { if (MODE === 'P') c2.remove(); })
          .set([v, ans], {visibility: 'visible'})
          .from(v, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()})
          .from(ans, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()}, '+=.8');
      }
    });
    if (name === 'Forehead') { s.style.visibility = 'hidden'; p.foreheadSpot = s; }
    else gsap.from(s, {scale: 0, duration: .4, delay: 2.2, ease: 'back.out(3)'});
  });
  show(tl, pan, 'panel', .05); show(tl, badge, 'pop', '-=.2', 'pop'); show(tl, c1, 'pop', '+=.1', 'pop'); show(tl, b1, 'pop', '+=.3', 'pop');
  tl.call(() => Sound.ahh(150), null, '+=.5'); show(tl, b2, 'pop', '<'); show(tl, c2, 'pop', '+=.3', 'pop'); show(tl, log, 'pop', '-=.15');
}},

/* ===== MEMORY 3: chuds ===== */
{id: 'chud', gated: true, build(p) {
  const {root, tl, W, H} = p;
  const stage = place(el('div', 'abs', root), R(640, 0), R(0, 770), R(1060, 900), R(960, 730));
  stage.style.background = 'radial-gradient(circle at 50% 48%,#ffe45c 0,#ffb31f 45%,#f2531f 100%)'; stage.style.overflow = 'hidden';
  burst(stage, R(1060, 900), R(960, 730), R(530, 450), R(480, 200), {color: 'rgba(255,255,255,.42)', n: 44, seed: 13, inner: .18});
  halftone(stage, 0, 0, R(1060, 900), R(960, 730), 'rgba(160,20,10,.65)', 15, 'radial-gradient(circle at 50% 48%,transparent 38%,#000 92%)');
  const pan = panel(root, R(Q(30, 150, 590, 780, [0, 40, -20, 0]), Q(30, 30, 410, 720)), 'burger', {focus: [.5, R(.7, .55)]});
  const badge = memoryBadge(root, 3, 'Chuds', R(30, 456), R(24, 26), R(590, 414));
  const c1 = cap(root, R(670, 456), R(26, 140), R(1000, 414), 'When one of us is eating something fat as fuck, the other one calls them a <b>chud.</b> The food is called <b>goyslop.</b> You usually call me one.');
  const c2 = cap(root, 50, R(760, 620), R(0, 0), '');
  c2.remove();
  const ex = cap(root, R(236, 456), R(800, 480), R(350, 414), 'But I present Exhibit A: <b>who’s the chud now, bitch?</b>', 'white');
  const [bx, by] = pan.map(.12, .85);
  const ring = pencil(root, W, H, [[bx - 80, by - 40], [bx + 60, by - 110], [bx + 130, by + 10], [bx + 30, by + 110], [bx - 90, by + 60], [bx - 70, by - 50]], 8);
  const bur = place(el('div', 'abs', root), R(960, 260), R(170, 790)); bur.style.zIndex = 8;
  const art = burgerArt(bur, R(440, 380));
  const m = place(el('div', 'meter', root, '<i></i><span>SNACK</span>'), R(700, 50), R(590, 1140), R(920, 800), R(66, 76));
  const hb = el('button', 'btn red hold', root, 'Hold to eat'); hb.dataset.nav = 'no';
  place(hb, R(960, 200), R(710, 1250), R(420, 500)); hb.style.textAlign = 'center';
  const stages = ['SNACK', 'SECOND HELPING', 'HEAVY BREATHING', 'LOOSENING THE BELT', 'CHUD'];
  const fillBar = m.querySelector('i'), lab = m.querySelector('span');
  const bites = [[470, 110, 70], [440, 300, 70], [340, 40, 72], [370, 220, 76], [250, 120, 80], [280, 330, 82], [130, 60, 84], [150, 240, 90], [40, 170, 110], [90, 380, 90]];
  let v = 0, held = false, nextBite = 0, done = false;
  const words = ['CHOMP!', 'NOM!', 'GULP!', 'CHOMP!', 'MMF!', 'SCARF!'];
  const finish = () => {
    done = true; held = false; hb.remove(); lab.textContent = 'FULL CHUD'; badge.saved();
    Sound.thud(); shake(root, 10);
    const s = sfxText(root, R(700, 26), R(300, 980), 'CERTIFIED CHUD!', R(130, 118), -5, '#fff');
    const you = balloon(root, R(700, 100), R(720, 1200), R(320, 370), R(130, 150), '<small class="who">You</small>Wow. What a <b>fucking chud.</b>', null);
    const me = balloon(root, R(1040, 490), R(720, 1200), R(350, 300), R(120, 124), '<small class="who">Me</small><b>Thank you.</b>', null);
    gsap.timeline({onComplete: p.unlock})
      .from(s, {scale: 3, opacity: 0, duration: .3, ease: 'power4.in'})
      .from(you, {scale: .5, opacity: 0, duration: .3, ease: 'back.out(2.5)', onStart: () => Sound.pop()}, '+=.45')
      .from(me, {scale: .5, opacity: 0, duration: .3, ease: 'back.out(2.5)', onStart: () => Sound.pop()}, '+=.7');
  };
  const tick = () => {
    if (!held || done) return;
    v = Math.min(1, v + gsap.ticker.deltaRatio() / 60 / 2.8);
    fillBar.style.width = v * 100 + '%';
    lab.textContent = stages[Math.min(stages.length - 1, Math.floor(v * stages.length))];
    if (v >= (nextBite + 1) / (bites.length + 1) && nextBite < bites.length) {
      const [a, b, r] = bites[nextBite]; art.bite(a, b, r);
      Sound.chomp(); shake(bur, 7, .18);
      if (nextBite % 2 === 0) {
        const w = sfxText(root, R(700 + Math.random() * 760, 60 + Math.random() * 480), R(170 + Math.random() * 300, 800 + Math.random() * 240), words[nextBite / 2 % words.length], R(74, 80), -12 + Math.random() * 24);
        gsap.fromTo(w, {scale: .4, opacity: 0}, {scale: 1, opacity: 1, duration: .14, ease: 'back.out(3)'});
        gsap.to(w, {opacity: 0, y: -40, duration: .4, delay: .35, onComplete: () => w.remove()});
      }
      nextBite++;
    }
    if (v >= 1) finish();
  };
  gsap.ticker.add(tick); p.cleanup = () => gsap.ticker.remove(tick);
  hb.addEventListener('pointerdown', e => { e.preventDefault(); held = true; hb.classList.add('down'); Sound.unlock(); try { hb.setPointerCapture(e.pointerId); } catch (_) {} });
  const stop = () => { held = false; hb.classList.remove('down'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => hb.addEventListener(t, stop));
  hb.addEventListener('contextmenu', e => e.preventDefault());
  hb.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); held = true; hb.classList.add('down'); } });
  hb.addEventListener('keyup', stop);
  show(tl, pan, 'panel', .1); show(tl, badge, 'pop', '-=.2', 'pop'); show(tl, c1, 'pop', '+=.1', 'pop'); show(tl, ex, 'pop', '+=.5', 'pop');
  drawPencil(tl, ring, '+=.05', .5);
  tl.from(bur, {y: -500, duration: .5, ease: 'bounce.out', onComplete: () => Sound.thud()}, '+=.1');
  show(tl, m, 'rise', '-=.1'); show(tl, hb, 'pop', '-=.1');
}},

/* ===== MEMORY 4: octopus. She keeps forgetting, she keeps asking. ===== */
{id: 'octopus', gated: true, build(p) {
  const {root, tl} = p;
  const bg = el('div', 'fill', root); bg.style.background = '#efe6d1';
  const badge = memoryBadge(root, 4, 'The octopus', R(30, 30), R(22, 22), R(620, 750));
  const c0 = cap(root, R(670, 30), R(52, 150), R(960, 848), 'I’ve had octopus. I have told you I’ve had octopus. <b>This has not helped.</b>');
  const a = panel(root, R(Q(30, 170, 815, 770, [0, 20, -20, 0]), Q(30, 270, 840, 560)), 'diner', {focus: [.48, .45]});
  const b = panel(root, R(Q(861, 170, 809, 770, [20, 0, 0, -20]), Q(30, 846, 840, 500)), 'me', {focus: [.5, .42]});
  const [ax, ay] = a.map(.44, .47), [hx, hy] = b.map(.52, .545);
  const you = balloon(root, R(50, 50), R(190, 286), R(420, 390), R(190, 180), '', [ax, ay - R(10, 10)], {spread: .12});
  const me = balloon(root, R(1270, 500), R(190, 866), R(380, 370), R(170, 160), '', R([1450, 440], [hx + 90, hy - 110]), {spread: .12});
  gsap.set([you, me], {visibility: 'hidden'});
  const counter = el('div', 'log', root, '<b>Times asked: <span class="ct">0</span></b>'); place(counter, R(90, 100), R(850, 1372), R(330, 330)); counter.style.whiteSpace = 'nowrap'; if (MODE === 'P') counter.querySelector('b').style.fontSize = '36px';
  const go = el('button', 'btn', root, 'Ask him again'); place(go, R(1120, 450), R(810, 1366)); go.style.whiteSpace = 'nowrap'; if (MODE === 'P') go.style.fontSize = '40px'; gsap.set(go, {visibility: 'hidden'});
  const v = villain(root, R(90, 40), R(690, 1190), R(620, 700), 'Should somebody check on her?');
  const c1 = cap(root, R(1030, 110), R(800, 1372), R(620, 560), 'No. <b>This is just what it’s like.</b>', 'white');
  gsap.set([v, c1], {visibility: 'hidden'});
  const lines = [
    ['Have you ever had <b>octopus</b> before?', 'Yes. I told you.'],
    ['Wait. Have you ever had <b>octopus?</b>', 'Yes.'],
    ['Have you ever tried <b>octopus?</b>', 'Are you fucking with me?'],
    ['You should try <b>octopus.</b>', '…'],
  ];
  let i = 0;
  const say = (B, html) => {
    B.querySelector('.t').innerHTML = `<span>${html}</span>`; gsap.set(B, {visibility: 'visible'});
    gsap.fromTo(B, {scale: .6, opacity: 0}, {scale: 1, opacity: 1, duration: .28, ease: 'back.out(2.5)'}); Sound.pop();
  };
  const step = () => {
    gsap.set(go, {visibility: 'hidden'}); gsap.set(me, {visibility: 'hidden'});
    const [y, m] = lines[i]; say(you, y);
    root.querySelectorAll('.ct').forEach(c => c.textContent = i + 1);
    gsap.delayedCall(.95, () => {
      say(me, m); i++;
      if (i < lines.length) gsap.delayedCall(.4, () => { gsap.set(go, {visibility: 'visible'}); gsap.fromTo(go, {scale: .7}, {scale: 1, duration: .25, ease: 'back.out(2.4)'}); });
      else {
        badge.saved(); go.remove(); if (MODE === 'P') counter.remove();
        gsap.timeline({onComplete: p.unlock, delay: .9}).set([v, c1], {visibility: 'visible'})
          .from(v, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()})
          .from(c1, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()}, '+=.9');
      }
    });
  };
  go.addEventListener('click', () => { Sound.unlock(); step(); });
  show(tl, badge, 'pop', .1, 'pop'); show(tl, c0, 'pop', '+=.1', 'pop'); tl.from([a, b], {opacity: 0, y: 24, duration: .4, stagger: .15}, '+=.1');
  show(tl, counter, 'pop', '+=.1'); tl.call(step, null, '+=.2');
}},

/* ===== MEMORY 5: the case files. Wrong side of the road, the costume, Six Flags. ===== */
{id: 'files', gated: true, build(p) {
  const {root, tl} = p;
  const bg = el('div', 'fill', root); bg.style.background = '#15233f';
  const badge = memoryBadge(root, 5, 'The dumbass files', R(30, 30), R(22, 22), R(760, 750));
  const c0 = cap(root, R(810, 34), R(52, 150), R(860, 848), 'He erased the evidence. <b>Tap each case to reopen it.</b>', 'white');
  const cases = [
    {title: 'Case 1: The road', art: g => roadScene(g), line: 'You pulled over. On the <b>wrong side of the road.</b> The whole road was right there, Bubs.'},
    {title: 'Case 2: The dress', img: ['costume', [.5, .76], 1], line: 'You were supposed to be Buttercup. You forgot your <b>ENTIRE dress.</b> We had to go buy a new one, def your most retarded moment.'},
    {title: 'Case 3: Six Flags', img: ['sixflags', [.5, .45], 1], line: 'In fairness: I once explained Six Flags to you like you’d never heard of it. <b>You live ten minutes from Six Flags.</b>'},
  ];
  const v = villain(root, R(90, 110), R(830, 1385), R(760, 560), 'You are BOTH division 1 speds.');
  const c9 = cap(root, R(880, 30), R(850, 1385), R(620, 0), 'Yes. We know.', 'white');
  if (MODE === 'P') c9.remove();
  gsap.set(v, {visibility: 'hidden'}); if (MODE === 'L') gsap.set(c9, {visibility: 'hidden'});
  let left = cases.length;
  const lines = [], cells = cases.map((C, i) => {
    const box = R([30 + i * 554, 160, 532, 440], [30, 262 + i * 374, 410, 360]);
    const P = panel(root, Q(...box), C.img ? C.img[0] : null, C.img ? {focus: C.img[1], zoom: C.img[2], real: false} : {});
    if (C.art) C.art(P);
    const tag = el('div', 'casetag', P, C.title);
    const line = cap(root, R(box[0], 450), R(612, box[1]), R(532, 420), C.line);
    if (MODE === 'P') line.style.fontSize = '33px';
    gsap.set(line, {visibility: 'hidden'}); lines.push(line);
    const w = el('button', 'wo', P.clip, '<span>ERASED</span><small>TAP TO REOPEN</small>'); w.setAttribute('aria-label', 'Reopen ' + C.title);
    w.addEventListener('click', () => {
      Sound.unlock(); Sound.ding(); w.disabled = true;
      gsap.to(w, {clipPath: 'inset(0 0 100% 0)', duration: .4, ease: 'power2.in', onComplete: () => w.remove()});
      gsap.set(line, {visibility: 'visible'}); gsap.fromTo(line, {scale: .7, opacity: 0}, {scale: 1, opacity: 1, duration: .3, delay: .3, ease: 'back.out(2.2)', onStart: () => Sound.pop()});
      if (--left === 0) {
        badge.saved();
        const t = gsap.timeline({onComplete: p.unlock, delay: 1.5}).set(v, {visibility: 'visible'}).from(v, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()});
        if (MODE === 'L') t.set(c9, {visibility: 'visible'}, '+=.8').from(c9, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()});
      }
    });
    return P;
  });
  show(tl, badge, 'pop', .1, 'pop'); show(tl, c0, 'pop', '+=.1', 'pop'); tl.from(cells, {opacity: 0, y: 24, duration: .35, stagger: .12}, '+=.1');
}},

/* ===== MEMORY 6: cougar, the break-up, the birth certificate ===== */
{id: 'cert', gated: true, build(p) {
  const {root, tl, W, H} = p;
  const bg = el('div', 'fill', root); bg.style.background = '#3a1030';
  halftone(root, 0, 0, W, H, 'rgba(255,120,170,.2)', 15, 'linear-gradient(120deg,#000 0,transparent 70%)');
  const badge = memoryBadge(root, 6, 'The cougar crisis', R(40, 34), R(30, 22), R(570, 750));
  const c1 = cap(root, R(40, 34), R(160, 140), R(570, 832), 'You’re a <b>cougar.</b> It’s science. And you hate it so much you’ve broken up with me until my birthday.');
  const c2 = cap(root, R(40, 34), R(350, 280), R(570, 832), 'So I came up with a plan: change my birth certificate to a year earlier. <b>Same age. Problem fucking solved.</b>');
  const cert = place(el('div', 'cert', root, `
    <h3>CERTIFICATE OF BIRTH</h3><div class="sub">Official record. Please do not touch.</div>
    <div class="f"><span>NAME</span><span>Divij Kohli</span></div>
    <div class="f"><span>BIRTH YEAR</span><span><s>The real one</s><span class="fix">one year earlier. trust me.</span></span></div>
    <div class="f"><span>REASON</span><span>Girlfriend is a cougar</span></div>
    <div class="f"><span>JUDGE</span><span>Hargun</span></div>`), R(650, 46), R(160, 420), R(1020, 808));
  const q = cap(root, R(40, 34), R(590, 1030), R(570, 832), '<b>You’re the judge. Your ruling?</b>', 'dark');
  q.style.fontSize = R(38, 46) + 'px';
  const yes = el('button', 'btn white', root, 'Approve'); place(yes, R(40, 34), R(700, 1160));
  const no = el('button', 'btn red', root, 'Deny'); place(no, R(330, 390), R(700, 1160));
  const fel = cap(root, R(40, 34), R(830, 1300), R(570, 832), 'That’s a felony, Bubs. I’m not going to jail for you. Try again.', 'white');
  gsap.set(fel, {visibility: 'hidden'});
  yes.addEventListener('click', () => {
    Sound.unlock(); Sound.buzz(); shake(yes, 12); gsap.set(fel, {visibility: 'visible'});
    gsap.fromTo(fel, {scale: .7, opacity: 0}, {scale: 1, opacity: 1, duration: .25, ease: 'back.out(2)'});
    gsap.to(no, {scale: 1.14, duration: .25, yoyo: true, repeat: 3});
  });
  no.addEventListener('click', () => {
    Sound.unlock(); yes.remove(); no.remove(); fel.remove(); q.remove(); badge.saved();
    const s = place(el('div', 'stampmark deny', root, 'DENIED'), R(1170, 440), R(480, 700)); s.style.transform = 'rotate(-11deg)'; s.style.fontSize = R(100, 84) + 'px';
    const c3 = cap(root, R(40, 34), R(590, 1040), R(570, 832), `Fine. We’re broken up until December 2nd. <b>${daysToDec2()} days, you absolute cougar.</b>`);
    const v = villain(root, R(40, 34), R(740, 1210), R(570, 832), 'Wait. You tried to erase a whole year? I like this guy.');
    gsap.timeline({onComplete: p.unlock})
      .from(s, {scale: 3, opacity: 0, duration: .22, ease: 'power4.in', onComplete() { Sound.stamp(); shake(cert, 9); }})
      .from(c3, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()}, '+=.5')
      .from(v, {scale: .6, opacity: 0, duration: .3, ease: 'back.out(2.4)', onStart: () => Sound.pop()}, '+=.9');
  });
  show(tl, badge, 'pop', .1, 'pop'); show(tl, c1, 'pop', '+=.1', 'pop'); show(tl, c2, 'pop', '+=.9', 'pop');
  tl.from(cert, {y: -90, rotation: 4, opacity: 0, duration: .55, ease: 'power3.out'}, '+=.2');
  tl.from('.fix', {clipPath: 'inset(0 100% -40% 0)', duration: .6, onStart: () => Sound.pencil()}, '+=.3');
  show(tl, q, 'pop', '+=.3', 'pop'); show(tl, yes, 'pop', '+=.05'); show(tl, no, 'pop', '+=.05');
}},

/* ===== THE VILLAIN'S LAST PUSH: keep everything else ===== */
{id: 'keep', gated: true, build(p) {
  const {root, tl, W, H} = p;
  const bg = el('div', 'fill', root); bg.style.background = '#efe6d1';
  const data = [
    ['candle', [.55, .58], 'You pour hot candle wax on your own fingers. For fun. I’ve asked why. Nobody knows.', 1],
    ['museum', [.5, .46], 'You, at the museum, meeting your ancestors.', 1],
    ['flowers', [.55, .36], 'I bought you flowers. You didn’t own a vase. So: bomboclatt protein vase.', 1],
    ['masks', [.42, .36], 'Buttercup, in the emergency backup dress.', 1],
    ['gym', [.5, .56], 'Gym dates.', 1.15],
    ['waterfall', [.5, .62], 'Okay, this one’s just cute. Shut up.', 1],
  ];
  const top = R(150, 292), gx = 14;
  const tallH = R(H - top - 24, 540), tallW = R(400, (W - 60 - gx) / 2);
  const restX = R(30 + 2 * (tallW + gx), 30), restY = R(top, top + tallH + gx), restW = R(W - 30 - restX, W - 60), cw = (restW - gx) / 2, ch = (H - 24 - restY - gx) / 2;
  const keepRects = [[30, top, tallW, tallH], [30 + tallW + gx, top, tallW, tallH], [restX, restY, cw, ch], [restX + cw + gx, restY, cw, ch], [restX, restY + ch + gx, cw, ch], [restX + cw + gx, restY + ch + gx, cw, ch]];
  const v = villain(root, 30, 20, R(800, 750), 'All six saved?! Fine. Then I’ll erase <u>everything else</u> at once.'); if (MODE === 'P') v.style.fontSize = '30px';
  const c = cap(root, R(860, 30), R(40, 168), R(760, 840), 'Oh no you fucking don’t. <b>Tap each one to stamp it KEEP.</b>', 'dark');
  let count = 0;
  const cells = data.map(([img, focus, line, zoom], i) => {
    const rect = keepRects[i], pw = rect[2], ph = rect[3];
    const P = panel(root, Q(...rect), img, {focus, zoom, real: false});
    const pc = el('div', 'pcap', P.clip, line); pc.style.visibility = 'hidden';
    if (i === 0) pc.style.bottom = R(62, 92) + 'px';
    if (i === 5) pc.style.right = R(118, 170) + 'px';
    if (i === 4 && MODE === 'P') pc.style.left = '84px';
    const w = el('button', 'wo', P.clip, '<span>ERASED</span><small>TAP TO KEEP</small>'); w.setAttribute('aria-label', 'Stamp KEEP');
    w.addEventListener('click', () => {
      Sound.unlock(); w.disabled = true; count++;
      const s = el('div', 'stampmark stet', P, 'KEEP'); place(s, pw / 2 - R(90, 96), ph / 2 - R(56, 60)); s.style.fontSize = R(76, 80) + 'px'; s.style.transform = `rotate(${-14 + i * 4}deg)`; s.style.mixBlendMode = 'normal';
      gsap.timeline()
        .from(s, {scale: 3, opacity: 0, duration: .16, ease: 'power4.in', onComplete() { Sound.stamp(); shake(P, 7, .25); }})
        .to(w, {clipPath: 'inset(0 0 100% 0)', duration: .4, ease: 'power2.in'}, '+=.08')
        .to(s, {opacity: 0, duration: .3}, '-=.2')
        .call(() => { pc.style.visibility = 'visible'; gsap.from(pc, {y: 30, opacity: 0, duration: .3}); w.remove(); s.remove(); });
      if (count === data.length) gsap.delayedCall(1.1, p.unlock);
    });
    return P;
  });
  show(tl, v, 'pop', .1, 'pop'); show(tl, c, 'pop', '+=.5', 'pop');
  tl.from(cells, {opacity: 0, y: 24, stagger: .08, duration: .35}, '+=.1');
}},

/* ===== SHOWDOWN: he rubs out her step count, live, on her phone ===== */
{id: 'showdown', cls: 'black', gated: true, build(p) {
  const {root, tl, W, H} = p;
  burst(root, W, H, W / 2, R(420, 560), {color: 'rgba(212,18,42,.36)', n: 60, seed: 31, inner: .12});
  const art = eraserArt(root, R(590, 190), R(190, 300), R(520, 520));
  const v1 = villain(root, R(100, 60), R(60, 60), R(1500, 780), 'Do you have ANY idea how stupid you two are?');
  v1.style.fontSize = R('42px', '42px');
  const b = el('button', 'btn red pulse', root, 'Not at all.'); place(b, R(620, 180), R(740, 880)); b.style.fontSize = R('72px', '82px');
  const v2 = villain(root, R(100, 60), R(40, 40), R(1500, 780), 'THAT’S IT. I’M ERASING YOUR <u>STEP COUNT.</u> EVERY 10,000-STEP DAY. GONE.');
  v2.style.fontSize = R('46px', '44px'); gsap.set(v2, {visibility: 'hidden'});

  /* her phone */
  const pw = R(360, 410), ph = R(680, 700), px = R(330, 50), py = R(250, 290);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const phone = place(el('div', 'phone', root, `
    <div class="ph-screen">
      <div class="ph-island"></div>
      <div class="ph-title">Steps</div><div class="ph-sub">Today</div>
      <div class="ph-ring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50" class="trk"/><circle cx="60" cy="60" r="50" class="val" pathLength="100"/></svg>
        <div class="ph-num"><b>10,000</b><span>of 10,000 steps</span></div></div>
      <div class="ph-week">${days.map(d => `<div><i><u></u></i><span>${d}</span></div>`).join('')}</div>
      <div class="ph-streak"><span>Daily goal streak</span><b>Never missed</b></div>
      <div class="ph-wipe"></div>
    </div>`), px, py, pw, ph);
  phone.style.fontSize = R('24px', '27px');
  gsap.set(phone, {visibility: 'hidden'});
  const num = phone.querySelector('.ph-num b'), ring = phone.querySelector('.val'), bars = [...phone.querySelectorAll('.ph-week u')], streak = phone.querySelector('.ph-streak b'), wipe = phone.querySelector('.ph-wipe');

  const c = cap(root, R(790, 100), R(800, 1010), R(780, 700), 'Oh no. <b>Not the steps.</b>', 'dark'); c.style.fontSize = R('58px', '58px'); gsap.set(c, {visibility: 'hidden'});
  const s = sfxText(root, R(1090, 470), R(620, 1150), 'GASP!', R(170, 130), R(8, -6), '#fff'); gsap.set(s, {visibility: 'hidden'});
  const rub = {x: px + pw / 2 - R(65, 75), y: py + ph * .46, size: R(130, 150)};
  const rest = {x: R(800, 480), y: R(250, 470), size: R(380, 360)};

  b.addEventListener('click', () => {
    Sound.unlock(); b.remove(); v1.remove(); Sound.stamp(); shake(root, 14);
    gsap.set([v2, phone], {visibility: 'visible'});
    const count = {v: 10000};
    const setSize = (obj, t) => ({left: obj.x, top: obj.y, width: obj.size, height: obj.size * 500 / 440, duration: t, ease: 'power2.inOut'});
    const dropCrumb = () => {
      const d = place(el('div', 'crumb', root), rub.x + Math.random() * rub.size, rub.y + rub.size * .9); d.style.zIndex = 12;
      gsap.to(d, {y: 120 + Math.random() * 260, x: (Math.random() - .5) * 160, rotation: 360, opacity: 0, duration: .8, ease: 'power1.in', onComplete: () => d.remove()});
    };
    const t = gsap.timeline({onComplete: p.unlock});
    t.from(v2, {scale: 1.3, opacity: 0, duration: .22, ease: 'power4.in'})
      .from(phone, {y: 500, rotation: 6, duration: .5, ease: 'back.out(1.2)'}, '+=.1')
      .call(() => Sound.ding(), null, '+=.2')
      .to(art, {...setSize(rest, .35)}, '<')
      .to({}, {duration: .8})
      .call(() => { art.style.zIndex = 13; })
      .to(art, {...setSize(rub, .35), rotation: -14})
      .call(() => Sound.scrub(1));
    const dur = REDUCED ? .4 : 3.2, at = t.duration();
    t.to(art, {x: R(70, 80), duration: .13, ease: 'sine.inOut', yoyo: true, repeat: Math.floor(dur / .13), onRepeat: dropCrumb}, at)
      .fromTo(art, {y: -30}, {y: 90, duration: dur, ease: 'none'}, at)
      .to(count, {v: 0, duration: dur, ease: 'power1.in', onUpdate() {
        num.textContent = Math.round(count.v).toLocaleString('en-US');
        ring.style.strokeDashoffset = 100 - count.v / 100;
      }}, at)
      .to(bars, {scaleY: 0, duration: .4, stagger: (dur - .5) / bars.length, ease: 'power2.in'}, at)
      .to(wipe, {opacity: .5, duration: dur, ease: 'none'}, at)
      .call(() => {
        Sound.scrub(0); Sound.boom(); shake(root, 20, .6); phone.classList.add('dead');
        num.textContent = '0'; ring.style.opacity = 0; streak.textContent = '0 days';
        gsap.set(art, {x: 0, y: 0}); gsap.set([s], {visibility: 'visible'});
      })
      .to(art, {...setSize(rest, .35), rotation: 0}, '+=.05')
      .from(s, {scale: 3, opacity: 0, duration: .22, ease: 'power4.in'}, '-=.2')
      .call(() => { gsap.set(c, {visibility: 'visible'}); gsap.fromTo(c, {scale: .6, opacity: 0}, {scale: 1, opacity: 1, duration: .3, ease: 'back.out(2.4)'}); Sound.pop(); }, null, '+=.5')
      .to({}, {duration: .5});
  });
  tl.from(art, {y: -900, duration: .5, ease: 'bounce.out', onComplete: () => { Sound.thud(); shake(root, 12); }}, .2);
  show(tl, v1, 'pop', '+=.2', 'pop'); show(tl, b, 'pop', '+=.7', 'pop');
}},

/* ===== CLIMAX: full crashout, forehead beam ===== */
{id: 'beam', gated: true, build(p) {
  const {root, tl, W, H} = p;
  const bg = el('div', 'fill', root); bg.style.background = '#f4f2ec';
  burst(root, W, H, R(420, 450), R(330, 800), {color: '#14101a', n: 90, seed: 77, inner: .2});
  const kana = place(el('div', 'kana', root, 'ゴゴゴゴゴ'), R(40, 30), R(135, 130)); kana.style.fontSize = R('120px', '96px');
  const c1 = cap(root, R(30, 30), R(24, 24), R(620, 750), 'He shouldn’t have touched the steps. <b>You’ve gone FULL CRASHOUT MODE.</b>', 'white');
  const hh = R(960, 1000), cw = hh * 2 / 3;   // candle cutout is 2:3
  const hx = R(120, 150), hy = R(60, 500);
  const her = el('img', 'abs manga', root); her.src = 'assets/cut/candle.webp'; her.alt = 'Hargun laughing with wax on her fingers'; her.style.height = hh + 'px'; place(her, hx, hy); her.style.zIndex = 6;
  const fx = hx + .55 * cw, fy = hy + .335 * hh;   // the forehead, in page coordinates
  const glow = place(el('div', 'glow', root), fx - 130, fy - 130, 260, 260); gsap.set(glow, {scale: 0});
  const ex = R(1180, 560), ey = R(90, 150), es = R(430, 300);
  const art = eraserArt(root, ex, ey, es, 'scared');
  const yb = balloon(root, R(660, 40), R(250, 370), R(460, 400), R(150, 130), 'You’re <b>already erased.</b>', [fx + R(20, -40), fy + R(-40, -60)], {spread: .1});
  const eb = balloon(root, R(930, 300), R(50, 250), R(230, 230), R(110, 96), '<b>HARGUN?!</b>', R([ex + es * .28, ey + es * .42], [ex + es * .1, ey + es * .5]), {spread: .14});
  const m = place(el('div', 'meter', root, '<i></i><span>FOREHEAD: IDLE</span>'), R(780, 40), R(700, 1250), R(860, 820), R(70, 76));
  const hb = el('button', 'btn red hold', root, 'Hold to charge forehead'); hb.dataset.nav = 'no'; place(hb, R(830, 40), R(800, 1344), R(760, 820)); hb.style.textAlign = 'center';
  if (MODE === 'P') hb.style.fontSize = '50px';
  const stages = ['FOREHEAD: WARMING UP', 'FOREHEAD: GLOWING', 'FOREHEAD: UNSTABLE', 'FOREHEAD: VISIBLE FROM SPACE'];
  const fill = m.querySelector('i'), lab = m.querySelector('span');
  /* the payoff */
  const beam = svg(root, 'fill', W, H, `<defs><linearGradient id="bm" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#fff36b"/><stop offset="1" stop-color="#ff5a1f"/></linearGradient></defs>
    <polygon points="${fx},${fy - 16} ${ex + es + 200},${ey - 60} ${ex + es + 200},${ey + es + 40} ${fx},${fy + 16}" fill="url(#bm)" stroke="#14101a" stroke-width="7"/>
    <polygon points="${fx},${fy - 5} ${ex + es + 200},${ey + es * .2} ${ex + es + 200},${ey + es * .7} ${fx},${fy + 5}" fill="#fff"/>`);
  beam.style.width = W + 'px'; beam.style.height = H + 'px'; beam.style.zIndex = 16; beam.style.visibility = 'hidden';
  const word = sfxText(root, R(560, 30), R(610, 180), 'FOREHEAD BEAM!!!', R(150, 118), -4, '#fff'); word.style.zIndex = 20; word.style.visibility = 'hidden';
  const flash = el('div', 'flash', root);
  const win = el('div', 'fill', root); win.style.visibility = 'hidden'; win.style.zIndex = 28; win.style.overflow = 'hidden';
  win.style.background = 'radial-gradient(circle at 50% 46%,#fff7b0 0,#ffd21f 26%,#ef3a1f 58%,#7c0a2e 100%)';
  burst(win, W, H, W / 2, R(420, 660), {color: 'rgba(255,255,255,.55)', n: 72, seed: 41, inner: .08});
  const kept = el('div', 'stetwall', win, 'SAVED!'); kept.style.fontSize = R(380, 300) + 'px'; place(kept, R(270, 40), R(26, 60));
  const us = el('img', 'abs', win); us.src = 'assets/cut/braids.webp'; us.alt = 'Divij and Hargun, smiling'; const uw = R(1000, 880); us.style.width = uw + 'px'; place(us, R(350, 8), R(960 - uw * .75 + 16, 1500 - uw * .75)); us.style.zIndex = 8;
  const crumb = eraserArt(win, R(1340, 720), R(40, 600), R(190, 150), 'dead'); crumb.style.zIndex = 9;
  const last = balloon(win, R(1130, 450), R(250, 350), R(400, 430), R(190, 220), 'You two are fucking idiots. <b>You deserve each other.</b>', R([1400, 240], [780, 610]), {spread: .1, size: R(30, 34)});
  const c2 = cap(win, R(40, 30), R(70, 420), R(380, 400), 'All six saved. <b>You did it, Bubs.</b>', 'dark'); c2.style.fontSize = R('38px', '44px');
  let v = 0, held = false, fired = false;
  const fire = () => {
    fired = true; held = false; hb.remove(); m.remove(); yb.remove(); eb.remove(); Sound.boom();
    const crumbs = Array.from({length: 26}, () => { const d = place(el('div', 'crumb', root), ex + Math.random() * es, ey + Math.random() * es); d.style.zIndex = 15; return d; });
    gsap.timeline({onComplete: p.unlock})
      .call(() => { beam.style.visibility = 'visible'; word.style.visibility = 'visible'; shake(root, 30, 1.1); })
      .set(flash, {opacity: .9}).to(flash, {opacity: 0, duration: .4})
      .from(word, {scale: .3, rotation: -12, duration: .3, ease: 'back.out(2)'}, '<')
      .to(art, {opacity: 0, scale: .4, rotation: 40, x: 160, duration: .9, ease: 'power2.in'}, '<')
      .to(crumbs, {x: () => 200 + Math.random() * 400, y: () => (Math.random() - .3) * 700, rotation: 360, opacity: 0, duration: 1.1, stagger: .012, ease: 'power2.out'}, '<')
      .call(() => { Sound.thud(); gsap.set(win, {visibility: 'visible'}); }, null, '+=.5')
      .set(flash, {opacity: 1}).to(flash, {opacity: 0, duration: .7})
      .from(kept, {scale: .3, rotation: -14, duration: .38, ease: 'back.out(2)'}, '<')
      .from(us, {y: 340, scale: .85, duration: .55, ease: 'back.out(1.4)'}, '<.06')
      .from(c2, {x: -240, duration: .35, ease: 'power3.out'}, '+=.3')
      .from(crumb, {y: -300, opacity: 0, duration: .4, ease: 'bounce.out'}, '+=.5')
      .from(last, {scale: .5, opacity: 0, duration: .35, ease: 'back.out(2.2)', onStart: () => Sound.pop()}, '+=.3');
  };
  const tick = () => {
    if (!held || fired) return;
    v = Math.min(1, v + gsap.ticker.deltaRatio() / 60 / 2.4);
    fill.style.width = v * 100 + '%';
    lab.textContent = stages[Math.min(stages.length - 1, Math.floor(v * stages.length))];
    gsap.set(glow, {scale: .3 + v * .8, opacity: .4 + v * .6});
    if (!REDUCED) gsap.set(her, {x: (Math.random() - .5) * v * 8, y: (Math.random() - .5) * v * 8});
    if (Math.random() < .08) Sound.buzz();
    if (v >= 1) fire();
  };
  gsap.ticker.add(tick); p.cleanup = () => gsap.ticker.remove(tick);
  hb.addEventListener('pointerdown', e => { e.preventDefault(); held = true; hb.classList.add('down'); Sound.unlock(); try { hb.setPointerCapture(e.pointerId); } catch (_) {} });
  const stop = () => { held = false; hb.classList.remove('down'); };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => hb.addEventListener(t, stop));
  hb.addEventListener('contextmenu', e => e.preventDefault());
  hb.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); held = true; hb.classList.add('down'); } });
  hb.addEventListener('keyup', stop);
  show(tl, c1, 'slam', .15, 'thud'); tl.from(her, {y: 300, opacity: 0, duration: .5, ease: 'power3.out'}, '+=.1');
  show(tl, kana, 'slam', '+=.1', 'thud'); show(tl, yb, 'pop', '+=.3', 'pop');
  tl.from(art, {x: 500, duration: .4, ease: 'power3.out'}, '+=.2'); show(tl, eb, 'pop', '+=.2', 'pop');
  show(tl, m, 'rise', '+=.2'); show(tl, hb, 'pop', '-=.1');
}},

/* ===== THE LETTER: quiet, real photos, real words ===== */
{id: 'letter', cls: 'black', noSkip: true, enter() { Sound.music(true); }, build(p) {
  const {root, tl} = p;
  const body = LETTER.map(t => `<p>${t}</p>`).join('');
  const lt = place(el('div', 'letter', root, body + '<p class="sign">— Divij</p>'), R(700, 34), R(30, 450), R(960, 832));
  const snaps = R([['nice2', 40, 40, 420, 450, -4, 'us'], ['nice3', 280, 440, 360, 470, 4, 'still us']], [['nice2', 34, 34, 420, 390, -4, ''], ['nice3', 500, 40, 340, 390, 3, '']]);
  const s = snaps.map(([n, x, y, w, h, r, label]) => {
    const d = place(el('div', 'snap', root, `<div style="background-image:url(assets/real/${n}.webp)"></div><span>${label}</span>`), x, y, w, h);
    d.style.transform = `rotate(${r}deg)`; if (MODE === 'P') d.style.paddingBottom = '14px';
    return d;
  });
  tl.from(s, {opacity: 0, y: 40, duration: 1, stagger: .35, ease: 'power2.out'}, .4);
  tl.from(lt, {opacity: 0, y: 30, duration: 1, ease: 'power2.out'}, .5);
  tl.from(lt.querySelectorAll('p'), {opacity: 0, duration: 1, stagger: 2.2, ease: 'none'}, 1);
  tl.to({}, {duration: 6});
}},

/* ===== LOOK. US. ===== */
{id: 'us', cls: 'black', gated: true, enter() { Sound.music(true); }, build(p) {
  const {root, tl, W, H} = p;
  const bgb = el('div', 'abs', root); place(bgb, -40, -40, W + 80, H + 80); bgb.style.background = 'url(assets/real/us.webp) 50% 30%/cover'; bgb.style.filter = 'blur(30px) brightness(.42)';
  const im = el('div', 'abs', root); place(im, R(490, 0), 0, R(720, W), R(960, 1140)); im.style.background = 'url(assets/real/us.webp) 50% 20%/cover';
  const a = balloon(root, R(90, 50), R(370, 1170), R(340, 400), R(170, 170), '<small class="who">Me</small><span style="font-size:1.3em">Look. <b>Us.</b></span>', null);
  const b = balloon(root, R(1270, 460), R(370, 1290), R(340, 400), R(170, 170), '<small class="who">You</small><span style="font-size:1.3em">Ahh. <b>Us.</b></span>', null);
  gsap.set(b, {visibility: 'hidden'});
  const go = el('button', 'btn', root, 'Say it back'); place(go, R(1280, 500), R(410, 1340));
  go.addEventListener('click', () => {
    Sound.unlock(); go.remove(); gsap.set(b, {visibility: 'visible'});
    gsap.from(b, {scale: .5, opacity: 0, duration: .4, ease: 'back.out(2.2)', onComplete: () => p.unlock()}); Sound.ahh(160);
  });
  tl.from(im, {opacity: 0, scale: 1.05, duration: 1.4, ease: 'power2.out'}, 0);
  show(tl, a, 'pop', '+=.2', 'pop'); show(tl, go, 'pop', '+=.5');
}},

/* ===== TO BE CONTINUED ===== */
{id: 'tbc', last: true, enter() { Sound.music(true); }, build(p) {
  const {root, tl} = p;
  const blanks = R([[30, 30, 520, 300], [566, 30, 340, 300], [922, 30, 748, 300]], [[30, 30, 400, 300], [446, 30, 424, 300], [30, 346, 840, 200]]).map(([x, y, w, h]) => place(el('div', 'blank', root), x, y, w, h));
  const c1 = cap(root, R(50, 50), R(54, 56), R(450, 360), 'These panels are blank for a reason.');
  const c2 = cap(root, R(950, 60), R(240, 440), R(690, 780), 'We just haven’t fucked them up yet. <b>That’s the next part.</b>');
  const t = el('div', 'tbc', root, 'To be <i>continued…</i>'); place(t, R(40, 34), R(346, 585)); t.style.whiteSpace = R('nowrap', 'normal'); t.style.width = R('auto', '840px');
  const sub = cap(root, R(1000, 34), R(380, 850), R(650, 830), 'Next issue: <b>Hargun turns 23.</b> November 3, 2027. Written by both of us.', 'white');
  const future = [
    ['22', 'You are here.', 1], ['23', 'Two years apart again. You’re still mad.'], ['25', 'A quarter century of hats.'], ['30', 'Still can’t find the right side of the road.'], ['35', 'We finally go to Six Flags. It’s ten minutes away.'],
    ['40', 'Chuds: The Later Years.'], ['50', 'You should try octopus.'], ['65', 'Forehead still visible from space.'], ['80', 'Two very old chuds.'], ['99', 'Still writing.'],
  ];
  const shelf = place(el('div', 'shelf', root, future.map(([n, s, cur]) => `<div class="issue ${cur ? 'cur' : ''}"><i>THE NEW</i><b>${n}</b><p>${s}</p></div>`).join('')), 30, R(490, 1010), R(1640, 840));
  shelf.dataset.nav = 'no';
  ['pointerdown', 'touchstart'].forEach(n => shelf.addEventListener(n, e => e.stopPropagation(), {passive: true}));
  let dn = null;
  shelf.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') dn = [e.clientX, shelf.scrollLeft]; });
  addEventListener('pointermove', e => { if (dn) shelf.scrollLeft = dn[1] - (e.clientX - dn[0]) * 1.4; });
  addEventListener('pointerup', () => dn = null);
  const lab = cap(root, R(44, 110), R(850, 1376), R(620, 480), 'Drag the shelf. We’ve got a lot of issues left.', 'white');
  if (MODE === 'P') lab.style.fontSize = '30px';
  const again = el('button', 'again', root, 'Read it again'); place(again, R(1450, 620), R(880, 1400));
  again.addEventListener('click', () => { Sound.music(false); p.restart(); });
  tl.from(blanks, {opacity: 0, scale: .96, duration: .5, stagger: .15}, .2);
  show(tl, c1, 'pop', '+=.3', 'pop'); show(tl, c2, 'pop', '+=.5', 'pop'); show(tl, t, 'slam', '+=.5', 'thud'); show(tl, sub, 'pop', '+=.4', 'pop');
  tl.from(shelf.children, {y: 60, opacity: 0, stagger: .07, duration: .4, ease: 'power3.out'}, '+=.2');
  show(tl, lab, 'fade', '+=.1'); show(tl, again, 'fade', '-=.2');
  tl.call(() => { if (!REDUCED) gsap.to(shelf, {scrollLeft: 180, duration: 2, ease: 'power1.inOut', yoyo: true, repeat: 1}); });
}},
];
