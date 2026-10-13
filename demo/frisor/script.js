/* Salong Ljung – demosida av Bureau Nord */
(function () {
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Linje under sidhuvudet när man scrollat */
  var header = document.querySelector(".header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Mjuk intoning när innehåll kommer in i bild */
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    var delay = 0, last = null;
    items.forEach(function (el) {
      var row = Math.round(el.getBoundingClientRect().top / 40);
      delay = row === last ? Math.min(delay + 0.08, 0.32) : 0;
      last = row;
      el.style.transitionDelay = delay + "s";
      io.observe(el);
    });
  }

  /* Bokningsknappen är bara en demo */
  var toast = document.getElementById("toast"), timer;
  document.querySelectorAll("[data-demo]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast.textContent = "Detta är en demosida. Här kopplas salongens bokningssystem in.";
      toast.classList.add("is-visible");
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3200);
    });
  });
})();
