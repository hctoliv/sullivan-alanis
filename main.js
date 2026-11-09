/* Sullivan & Alanis — interações do site. Contato só pelo Direct do Instagram. */

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;

  /* ---------- sem zoom no celular (pinça e toque duplo) ---------- */
  ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) =>
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  if (motion) {
    root.classList.add('js-motion');
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- rolagem suave ---------- */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: el.id === 'topo' ? 0 : -10, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  /* ---------- menu ---------- */
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && motion) gsap.from('#menu nav a', { y: 40, opacity: 0, stagger: .05, duration: .6, ease: 'power3.out' });
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      if (!menu.hidden) setMenu(false);
      scrollToEl(target);
    });
  });

  /* ---------- nav sólida / escondida ---------- */
  const nav = $('#nav');
  let lastY = 0;
  const onScrollNav = (y) => {
    nav.classList.toggle('is-solid', y > 40);
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    if (goingDown && y > innerHeight * 1.2 && menu.hidden) nav.classList.add('is-hidden');
    else if (goingUp) nav.classList.remove('is-hidden');
    lastY = y;
  };
  if (lenis) lenis.on('scroll', ({ scroll }) => onScrollNav(scroll));
  else addEventListener('scroll', () => onScrollNav(scrollY), { passive: true });

  const navLinks = $$('.nav__links a');
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['sessao', 'dupla', 'musicas', 'trajetoria', 'reels', 'clipes', 'shows'].forEach((id) => {
    const el = document.getElementById(id); if (el) sectionIO.observe(el);
  });

  /* ---------- vídeos e som ---------- */
  const videos = $$('video');
  const soundButtons = $$('[data-video]');
  $('#heroSound').dataset.video = 'heroVideo';
  soundButtons.push($('#heroSound'));

  const refreshSoundUI = () => {
    soundButtons.forEach((b) => {
      const v = document.getElementById(b.dataset.video);
      const on = v && !v.muted && !v.paused;
      b.setAttribute('aria-pressed', String(!!on));
      const lbl = b.querySelector('.lbl, .sound__txt');
      if (lbl) lbl.textContent = on ? 'Desligar som' : (b.id === 'heroSound' ? 'Ligar som' : 'Ouvir com som');
      if (b.classList.contains('track__play')) b.setAttribute('aria-label', on ? 'Pausar Oitava Maravilha' : 'Tocar trecho de Oitava Maravilha');
    });
  };
  const muteAll = (except) => videos.forEach((v) => { if (v !== except) v.muted = true; });
  const toggleSound = (v) => {
    if (!v) return;
    if (v.muted || v.paused) {
      muteAll(v);
      v.muted = false;
      v.play().catch(() => {});
    } else {
      v.muted = true;
    }
    refreshSoundUI();
  };
  soundButtons.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSound(document.getElementById(b.dataset.video));
  }));
  // tocar no próprio vídeo também liga/desliga o som
  $$('.phone').forEach((ph) => ph.addEventListener('click', () => toggleSound(ph.querySelector('video'))));
  videos.forEach((v) => ['play', 'pause', 'volumechange'].forEach((ev) => v.addEventListener(ev, refreshSoundUI)));

  // toca só o que está na tela
  const videoIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) v.play().catch(() => {});
      else { v.pause(); v.muted = true; }
    });
  }, { threshold: 0.15 });
  videos.forEach((v) => videoIO.observe(v));

  // mantém o fundo do hero e o vídeo dentro do logo no mesmo quadro
  const heroBg = $('.hero__bg');
  const heroFg = $('#heroVideo');
  setInterval(() => {
    if (heroFg.paused || heroBg.paused) return;
    if (Math.abs(heroFg.currentTime - heroBg.currentTime) > 0.12) heroBg.currentTime = heroFg.currentTime;
  }, 600);

  /* ---------- hero: mergulho na letra ---------- */
  const stage = $('.hero__stage');
  const AR = 1064 / 298;          // proporção do logo
  const U = 0.6457, V = 0.6007;   // ponto mais grosso do traço (no "A" de ALANIS)
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const easeIn = (t) => t * t * t;

  const layoutMask = (p) => {
    const vw = stage.clientWidth, vh = stage.clientHeight;
    const W0 = Math.min(vw * (vw < 600 ? 0.9 : 0.84), 1120);
    const H0 = W0 / AR;
    const left0 = (vw - W0) / 2;
    const top0 = vh * (vw < 600 ? 0.44 : 0.47) - H0 / 2;
    const z = clamp(p / 0.85, 0, 1);
    const e = easeIn(z);
    const s = Math.pow(34, e);
    const W = W0 * s, H = W / AR;
    const px = left0 + U * W0 + (vw / 2 - (left0 + U * W0)) * e;
    const py = top0 + V * H0 + (vh / 2 - (top0 + V * H0)) * e;
    stage.style.setProperty('--mw', W + 'px');
    stage.style.setProperty('--mx', (px - U * W) + 'px');
    stage.style.setProperty('--my', (py - V * H) + 'px');
    const reveal = clamp((p - 0.35) / 0.5, 0, 1);
    stage.style.setProperty('--bgb', (0.3 + reveal * 0.82).toFixed(3));
    stage.style.setProperty('--bgblur', (10 * (1 - reveal)).toFixed(2) + 'px');
    heroBg.style.transform = `scale(${(1.12 - 0.12 * reveal).toFixed(4)})`;
    heroBg.style.filter = `brightness(${(0.3 + reveal * 0.82).toFixed(3)}) saturate(${(0.85 + reveal * 0.3).toFixed(3)}) blur(${(10 * (1 - reveal)).toFixed(2)}px)`;
  };
  let heroProgress = 0;
  layoutMask(0);
  addEventListener('resize', () => layoutMask(heroProgress));

  if (motion) {
    ScrollTrigger.create({
      trigger: '#hero', start: 'top top', end: 'bottom bottom', scrub: true,
      onUpdate: (self) => { heroProgress = self.progress; layoutMask(heroProgress); },
    });
    gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '25% top', scrub: true } })
      .to('.hero__bottom, .hero__top', { opacity: 0, y: -30, ease: 'none' }, 0)
      .to('.hero__cue', { opacity: 0, ease: 'none' }, 0)
      .to('.hero__sweep', { opacity: 0, ease: 'none' }, 0);
    gsap.to('.hero__shade', { opacity: .35, ease: 'none', scrollTrigger: { trigger: '#hero', start: '40% top', end: 'bottom bottom', scrub: true } });

    // entrada
    gsap.from('.hero__mask', { scale: 1.08, opacity: 0, duration: 1.6, ease: 'power3.out' });
    gsap.from('.hero__top > *, .hero__claim, .hero__ctas > *, .sound', { y: 24, opacity: 0, duration: 1, stagger: .08, delay: .35, ease: 'power3.out' });
  }

  /* ---------- reveals ---------- */
  if (motion) {
    $$('.reveal').forEach((el) => {
      gsap.from(el, { y: 50, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('.member, .track, .facts li, .pitch li, .platforms a').forEach((el, i) => {
      gsap.from(el, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', delay: (i % 3) * .06, scrollTrigger: { trigger: el, start: 'top 92%' } });
    });
    $$('.member__img img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 4, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    gsap.from('.duo__amp', { rotate: -25, scale: .6, opacity: 0, duration: 1.2, ease: 'back.out(1.6)', scrollTrigger: { trigger: '.duo', start: 'top 70%' } });
    gsap.fromTo('.cover', { rotate: 18, y: 60 }, { rotate: 5, y: 0, ease: 'none', scrollTrigger: { trigger: '.musicas', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.from('.footer__logo', { yPercent: 40, opacity: 0, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: '.footer', start: 'top 85%' } });
  }

  /* ---------- números ---------- */
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count;
    if (!motion) return;
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' },
      onUpdate: () => { el.textContent = Math.round(o.v); } });
  });

  /* ---------- marquee + filmstrip, acelerando com a rolagem ---------- */
  if (motion) {
    const loop = (sel, dur, dir) => gsap.fromTo(sel,
      { xPercent: dir > 0 ? 0 : -50 },
      { xPercent: dir > 0 ? -50 : 0, duration: dur, ease: 'none', repeat: -1 });
    const mq = loop('#marquee', 26, 1);
    const fs = loop('#film', 50, -1); // o filme anda pro lado oposto
    let boost = 1;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.abs(self.getVelocity()) / 400;
        boost = Math.min(5, 1 + v);
        gsap.to([mq, fs], { timeScale: boost, duration: .2, overwrite: true });
        gsap.to([mq, fs], { timeScale: 1, duration: 1, delay: .25 });
      },
    });
  }

  /* ---------- trajetória: horizontal no desktop ---------- */
  const rail = $('#rail');
  const bar = $('#trajBar');
  if (motion) {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      root.classList.add('is-wide');
      const dist = () => Math.max(0, rail.scrollWidth - innerWidth);
      const tw = gsap.to(rail, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '#trajetoria', pin: true, start: 'top top', end: () => '+=' + dist(), scrub: 1,
          invalidateOnRefresh: true, onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
        },
      });
      ScrollTrigger.refresh();
      return () => { root.classList.remove('is-wide'); tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(rail, { clearProps: 'x' }); };
    });
  }
  rail.addEventListener('scroll', () => {
    const max = rail.scrollWidth - rail.clientWidth;
    bar.style.transform = `scaleX(${max > 0 ? rail.scrollLeft / max : 0})`;
  }, { passive: true });

  /* ---------- cursor, tilt e botões magnéticos ---------- */
  if (finePointer && !reduce) {
    root.classList.add('has-cursor');
    const cur = $('.cursor');
    const dot = $('.cursor__dot');
    const ring = $('.cursor__ring');
    const label = $('.cursor__label');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const t = e.target.closest('[data-cursor], a, button, label, input');
      const lab = t && t.closest('[data-cursor]');
      cur.classList.toggle('is-label', !!lab && !e.target.closest('button, a'));
      cur.classList.toggle('is-link', !!t && !cur.classList.contains('is-label'));
      if (lab) {
        const v = lab.querySelector('video') || document.getElementById('heroVideo');
        label.textContent = v && !v.muted ? 'mudo' : 'som';
      }
    });
    const tick = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    };
    tick();

    if (hasGsap) {
      $$('.tilt').forEach((el) => {
        const rxTo = gsap.quickTo(el, 'rotationX', { duration: .6, ease: 'power3.out' });
        const ryTo = gsap.quickTo(el, 'rotationY', { duration: .6, ease: 'power3.out' });
        gsap.set(el, { transformPerspective: 900 });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          ryTo(((e.clientX - r.left) / r.width - .5) * 10);
          rxTo(-((e.clientY - r.top) / r.height - .5) * 10);
        });
        el.addEventListener('pointerleave', () => { rxTo(0); ryTo(0); });
      });
      $$('.magnetic').forEach((el) => {
        const xTo = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });
        el.addEventListener('pointermove', (e) => {
          const r = el.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * .3);
          yTo((e.clientY - r.top - r.height / 2) * .4);
        });
        el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
      });
    }
  }

  /* ---------- pedido de show ---------- */
  const form = $('#booking');
  const msgEl = $('#msg');
  const note = $('#copyNote');
  $('#ticketNo').textContent = 'Nº ' + String(Math.floor(1000 + Math.random() * 9000));
  const tipos = {
    rodeio: 'um rodeio', festa: 'uma festa', casamento: 'um casamento',
    'bar ou casa de show': 'um bar ou casa de show', formatura: 'uma formatura', 'outro tipo de evento': '',
  };
  const val = (id) => $(id).value.trim();
  const buildMsg = () => {
    const nome = val('#f-nome');
    const evento = val('#f-evento');
    const cidade = val('#f-cidade');
    let data = val('#f-data');
    if (/combinar/i.test(data)) data = '';
    const tipoInput = $('input[name="tipo"]:checked');
    const tipo = tipoInput ? tipos[tipoInput.value] : '';
    let m = 'Olá, Sullivan & Alanis!';
    if (nome) m += ` Aqui é ${nome}.`;
    m += ' Quero levar o show de vocês ';
    m += evento ? `para o evento "${evento}"` : 'para o meu evento';
    if (tipo) m += ` (${tipo})`;
    if (cidade) m += ` em ${cidade}`;
    m += data ? `, no dia ${data}.` : ', com data a combinar.';
    m += '\nPodemos conversar sobre disponibilidade e valores?';
    return m;
  };
  const render = () => {
    const m = buildMsg();
    msgEl.textContent = m;
    note.classList.remove('is-ok');
    note.innerHTML = 'Copie a mensagem e mande no Direct do <b>@sullivanealanis</b>.';
  };
  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const m = buildMsg();
    const ok = () => { note.classList.add('is-ok'); note.textContent = 'Mensagem copiada. Agora é só colar no Direct do @sullivanealanis.'; };
    const fallback = () => {
      const r = document.createRange(); r.selectNodeContents(msgEl);
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
      note.classList.add('is-ok');
      note.textContent = 'Não consegui copiar sozinho: a mensagem ficou selecionada, é só copiar.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(ok, fallback);
    else fallback();
  });
  render();

  addEventListener('load', () => { if (hasGsap) ScrollTrigger.refresh(); });
})();
