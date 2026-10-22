(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  // Intro: some assim que a página carrega (com limite de segurança)
  var intro = $("#intro");
  if (intro) {
    var hide = function () { intro.classList.add("is-done"); };
    if (reduce) hide(); else window.addEventListener("load", function () { setTimeout(hide, 650); });
    setTimeout(hide, 2600);
  }

  // Cabeçalho e menu
  var header = $(".header");
  var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 10); };
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  var burger = $(".burger"), drawer = $("#drawer");
  var setMenu = function (open) {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    drawer.classList.toggle("is-open", open);
  };
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  $$("#drawer a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 1060) setMenu(false); });

  // Revelar ao rolar
  $$("[data-stagger]").forEach(function (list) {
    Array.prototype.forEach.call(list.children, function (el, i) { el.style.setProperty("--i", i); });
  });
  var items = $$("[data-reveal]");
  if (hasIO && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        $$(".fx", e.target).concat(e.target.classList.contains("fx") ? [e.target] : []).forEach(function (f) {
          f.style.setProperty("--fxh", f.offsetHeight + "px");
        });
        e.target.classList.add("is-in"); io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
    $$("[data-stagger]").forEach(function (el) { if (!el.closest("[data-reveal]")) io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-in"); });
    $$("[data-stagger]").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Seções: varredura laranja + rótulos que se "decodificam"
  var GLYPHS = "01<>/#_[]{}=+*";
  var decode = function (el) {
    if (el.dataset.decoded) return;
    el.dataset.decoded = "1";
    var final = el.textContent, len = final.length, frame = 0, total = 18;
    el.setAttribute("aria-label", final);
    el.classList.add("is-decoding");
    var tick = function () {
      frame++;
      var done = Math.floor((frame / total) * len), out = "";
      for (var i = 0; i < len; i++) {
        var c = final[i];
        out += i < done || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (frame < total) requestAnimationFrame(tick);
      else { el.textContent = final; el.classList.remove("is-decoding"); el.removeAttribute("aria-label"); }
    };
    requestAnimationFrame(tick);
  };
  if (hasIO && !reduce) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var sec = e.target;
        sec.style.setProperty("--sh", sec.offsetHeight + "px");
        sec.classList.add("is-live");
        $$(".eyebrow", sec).forEach(decode);
        sio.unobserve(sec);
      });
    }, { threshold: 0.12 });
    $$("main > .section").forEach(function (sec) { sio.observe(sec); });
  }

  // Carrossel de clientes: setas, pontos, destaque do cartão visível e passagem automática
  var strip = $("#cli-strip");
  if (strip) {
    var cards = $$(".ccard", strip), dotsBox = $("#cli-dots"), dots = [];
    var stepSize = function () { var c = cards[0]; return c ? c.getBoundingClientRect().width + 16 : strip.clientWidth; };
    var go = function (dir) {
      var max = strip.scrollWidth - strip.clientWidth - 4;
      if (dir > 0 && strip.scrollLeft >= max) strip.scrollTo({ left: 0, behavior: reduce ? "auto" : "smooth" });
      else if (dir < 0 && strip.scrollLeft <= 4) strip.scrollTo({ left: max + 4, behavior: reduce ? "auto" : "smooth" });
      else strip.scrollBy({ left: stepSize() * dir, behavior: reduce ? "auto" : "smooth" });
    };
    $$(".arrow[data-strip]").forEach(function (b) { b.addEventListener("click", function () { go(Number(b.dataset.dir)); }); });
    cards.forEach(function () { var d = document.createElement("span"); dotsBox.appendChild(d); dots.push(d); });
    if (hasIO) {
      strip.classList.add("is-js");
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var i = cards.indexOf(e.target);
          e.target.classList.toggle("is-on", e.intersectionRatio > 0.6);
          if (dots[i]) dots[i].classList.toggle("is-on", e.intersectionRatio > 0.6);
        });
      }, { root: strip, threshold: [0, 0.6, 1] });
      cards.forEach(function (c) { cio.observe(c); });
    }
    var timer = null, hold = false, visible = false;
    var tick = function () { if (!hold && visible && !document.hidden) go(1); };
    var start = function () { if (!reduce && !timer) timer = setInterval(tick, 4200); };
    ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach(function (ev) { strip.addEventListener(ev, function () { hold = true; }, { passive: true }); });
    ["mouseleave", "focusout"].forEach(function (ev) { strip.addEventListener(ev, function () { hold = false; }); });
    if (hasIO) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) start(); }, { threshold: 0.3 }).observe(strip);
  }

  // Avaliações: botão de pausar o movimento
  var rv = $("#reviews"), rb = $(".reviews__pause");
  if (rv && rb) {
    rb.addEventListener("click", function () {
      var p = rb.getAttribute("aria-pressed") !== "true";
      rb.setAttribute("aria-pressed", p);
      rb.querySelector("span").textContent = p ? "Retomar avaliações" : "Pausar avaliações";
      rv.classList.toggle("is-paused", p);
    });
  }

  // Aberto agora? (horário de Lagoa da Prata/MG, UTC-3): seg a sex, 08:30 às 18:00
  var status = $("#status");
  if (status) {
    var now = new Date(Date.now() + (new Date().getTimezoneOffset() - 180) * 60000);
    var d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    var h = d >= 1 && d <= 5 ? [510, 1080] : null;
    $$(".hours tr").forEach(function (tr) {
      if (tr.dataset.days.split(",").indexOf(String(d)) > -1) tr.classList.add("is-today");
    });
    if (h && m >= h[0] && m < h[1]) {
      var left = h[1] - m;
      status.textContent = left <= 60 ? "Aberto agora · fecha em " + left + " min" : "Aberto agora";
      status.classList.add("is-open");
    } else {
      status.textContent = "Fechado agora";
      status.classList.add("is-closed");
    }
  }

  // Mapa: carrega só quando chega perto
  var mf = $(".map__frame");
  if (mf) {
    var load = function () {
      if (mf.firstChild) return;
      var f = document.createElement("iframe");
      f.src = mf.dataset.src; f.loading = "lazy"; f.title = "Mapa da UTI da Tecnologia em Lagoa da Prata/MG";
      f.referrerPolicy = "no-referrer-when-downgrade";
      mf.appendChild(f);
    };
    if (hasIO) {
      var mio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); mio.disconnect(); } }, { rootMargin: "400px" });
      mio.observe(mf);
    } else load();
  }

  var ano = $("#ano"); if (ano) ano.textContent = new Date().getFullYear();
})();
