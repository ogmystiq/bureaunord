/* Opal Nails – demosida av Bureau Nord */
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Linje under sidhuvudet */
  var header = document.querySelector(".header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mobilmeny */
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("mobilmeny");
  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Stäng menyn" : "Öppna menyn");
  }
  toggle.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
  menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) { setMenu(false); toggle.focus(); }
  });

  /* Scrollanimationer */
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    var delay = 0, last = null;
    items.forEach(function (el) {
      var row = Math.round(el.getBoundingClientRect().top / 40);
      delay = row === last ? Math.min(delay + 0.07, 0.35) : 0;
      last = row;
      el.style.transitionDelay = delay + "s";
      io.observe(el);
    });
  }

  /* Galleri: filter och lightbox */
  var designs = Array.prototype.slice.call(document.querySelectorAll(".gallery .design"));
  if (designs.length) {
    var filters = document.querySelectorAll(".filter");
    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        filters.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", on ? "true" : "false");
        });
        designs.forEach(function (d) {
          d.classList.toggle("is-hidden", f !== "all" && d.getAttribute("data-cat") !== f);
        });
      });
    });

    var box = document.getElementById("lightbox");
    var art = document.getElementById("lightbox-art");
    var title = document.getElementById("lightbox-title");
    var desc = document.getElementById("lightbox-desc");
    var count = document.getElementById("lightbox-count");
    var current = 0, opener = null;

    function visible() { return designs.filter(function (d) { return !d.classList.contains("is-hidden"); }); }
    function show(i) {
      var list = visible();
      current = (i + list.length) % list.length;
      var d = list[current];
      art.className = "design lightbox__art " + d.className.replace(/\b(design|reveal|is-visible)\b/g, "").trim();
      art.innerHTML = Array.prototype.map.call(d.querySelectorAll(".nail"), function (n) { return n.outerHTML; }).join("");
      title.textContent = d.getAttribute("data-title");
      desc.textContent = d.getAttribute("data-desc");
      count.textContent = (current + 1) + " / " + list.length;
    }
    function open(d) {
      opener = d;
      box.hidden = false;
      show(visible().indexOf(d));
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      box.querySelector(".lightbox__close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { box.hidden = true; }, reduce ? 0 : 350);
      if (opener) opener.focus();
    }
    designs.forEach(function (d) { d.addEventListener("click", function () { open(d); }); });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    document.addEventListener("keydown", function (e) {
      if (box.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "Tab") {
        var f = box.querySelectorAll("button");
        var first = f[0], lastB = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastB.focus(); }
        else if (!e.shiftKey && document.activeElement === lastB) { e.preventDefault(); first.focus(); }
      }
    });
    /* Svep i mobilen */
    var sx = null;
    box.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      sx = null;
    });
  }

  /* Kontaktformulär (skickar inget) */
  var form = document.getElementById("kontaktformular");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      form.querySelectorAll("[required]").forEach(function (input) {
        var field = input.closest(".field");
        var bad = !input.value.trim() || (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim()));
        field.classList.toggle("is-invalid", bad);
        input.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !firstBad) firstBad = input;
        if (bad) ok = false;
      });
      if (!ok) { firstBad.focus(); return; }
      form.classList.add("is-sent");
      form.querySelector(".form-success").setAttribute("tabindex", "-1");
      form.querySelector(".form-success").focus();
    });
    form.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("input", function () { input.closest(".field").classList.remove("is-invalid"); });
    });
  }
})();
