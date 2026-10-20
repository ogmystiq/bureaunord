/* Northline Studio – små funktioner: kapitel som visas när de kommer i bild, stegen i
   "Så går det till", remsan i kontaktdelen, kontaktformuläret från Tally, knappen i mobilen,
   före-illustrationen och årtalet. Utan skriptet syns hela sidan ändå, färdig. */
(function () {
  var root = document.documentElement;
  root.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Kapitlens delar visas en gång när de kommer i bild (rubrik, text, bild i läsordning) */
  var revealables = document.querySelectorAll("[data-reveal], .about__mark");
  if ("IntersectionObserver" in window && !reduceMotion) {
    /* En ihopklippt ruta (slutaren) räknas aldrig som synlig, så den bevakas via sin förälder */
    var waiting = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        (waiting.get(e.target) || []).forEach(function (el) { el.classList.add("is-in"); });
        waiting.delete(e.target);
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });
    revealables.forEach(function (el) {
      var watch = el.getAttribute("data-reveal") === "shutter" ? el.parentElement : el;
      if (!waiting.has(watch)) { waiting.set(watch, []); io.observe(watch); }
      waiting.get(watch).push(el);
    });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* Så går det till: ett steg öppet i taget */
  var stages = document.querySelectorAll(".stage");
  stages.forEach(function (stage) {
    var btn = stage.querySelector(".stage__toggle");
    btn.addEventListener("click", function () {
      stages.forEach(function (s) {
        var on = s === stage;
        s.classList.toggle("is-open", on);
        s.querySelector(".stage__toggle").setAttribute("aria-expanded", on ? "true" : "false");
      });
    });
  });

  /* Remsan: dubbla bilderna så att den kan glida runt utan skarv */
  var track = document.querySelector(".strip__track");
  if (track && !reduceMotion) {
    Array.prototype.slice.call(track.children).forEach(function (img) { track.appendChild(img.cloneNode(true)); });
  }

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
    var updateSticky = function () {
      var show = heroGone && !contactSeen;
      sticky.classList.toggle("is-visible", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      sticky.querySelector("a").tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (e) { heroGone = !e[0].isIntersecting; updateSticky(); }).observe(hero);
    new IntersectionObserver(function (e) { contactSeen = e[0].isIntersecting; updateSticky(); }, { threshold: 0.15 }).observe(contact);
  }

  /* Före-illustrationen: en datorsida på 980 px som skalas ner i telefonen */
  var oldScreen = document.querySelector(".old-screen");
  if (oldScreen) {
    var oldPage = oldScreen.querySelector(".old-page");
    var fitOld = function () {
      var scale = oldScreen.clientWidth / 980;
      oldScreen.style.setProperty("--old-scale", scale);
      oldPage.style.minHeight = Math.ceil(oldScreen.clientHeight / scale) + "px";
    };
    fitOld();
    window.addEventListener("resize", fitOld);
  }

  /* Årtalet i sidfoten */
  var year = document.getElementById("ar");
  if (year) year.textContent = new Date().getFullYear();
})();
