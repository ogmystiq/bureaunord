/* Salong Ljung – demosida av Northline Studio */
(function () {
  document.documentElement.classList.add("js");

  /* Linje under sidhuvudet när man scrollat */
  var header = document.querySelector(".header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 10); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

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
