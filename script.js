/* Bureau Nord – små funktioner: intoning, sidhuvud, årtal och laddning av
   kontaktformuläret från Tally. Utan skriptet visas sidan ändå, men formuläret
   måste då öppnas via länken under formulärrutan. */
(function () {
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Tunn linje under sidhuvudet när man scrollat ner en bit */
  var header = document.querySelector(".site-header");
  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  /* Intoning av innehåll när det scrollas fram */
  var items = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });

    /* Element som ligger nära varandra tonas in med en liten fördröjning emellan */
    var delay = 0, lastTop = null;
    items.forEach(function (el) {
      var top = Math.round(el.getBoundingClientRect().top / 40);
      delay = (top === lastTop) ? delay + 0.08 : 0;
      lastTop = top;
      el.style.transitionDelay = delay + "s";
      observer.observe(el);
    });
  }

  /* Demokort utan länk ska inte hoppa till toppen */
  document.querySelectorAll("[data-coming-soon]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); });
  });

  /* Kontaktformuläret från Tally: laddar deras skript så att formuläret
     får rätt höjd automatiskt. Om skriptet inte kan hämtas visas
     formuläret ändå, med fast höjd. */
  var tallyScript = "https://tally.so/widgets/embed.js";
  function loadTallyEmbeds() {
    if (typeof Tally !== "undefined") {
      Tally.loadEmbeds();
    } else {
      document.querySelectorAll("iframe[data-tally-src]:not([src])").forEach(function (frame) {
        frame.src = frame.dataset.tallySrc;
      });
    }
  }
  if (typeof Tally !== "undefined") {
    loadTallyEmbeds();
  } else if (!document.querySelector('script[src="' + tallyScript + '"]')) {
    var s = document.createElement("script");
    s.src = tallyScript;
    s.onload = loadTallyEmbeds;
    s.onerror = loadTallyEmbeds;
    document.body.appendChild(s);
  }

  /* Liten "Beställ demo"-knapp i mobilen: visas när hero scrollat förbi,
     döljs när formuläret är i bild */
  var sticky = document.getElementById("sticky-cta");
  var hero = document.querySelector(".hero");
  var contact = document.getElementById("kontakt");
  if (sticky && hero && contact && "IntersectionObserver" in window) {
    var heroGone = false, contactSeen = false;
    function updateSticky() {
      var show = heroGone && !contactSeen;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      sticky.querySelector("a").tabIndex = show ? 0 : -1;
    }
    new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting; updateSticky(); }).observe(hero);
    new IntersectionObserver(function (e) { contactSeen = e[0].isIntersecting; updateSticky(); }, { threshold: 0.15 }).observe(contact);
  }

  /* Årtalet i sidfoten */
  var year = document.getElementById("ar");
  if (year) year.textContent = new Date().getFullYear();
})();
