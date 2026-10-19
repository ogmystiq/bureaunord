/* Kvarn Barbershop – demosida av Northline Studio */
(function () {
  document.documentElement.classList.add("js");
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

  /* Galleri: lightbox med fotona */
  var shots = Array.prototype.slice.call(document.querySelectorAll(".shot__btn"));
  if (shots.length) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var box = document.getElementById("lightbox");
    var big = document.getElementById("lightbox-img");
    var title = document.getElementById("lightbox-title");
    var desc = document.getElementById("lightbox-desc");
    var count = document.getElementById("lightbox-count");
    var current = 0, opener = null;

    function show(i) {
      current = (i + shots.length) % shots.length;
      var shot = shots[current];
      var src = shot.querySelector("img");
      var cap = shot.parentNode.querySelector("figcaption");
      big.src = src.currentSrc || src.src;
      big.alt = src.alt;
      title.textContent = cap.querySelector("strong").textContent;
      desc.textContent = cap.textContent.replace(title.textContent, "").trim();
      count.textContent = "Bild " + (current + 1) + " av " + shots.length;
    }
    function open(i) {
      opener = shots[i];
      box.hidden = false;
      show(i);
      requestAnimationFrame(function () { box.classList.add("is-open"); });
      document.body.style.overflow = "hidden";
      box.querySelector(".lightbox__close").focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
      setTimeout(function () { box.hidden = true; }, reduce ? 0 : 300);
      if (opener) opener.focus();
    }
    shots.forEach(function (b, i) { b.addEventListener("click", function () { open(i); }); });
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
