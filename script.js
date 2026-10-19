/* Northline Studio – små funktioner: sidhuvud, demotelefonen, årtal och laddning av
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

  /* Telefonen i hero: bläddrar mellan våra tre demosidor */
  var showcase = document.getElementById("phone-showcase");
  if (showcase) {
    var demos = [
      { key: "nagel", href: "/demo/nagel/", label: "Öppna demosidan för Opal Nails, Premium-paketet (öppnas i ny flik)" },
      { key: "frisor", href: "/demo/frisor/", label: "Öppna demosidan för Salong Ljung, Bas-paketet (öppnas i ny flik)" },
      { key: "barber", href: "/demo/barber/", label: "Öppna demosidan för Kvarn Barbershop, Premium-paketet (öppnas i ny flik)" }
    ];
    var phoneLink = document.getElementById("phone-link");
    var screens = showcase.querySelectorAll(".ps");
    var glows = showcase.querySelectorAll(".phone-glow");
    var tabs = document.querySelectorAll(".phone-tab");
    var current = 0, timer = null, hovering = false, inView = true;

    function showDemo(i) {
      current = (i + demos.length) % demos.length;
      for (var k = 0; k < demos.length; k++) {
        var on = k === current;
        screens[k].classList.toggle("is-active", on);
        if (glows[k]) glows[k].classList.toggle("is-active", on);
        tabs[k].classList.toggle("is-active", on);
        tabs[k].setAttribute("aria-pressed", on ? "true" : "false");
      }
      phoneLink.href = demos[current].href;
      phoneLink.setAttribute("aria-label", demos[current].label);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (reduceMotion || hovering || !inView || document.hidden) return;
      timer = setInterval(function () { showDemo(current + 1); }, 4000);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        showDemo(parseInt(tab.getAttribute("data-index"), 10));
        start();
      });
    });
    showcase.addEventListener("mouseenter", function () { hovering = true; stop(); });
    showcase.addEventListener("mouseleave", function () { hovering = false; start(); });
    showcase.addEventListener("focusin", function () { hovering = true; stop(); });
    showcase.addEventListener("focusout", function () { hovering = false; start(); });
    document.addEventListener("visibilitychange", start);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        start();
      }).observe(showcase);
    }
    start();
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
