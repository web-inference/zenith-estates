/* =========================================================
   ZENITH ESTATES — motion layer
   GSAP 3.13 (ScrollTrigger, SplitText) + Lenis
   ========================================================= */
document.fonts.ready.then(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isDesktop = () => matchMedia("(min-width: 1001px)").matches;

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      lenis ? lenis.scrollTo(target, { duration: 1.6 }) : target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    })
  );

  /* ---------------- mouse (smoothed, -0.5..0.5) ---------------- */
  const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  addEventListener("pointermove", (e) => {
    mouse.x = e.clientX / innerWidth - 0.5;
    mouse.y = e.clientY / innerHeight - 0.5;
  });
  gsap.ticker.add(() => {
    mouse.sx += (mouse.x - mouse.sx) * 0.06;
    mouse.sy += (mouse.y - mouse.sy) * 0.06;
  });

  /* ---------------- twinkling starfield ---------------- */
  function starfield(canvas) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w = 0, h = 0, stars = [], visible = false, raf = 0;
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 5200);
      stars = Array.from({ length: n }, () => {
        const big = Math.random() > 0.94;
        return {
          x: Math.random() * w, y: Math.random() * h,
          r: big ? Math.random() * 1.1 + 0.9 : Math.random() * 0.8 + 0.2,
          p: Math.random() * Math.PI * 2, s: Math.random() * 1.8 + 0.4,
          d: Math.random() * 0.8 + 0.2, big,
        };
      });
      if (reduce) draw(0);
    };
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      const ox = mouse.sx * 26, oy = mouse.sy * 26;
      for (const s of stars) {
        const a = reduce ? 0.8 : 0.3 + 0.7 * Math.abs(Math.sin(s.p + t * 0.001 * s.s));
        const x = s.x - ox * s.d, y = s.y - oy * s.d;
        if (s.big) {
          ctx.globalAlpha = a * 0.18;
          ctx.fillStyle = "#efe6d8";
          ctx.beginPath(); ctx.arc(x, y, s.r * 3.2, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = a;
        ctx.fillStyle = "#f6efe4";
        ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.2832); ctx.fill();
      }
      if (visible && !reduce) raf = requestAnimationFrame(draw);
    }
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(draw);
    }).observe(canvas);
  }
  $$(".stars").forEach(starfield);

  /* ---------------- cursor + magnetic ---------------- */
  if (finePointer && !reduce) {
    const cur = $(".cursor"), label = $(".cursor__label");
    const xTo = gsap.quickTo(cur, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.35, ease: "power3" });
    addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); gsap.to(cur, { opacity: 1, duration: 0.3 }); }, { once: false });
    const size = (s, txt) => gsap.to(cur, { width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2, duration: 0.45, ease: "power3.out", overwrite: "auto" }) && gsap.to(label, { opacity: txt ? 1 : 0, duration: 0.2 });
    $$("[data-cursor='view']").forEach((el) => {
      el.addEventListener("pointerenter", () => size(84, true));
      el.addEventListener("pointerleave", () => size(10, false));
    });
    $$("a, button").forEach((el) => {
      if (el.closest("[data-cursor='view']")) return;
      el.addEventListener("pointerenter", () => size(34, false));
      el.addEventListener("pointerleave", () => size(10, false));
    });
    document.addEventListener("pointerleave", () => gsap.to(cur, { opacity: 0 }));

    $$("[data-magnetic]").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const my = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.25);
        my((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" }));
    });
  } else {
    $(".cursor").remove();
  }

  /* ---------------- preloader → hero intro ---------------- */
  const heroWord = new SplitText(".hero__word-in", { type: "chars", mask: "chars" });

  function heroIntro() {
    if (reduce) return;
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .from(".hero__day", { xPercent: -18, duration: 2 }, 0)
      .from(".hero__bar", { scaleX: 0, duration: 1.6 }, 0.2)
      .from(".hero__eclipse", { scale: 0, duration: 1.4, ease: "back.out(1.6)" }, 0.5)
      .from(heroWord.chars, { yPercent: 115, duration: 1.4, stagger: 0.06 }, 0.25)
      .from(".hero__word sup", { scale: 0, rotate: -180, duration: 1.2 }, 0.8)
      .from([".hero__tag", ".hero__sub", ".hero__list li", ".hero__scroll", ".header"], { y: 26, opacity: 0, filter: "blur(8px)", duration: 1.2, stagger: 0.06 }, 0.6);
  }

  const loader = $("#loader");
  if (reduce) {
    loader.remove();
  } else {
    const n = { v: 0 }, num = $("#loaderNum");
    gsap.timeline({ onComplete: () => { loader.remove(); lenis && lenis.start(); } })
      .to(n, { v: 100, duration: 1.8, ease: "power2.inOut", onUpdate: () => (num.textContent = String(Math.round(n.v)).padStart(3, "0")) }, 0)
      .to(".loader__shadow", { x: "110%", duration: 1.8, ease: "power2.inOut" }, 0)
      .to(".loader__orb", { scale: 0.2, opacity: 0, duration: 0.6, ease: "power3.in" }, 1.8)
      .to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, 2.1)
      .add(heroIntro, 2.35);
  }
  if (!lenis) document.documentElement.style.overflowY = "";

  /* =========================================================
     SCROLL SCENES (skip all heavy motion on reduced motion)
     ========================================================= */
  if (!reduce) {
    /* --- 01 hero: pinned, white world slides over it --- */
    ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top", pin: true, pinSpacing: false, refreshPriority: 10 });
    gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".hero__day", { xPercent: -22, scale: 0.92, ease: "none" }, 0)
      .to(".hero__bar", { scaleX: 0.15, ease: "none" }, 0)
      .to(".hero__eclipse", { y: -120, x: -60, ease: "none" }, 0)
      .to(".hero__word", { yPercent: -40, ease: "none" }, 0)
      .to([".hero__tag", ".hero__sub", ".hero__list"], { y: -80, opacity: 0, ease: "none" }, 0);
    gsap.ticker.add(() => {
      gsap.set(".hero__eclipse span", { x: mouse.sx * -18, y: mouse.sy * -18 });
    });

    /* --- space backgrounds: slow parallax --- */
    $$(".space").forEach((sec) => {
      const bg = $(".space__bg", sec);
      if (sec.id === "hero") return;
      gsap.fromTo(bg, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: sec, start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* --- blur-rise section titles --- */
    $$(".big-title").forEach((el) => {
      if (el.classList.contains("plans__title")) return;
      gsap.fromTo(el,
        { yPercent: 60, opacity: 0, filter: "blur(18px)", scale: 0.94, transformOrigin: el.classList.contains("big-title--center") ? "50% 100%" : "0% 100%" },
        { yPercent: 0, opacity: 1, filter: "blur(0px)", scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top 100%", end: "top 50%", scrub: true } });
    });

    /* --- generic fade-up reveals --- */
    const revealSel = [".stat", ".about .col-label", ".about__brand", ".person", ".srv", ".services__cta .col-main", ".props__count", ".place", ".rv", ".reviews__foot .col-main", ".chart", ".res", ".post", ".journal__lead", ".faq__side", ".qa", ".faq__more", ".contact__reach", ".contact__cols > *", ".journal__more", ".props__cta"];
    $$(revealSel.join(",")).forEach((el) => gsap.set(el, { y: 50, opacity: 0 }));
    ScrollTrigger.batch(revealSel.join(","), {
      start: "top 90%", once: true,
      onEnter: (b) => gsap.to(b, { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08 }),
    });

    /* --- word-by-word highlight --- */
    $$("[data-highlight]").forEach((p) => {
      const split = new SplitText(p, { type: "words", wordsClass: "w" });
      gsap.to(split.words, { color: "#0b0b0b", stagger: 0.1, ease: "none", scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 50%", scrub: true } });
    });

    /* --- 05 properties: stacked cards --- */
    const cards = $$(".card"), dates = $$(".date"), agents = $$(".stack__agents img");
    let activeDate = 0;
    const setDate = (i) => {
      if (i === activeDate) return;
      const dir = i > activeDate ? 1 : -1;
      dates.forEach((d, k) => k !== i && gsap.to(d, { y: k < i ? -24 : 24, opacity: 0, duration: 0.4, ease: "power3.out", overwrite: true }));
      gsap.fromTo(dates[i], { y: 24 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", overwrite: true });
      agents.forEach((a, k) => gsap.to(a, { filter: k === i ? "grayscale(0) brightness(1)" : "grayscale(1) brightness(.85)", scale: k === i ? 1.12 : 1, duration: 0.5 }));
      activeDate = i;
    };
    dates.forEach((d, k) => { d.classList.remove("is-active"); gsap.set(d, { opacity: k ? 0 : 1, y: 0 }); });
    agents.forEach((a, k) => gsap.set(a, { filter: k ? "grayscale(1) brightness(.85)" : "grayscale(0) brightness(1)", scale: k ? 1 : 1.12 }));
    gsap.set(cards.slice(1), { yPercent: 140 });
    const stackTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#stack", start: "top top", end: () => "+=" + (cards.length - 1) * innerHeight * 0.85,
        pin: true, scrub: 1, anticipatePin: 1, refreshPriority: 9, invalidateOnRefresh: true,
        onUpdate: (self) => setDate(Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)))),
      },
    });
    cards.forEach((c, i) => {
      if (!i) return;
      stackTl
        .to(c, { yPercent: 0, ease: "none", duration: 1 }, i - 1)
        .fromTo($("img", c), { yPercent: -10 }, { yPercent: 0, ease: "none", duration: 1 }, i - 1)
        .to(cards[i - 1], { scale: 0.9, filter: "brightness(0.4)", ease: "none", duration: 1 }, i - 1);
    });
    gsap.from(".stack__cards", { scale: 0.86, opacity: 0, ease: "none", scrollTrigger: { trigger: "#stack", start: "top 95%", end: "top 20%", scrub: true } });

    /* --- 06 places: horizontal pinned scroll (desktop) --- */
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1001px)", () => {
      const track = $(".places__track");
      const dist = () => track.scrollWidth - innerWidth;
      gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".places__pin", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, refreshPriority: 8, invalidateOnRefresh: true },
      });
      $$(".place__img img").forEach((img) => gsap.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".places__pin", start: "top bottom", end: () => "+=" + (dist() + innerHeight), scrub: true } }));
    });

    /* --- 07 plans: planet rises, shrinks, opens into price orbs --- */
    gsap.timeline({ scrollTrigger: { trigger: ".plans__intro", start: "top bottom", end: "top top", scrub: true } })
      .fromTo(".planet", { y: "55vh", scale: 1.7 }, { y: "18vh", scale: 1, ease: "none" }, 0)
      .fromTo(".plans__title", { yPercent: 80, opacity: 0, filter: "blur(18px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", ease: "none" }, 0.3);
    gsap.timeline({ scrollTrigger: { trigger: ".plans__intro", start: "top top", end: "bottom bottom", scrub: true } })
      .to(".plans__title", { y: "-34vh", opacity: 0.0, ease: "none" }, 0)
      .to(".planet", { y: "-6vh", scale: 0.28, ease: "none" }, 0)
      .to(".planet", { opacity: 0, ease: "none", duration: 0.25 }, 0.75);
    $$(".orb--plan").forEach((orb) => {
      gsap.timeline({ scrollTrigger: { trigger: orb, start: "top 85%", once: true } })
        .from(orb, { scale: 0.3, duration: 1.2, ease: "expo.out" })
        .fromTo($("img", orb), { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)", duration: 1.2, ease: "expo.inOut" }, 0.1)
        .from($("em", orb), { x: 40, opacity: 0, duration: 1, ease: "expo.out" }, 0.6)
        .from(orb.parentElement.querySelector(".price"), { y: 40, opacity: 0, duration: 1, ease: "expo.out" }, 0.3);
    });
    $$(".plan").forEach((plan) => {
      gsap.from($$(".plan__label, .plus-list li, .plan__foot", plan), { y: 30, opacity: 0, stagger: 0.07, duration: 1, ease: "expo.out", scrollTrigger: { trigger: plan, start: "top 80%", once: true } });
    });

    /* --- 08 reviews: floating parallax --- */
    $$("[data-speed]").forEach((el) => {
      const s = parseFloat(el.dataset.speed);
      gsap.fromTo(el, { y: (1 - s) * -260 }, { y: (1 - s) * 260, ease: "none", scrollTrigger: { trigger: ".reviews__field", start: "top bottom", end: "bottom top", scrub: true } });
    });

    /* --- 09 charts draw in --- */
    const C = 2 * Math.PI * 44, segs = $$(".seg");
    const total = segs.reduce((s, c) => s + +c.dataset.v, 0);
    let acc = 0;
    segs.forEach((c) => {
      const len = (+c.dataset.v / total) * C;
      gsap.set(c, { attr: { "stroke-dasharray": `0 ${C}`, "stroke-dashoffset": -acc } });
      c._len = len; acc += len;
    });
    ScrollTrigger.create({
      trigger: ".donut", start: "top 80%", once: true,
      onEnter: () => segs.forEach((c, i) => gsap.to(c, { attr: { "stroke-dasharray": `${c._len - 1.5} ${C}` }, duration: 1.1, delay: i * 0.35, ease: "power3.inOut" })),
    });
    gsap.from(".bar b", { opacity: 0, y: 10, duration: 0.6, stagger: 0.1, delay: 0.7, scrollTrigger: { trigger: ".bars", start: "top 80%", once: true } });
  }

  /* --- bars: real fill elements (also used without motion) --- */
  $$(".bar").forEach((b) => { const f = document.createElement("i"); f.className = "bar__fill"; b.prepend(f); });
  if (!reduce) {
    gsap.set(".bar__fill", { scaleY: 0 });
    ScrollTrigger.create({ trigger: ".bars", start: "top 80%", once: true, onEnter: () => gsap.to(".bar__fill", { scaleY: 1, duration: 1.3, stagger: 0.1, ease: "expo.out" }) });
  }

  /* --- dot matrix --- */
  const dg = $(".dotsgrid"), on = +dg.dataset.on;
  const dots = Array.from({ length: 35 }, () => dg.appendChild(document.createElement("i")));
  if (reduce) dots.slice(0, on).forEach((d) => d.classList.add("on"));
  else {
    gsap.set(dots, { scale: 0 });
    ScrollTrigger.create({
      trigger: dg, start: "top 80%", once: true,
      onEnter: () => gsap.timeline()
        .to(dots, { scale: 1, duration: 0.5, ease: "back.out(2)", stagger: { each: 0.015, from: "start" } })
        .to(dots.slice(0, on), { backgroundColor: "#0b0b0b", duration: 0.2, stagger: 0.05 }, 0.4),
    });
  }

  /* --- count-up numbers --- */
  $$("[data-count]").forEach((el) => {
    const to = +el.dataset.count, from = +(el.dataset.from || 0);
    if (reduce) { el.textContent = to; return; }
    const o = { v: from };
    el.textContent = from;
    ScrollTrigger.create({
      trigger: el, start: "top 88%", once: true,
      onEnter: () => gsap.to(o, { v: to, duration: 2.2, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  /* ---------------- accordions (services + faq) ---------------- */
  function accordion(items, headSel, bodySel) {
    items.forEach((item) => {
      const head = $(headSel, item), body = $(bodySel, item);
      head.addEventListener("click", () => {
        const opening = !item.classList.contains("is-open");
        items.forEach((o) => {
          if (o !== item && o.classList.contains("is-open")) {
            o.classList.remove("is-open");
            $(headSel, o).setAttribute("aria-expanded", "false");
            gsap.to($(bodySel, o), { height: 0, duration: reduce ? 0 : 0.7, ease: "expo.inOut" });
          }
        });
        item.classList.toggle("is-open", opening);
        head.setAttribute("aria-expanded", String(opening));
        gsap.fromTo(body, { height: body.offsetHeight }, {
          height: opening ? "auto" : 0, duration: reduce ? 0 : 0.8, ease: "expo.inOut",
          onComplete: () => ScrollTrigger.refresh(),
        });
        const orb = $(".orb", body);
        if (opening && orb && !reduce) gsap.fromTo(orb, { rotate: -60, scale: 0.6 }, { rotate: 0, scale: 1, duration: 1.2, ease: "expo.out", delay: 0.1 });
      });
    });
  }
  accordion($$(".srv"), ".srv__head", ".srv__body");
  accordion($$(".qa"), ".qa__q", ".qa__a");

  /* ---------------- testimonials slider ---------------- */
  const quotes = [
    { q: "They staged, photographed and sold our villa 11% above asking. The whole process felt calm from start to finish.", n: "Margaret Hale", r: "Sold in Positano", img: "images/client-02.jpg" },
    { q: "Zenith found us a chalet that was never listed publicly. Three viewings, one offer, keys in five weeks.", n: "Daniel Brooks", r: "Bought in Zermatt", img: "images/client-01.jpg" },
    { q: "Their market data changed how I build my portfolio. Every recommendation has paid off, quietly and consistently.", n: "Clara Byrne", r: "Investor, Dublin", img: "images/client-03.jpg" },
  ];
  let qi = 0, qBusy = false;
  const qText = $(".rv__q"), qWho = $("#rvMainWho");
  function showQuote(dir) {
    if (qBusy) return; qBusy = true;
    qi = (qi + dir + quotes.length) % quotes.length;
    const d = quotes[qi];
    gsap.timeline({ onComplete: () => (qBusy = false) })
      .to([qText, qWho], { y: -20 * dir, opacity: 0, filter: "blur(6px)", duration: reduce ? 0 : 0.4, ease: "power2.in" })
      .add(() => {
        qText.textContent = d.q;
        qWho.innerHTML = `<img src="${d.img}" alt=""><span><b>${d.n}</b>${d.r}</span>`;
      })
      .fromTo([qText, qWho], { y: 20 * dir, opacity: 0, filter: "blur(6px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: reduce ? 0 : 0.8, ease: "expo.out", stagger: 0.08 });
  }
  $("#rvNext").addEventListener("click", () => showQuote(1));
  $("#rvPrev").addEventListener("click", () => showQuote(-1));

  /* ---------------- team orbit ---------------- */
  const team = [
    { n: "Mia Lennox", r: "Head of Listings", img: "images/team-01.jpg", q: "A great home doesn't just look good. It solves problems, tells a story, and leaves a lasting impression. I make sure every listing does exactly that." },
    { n: "Adrian Vale", r: "Founder", img: "images/team-founder.jpg", q: "Twenty years in, I still believe the best homes are found, not searched for. We listen first, then we go looking." },
    { n: "Marco Bellini", r: "Partner, Europe", img: "images/team-02.jpg", q: "From the Amalfi Coast to the Alps, I know who is selling before the market does. That's what our clients pay for." },
    { n: "Elena Cruz", r: "Partner, Americas", img: "images/team-03.jpg", q: "Buying from abroad should feel effortless. I handle everything on the ground so you only need to arrive." },
    { n: "Theo Laurent", r: "Investment Analyst", img: "images/team-04.jpg", q: "Good architecture is the most underrated asset class. The numbers back it up, every single year." },
    { n: "Sofia Lind", r: "Client Advisor", img: "images/team-05.jpg", q: "My job is to answer the question before you ask it, and to make the day you get the keys feel easy." },
  ];
  const track = $("#orbit");
  const planets = team.map((m, i) => {
    const el = document.createElement("button");
    el.className = "planet-m";
    el.setAttribute("aria-label", `${m.n}, ${m.r}`);
    el.innerHTML = `<img src="${m.img}" alt=""><span class="phase"></span>`;
    el.addEventListener("click", () => setMember(i));
    track.appendChild(el);
    return el;
  });
  let active = 0;
  const sizeFor = (d) => [1, 0.36, 0.26, 0.17, 0.1, 0.07][Math.min(Math.abs(d), 5)];
  function layout(instant) {
    const w = track.clientWidth, base = 240;
    const big = Math.min(240, w * 0.42);
    const k = big / base;
    const xs = [0, 0.25, 0.38, 0.47, 0.53, 0.57];
    planets.forEach((p, i) => {
      const d = i - active, ad = Math.min(Math.abs(d), 5);
      const x = -w * 0.12 + Math.sign(d) * xs[ad] * w * (d < 0 ? 0.7 : 1);
      gsap.to(p, {
        x, scale: sizeFor(d) * k, zIndex: 10 - ad, duration: instant || reduce ? 0 : 1.2, ease: "expo.inOut",
      });
      gsap.to($("img", p), { filter: d === 0 ? "grayscale(0)" : "grayscale(1)", duration: 0.8 });
      gsap.to($(".phase", p), {
        xPercent: d === 0 ? 108 : 0, opacity: d === 0 ? 1 : ad <= 2 ? 0 : 1,
        duration: instant || reduce ? 0 : d === 0 ? 1.6 : 0.6, ease: d === 0 ? "power3.inOut" : "power2.out", delay: d === 0 && !instant ? 0.35 : 0,
      });
    });
  }
  function setMember(i) {
    if (i === active) return;
    active = (i + team.length) % team.length;
    layout(false);
    const m = team[active];
    gsap.timeline()
      .to(".orbit__name, .orbit__quote", { opacity: 0, y: -14, duration: reduce ? 0 : 0.35, ease: "power2.in" })
      .add(() => { $("#tmName").textContent = m.n; $("#tmRole").textContent = m.r; $("#tmQuote").textContent = m.q; })
      .fromTo(".orbit__name, .orbit__quote", { y: 14 }, { opacity: 1, y: 0, duration: reduce ? 0 : 0.8, ease: "expo.out", stagger: 0.08 });
  }
  $(".orbit__next").addEventListener("click", () => setMember(active + 1));
  $(".orbit__prev").addEventListener("click", () => setMember(active - 1));
  layout(true);
  addEventListener("resize", () => layout(true));
  if (!reduce) {
    // planets start as plain white discs scattered off-screen, then arrive and the active one shows its crescent face
    gsap.set($$(".phase"), { xPercent: 0, opacity: 1 });
    gsap.set(planets, { opacity: 0 });
    gsap.set(".orbit__name, .orbit__quote", { opacity: 0, y: 20 });
    ScrollTrigger.create({
      trigger: ".orbit", start: "top 75%", once: true,
      onEnter: () => {
        gsap.fromTo(planets, { y: 260, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: "expo.out", stagger: 0.08 });
        gsap.delayedCall(0.6, () => layout(false));
        gsap.to(".orbit__name, .orbit__quote", { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.1, delay: 1.4 });
      },
    });
  }

  /* ---------------- journal: pixel-step reveal ---------------- */
  $$(".pix").forEach((pix) => {
    const g = document.createElement("div");
    g.className = "pix__grid";
    for (let i = 0; i < 36; i++) g.appendChild(document.createElement("i"));
    pix.appendChild(g);
    if (reduce) { g.remove(); return; }
    ScrollTrigger.create({
      trigger: pix, start: "top 85%", once: true,
      onEnter: () => {
        gsap.to($$("i", g), { opacity: 0, duration: 0.01, stagger: { each: 0.035, from: "random" } });
        gsap.from($("img", pix), { scale: 1.4, duration: 1.8, ease: "expo.out" });
      },
    });
  });

  /* ---------------- contact + footer ---------------- */
  if (!reduce) {
    const ct = new SplitText(".contact__title", { type: "lines", mask: "lines" });
    gsap.from(ct.lines, { yPercent: 110, duration: 1.4, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: ".contact__title", start: "top 85%", once: true } });
    gsap.fromTo(".contact__img", { clipPath: "inset(14% 22% 14% 22% round 200px)" }, { clipPath: "inset(0% 0% 0% 0% round 4px)", ease: "none", scrollTrigger: { trigger: ".contact__img", start: "top 95%", end: "top 25%", scrub: true } });
    gsap.fromTo(".contact__img img", { yPercent: -16 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".contact__img", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo(".footer__word", { yPercent: 100 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".footer__mega", start: "top bottom", end: "bottom bottom", scrub: true } });
  }

  const form = $("#subForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = $(".sub__msg", form);
    if (!form.name.value.trim() || !/^\S+@\S+\.\S+$/.test(form.email.value)) { msg.textContent = "Please add your name and a valid email."; return; }
    msg.textContent = `Thank you, ${form.name.value.trim()}. New listings are on their way.`;
    form.reset();
  });

  if (document.readyState === "complete") ScrollTrigger.refresh();
  else addEventListener("load", () => ScrollTrigger.refresh());
});
