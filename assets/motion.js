/* Northline Studio – gemensamt rörelselager för demosidorna och skissen.
   Markerar rubriker, text, listor och bilder under första skärmen och visar dem en gång
   när de kommer i bild. Toppen (första sektionen) lämnas åt sidans egen laddningsrörelse.
   Utan skript, eller med reducerad rörelse, syns allt direkt. */
(function () {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function start() {
    var root = document.documentElement;
    var main = document.querySelector("main");
    if (!main) return;
    var sections = Array.prototype.slice.call(main.children).filter(function (n) { return n.tagName === "SECTION" || n.tagName === "ASIDE"; });
    if (!sections.length) return;

    /* Toppbilden glider sakta när man skrollar förbi */
    var heroImg = sections[0].querySelector("img");
    if (heroImg && getComputedStyle(heroImg).transform === "none" && window.CSS && CSS.supports("view-timeline-name: --mo")) {
      // Toppen klipper sitt innehåll, så bilden följer sektionens tidslinje i stället för sin egen
      sections[0].style.viewTimelineName = "--mo-hero";
      // Bilden förstoras lite när den glider, så ramen runt den måste klippa
      if (heroImg.parentElement !== sections[0]) heroImg.parentElement.style.overflow = "clip";
      heroImg.classList.add("mo-drift");
      heroImg.style.animationTimeline = "--mo-hero";
    }

    var SKIP = "nav, header, footer, details, form, dialog, [hidden], .toast, .note, .mobile-menu, .lightbox, .form-success, .sticky-book";
    var picked = [];
    function mark(el, kind) {
      if (el.closest(SKIP) || el.hasAttribute("data-mo")) return;
      if (el.closest("[data-mo]")) return;                 // inte i något som redan rör sig
      if (getComputedStyle(el).transform !== "none") return; // rör inte element som redan är flyttade
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return; // syns redan: lämna i fred
      el.setAttribute("data-mo", kind);
      picked.push(el);
    }
    sections.slice(1).forEach(function (sec) {
      sec.querySelectorAll("h2, h3").forEach(function (h) { mark(h, "head"); });
      sec.querySelectorAll("figure, .gallery__item, .about__photo, .story__photo, .crew__photo, .team__photo").forEach(function (f) {
        if (f.querySelector("img")) mark(f, "shut");
      });
      sec.querySelectorAll("p, li, tr, dl > div, blockquote").forEach(function (t) {
        if (t.closest("figure")) return;
        mark(t, "rise");
      });
    });
    if (!picked.length) return;
    root.classList.add("mo");

    /* Det som kommer i bild samtidigt får en kort förskjutning i läsordning */
    var io = new IntersectionObserver(function (entries) {
      var shown = [];
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (watch.get(e.target) || []).forEach(function (el) { shown.push(el); });
        watch.delete(e.target);
        io.unobserve(e.target);
      });
      shown.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
      shown.forEach(function (el, i) {
        el.style.setProperty("--mo-d", Math.min(i, 6) * 70 + "ms");
        el.classList.add("mo-in");
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    /* Ihopklippta element räknas aldrig som synliga, så de bevakas via sin förälder */
    var watch = new Map();
    picked.forEach(function (el) {
      var target = el.getAttribute("data-mo") === "rise" ? el : el.parentElement;
      if (!watch.has(target)) { watch.set(target, []); io.observe(target); }
      watch.get(target).push(el);
    });
  }

  /* Vänta tills sidan är ifylld (skissen fylls av sitt eget skript) */
  function later() { requestAnimationFrame(function () { requestAnimationFrame(start); }); }
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later);
})();
