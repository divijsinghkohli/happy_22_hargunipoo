/* The book itself: loading, scaling to the screen, turning pages, input. */
(() => {
  const stage = document.getElementById('stage'), book = document.getElementById('book');
  let index = 0, cur = null, turning = false, built = false;

  function fit() {
    const vw = innerWidth, vh = innerHeight;
    const mode = vw / vh < 1 ? 'P' : 'L';
    const changed = mode !== MODE || !built;
    MODE = mode;
    const [W, H] = SIZE[MODE];
    const s = Math.min(vw / W, vh / H);
    stage.className = MODE;
    Object.assign(stage.style, {width: W + 'px', height: H + 'px', transform: `scale(${s}) translate(-50%,-50%)`});
    if (changed && built) render(index);
  }

  function chrome(root, def, api) {
    const turn = el('button', 'turn', root); turn.setAttribute('aria-label', 'Turn the page');
    svg(turn, '', 150, 150, `
      <path d="M150 0 L150 150 L0 150 Z" fill="#14101a" opacity=".32" transform="translate(-7 -7)"/>
      <path d="M150 12 L150 150 L12 150 Z" fill="#ffc81f" stroke="#14101a" stroke-width="4"/>
      <path d="M150 12 L12 150 L140 140 Z" fill="#fff" stroke="#14101a" stroke-width="4"/>
      <path d="M84 111 h26 m-10 -11 l11 11 l-11 11" transform="translate(4 2)" fill="none" stroke="#14101a" stroke-width="6" stroke-linecap="square"/>`);
    turn.addEventListener('click', e => { e.stopPropagation(); go(1); });
    if (index > 0) {
      const back = el('button', 'tool', root, `<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>`);
      back.setAttribute('aria-label', 'Previous page');
      back.style.left = '14px'; back.style.bottom = '14px';
      back.addEventListener('click', e => { e.stopPropagation(); go(-1); });
    }
    const snd = el('button', 'tool', root); snd.style.right = '14px'; snd.style.top = def.id === 'cover' ? R('96px', '110px') : '14px';
    const paint = () => { snd.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/>${Sound.muted ? '<path d="M17 9l5 6M22 9l-5 6"/>' : '<path d="M17 8c2 2 2 6 0 8M20 5c4 4 4 10 0 14"/>'}</svg>`; snd.setAttribute('aria-label', Sound.muted ? 'Turn sound on' : 'Turn sound off'); };
    paint(); snd.addEventListener('click', e => { e.stopPropagation(); Sound.unlock(); Sound.toggle(); paint(); });
    el('div', 'shade', root);
    return turn;
  }

  function make(i) {
    const def = PAGES[i];
    const root = el('section', 'page ' + (def.cls || ''));
    const [W, H] = SIZE[MODE];
    const api = {
      root, W, H, id: def.id, locked: !!def.gated,
      tl: gsap.timeline({paused: true}),
      unlock() { api.locked = false; api.ready(); },
      ready() { if (!api.locked && !def.last) { api.turn.classList.add('on'); gsap.delayedCall(2.5, () => api.turn.classList.add('nudge')); } },
      next() { go(1); },
      restart() { index = 0; render(0); },
    };
    api.turn = chrome(root, def, api);
    def.build(api);
    api.tl.eventCallback('onComplete', () => { api.done = true; if (!def.gated) api.ready(); });
    return {root, api, def};
  }

  function enter(pg) {
    cur = pg;
    if (pg.def.enter) pg.def.enter();
    else Sound.music(false);
    if (REDUCED) pg.api.tl.timeScale(6);
    pg.api.tl.play();
  }
  function dispose(pg) {
    if (!pg) return;
    pg.api.tl.kill();
    if (pg.api.cleanup) pg.api.cleanup();
    gsap.killTweensOf(pg.root.querySelectorAll('*'));
    pg.root.remove();
  }
  function render(i) {
    dispose(cur); book.innerHTML = '';
    index = i;
    const pg = make(i); book.appendChild(pg.root); enter(pg);
  }

  function go(dir) {
    if (turning) return;
    const to = index + dir;
    if (to < 0 || to >= PAGES.length) return;
    if (dir > 0 && cur.api.locked) { hintLocked(); return; }
    if (dir > 0 && !cur.api.done && !cur.def.gated) {   // first press finishes the page's reveal
      if (!cur.def.noSkip) cur.api.tl.timeScale(5);
      return;
    }
    turning = true; Sound.unlock(); Sound.flip();
    const old = cur, nxt = make(to);
    index = to;
    const top = dir > 0 ? old : nxt, under = dir > 0 ? nxt : old;
    book.appendChild(under.root); book.appendChild(top.root);
    const shade = top.root.querySelector('.shade');
    const dur = REDUCED ? .01 : .78;
    const after = () => { dispose(old); turning = false; enter(nxt); };
    if (dir > 0) {
      gsap.timeline({onComplete: after})
        .to(old.root, {rotationY: -112, duration: dur, ease: 'power2.inOut'}, 0)
        .to(shade, {opacity: 1, duration: dur * .6, ease: 'power1.in'}, 0);
    } else {
      gsap.set(nxt.root, {rotationY: -112}); gsap.set(shade, {opacity: 1});
      gsap.timeline({onComplete: after})
        .to(nxt.root, {rotationY: 0, duration: dur, ease: 'power2.inOut', clearProps: 'transform'}, 0)
        .to(shade, {opacity: 0, duration: dur, ease: 'power2.out'}, 0);
    }
  }
  function hintLocked() {
    const target = cur.root.querySelector('.prompt,.tearhint,.btn,.spot:not(.done),.wo:not([disabled]),.bigstamp,canvas');
    if (target) gsap.fromTo(target, {scale: 1}, {scale: 1.12, duration: .14, yoyo: true, repeat: 1});
  }

  /* input */
  addEventListener('keydown', e => {
    if (e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
  });
  let sx = null, sy = 0;
  addEventListener('pointerdown', e => {
    Sound.unlock();
    if (cur && !cur.api.done && !cur.def.noSkip) cur.api.tl.timeScale(3);
    sx = e.target.closest('[data-nav=no],.tearzone,.hold') ? null : e.clientX; sy = e.clientY;
  });
  addEventListener('pointerup', e => {
    if (sx == null) return;
    const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
    if (e.pointerType === 'mouse' || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    go(dx < 0 ? 1 : -1);
  });
  addEventListener('resize', fit);
  addEventListener('orientationchange', () => setTimeout(fit, 200));

  /* preload every image and font before the bag is on the table */
  const names = Object.keys(DIMS).filter(n => n !== 'hero');
  const urls = [...names.map(n => `assets/img/${n}.webp`), 'assets/real/us.webp', 'assets/real/braids.webp', 'assets/real/nice2.webp', 'assets/real/nice3.webp', 'assets/cut/hero.webp', 'assets/cut/braids.webp', 'assets/cut/candle.webp', 'assets/grain.png'];
  const bar = document.querySelector('.ld-bar i');
  let n = 0;
  const tickLoad = () => { n++; bar.style.width = n / urls.length * 100 + '%'; };
  const imgs = urls.map(u => new Promise(res => { const i = new Image(); i.onload = i.onerror = () => { tickLoad(); res(); }; i.src = u; }));
  const fonts = ['400 20px Anton', '400 20px Bangers', '400 20px Scrawl', '400 20px Typer', '700 20px Barlow', 'italic 700 20px Barlow', '600 20px Letter'].map(f => document.fonts.load(f));
  Promise.all([...imgs, ...fonts, document.fonts.ready]).then(() => {
    const q = new URLSearchParams(location.search).get('p');
    built = false; fit(); built = true;
    const start = q ? Math.max(0, PAGES.findIndex(d => d.id === q)) : 0;
    render(start);
    gsap.to('#loader', {opacity: 0, duration: .4, onComplete() { document.getElementById('loader').remove(); }});
    gsap.to(stage, {opacity: 1, duration: .5});
    window.__book = {go, get cur() { return cur; }, get index() { return index; }, render};
  });
})();
