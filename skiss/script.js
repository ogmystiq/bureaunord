/* Skiss från Northline Studio.
   Läser ?n= (namn), ?s= (stad) och ?t= (bransch) ur länken och fyller sidan.
   SÄKERHET: allt från länken sätts in med textContent, aldrig innerHTML. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Läs och städa parametrarna ---------- */
  /* Uppgifterna kommer antingen från 404.html (korta länkar /skiss/<slug>,
     via window.SKISS_DATA) eller från ?n=&s=&t= i länken (reserv). */
  var given = window.SKISS_DATA || null;
  var params = new URLSearchParams(window.location.search);
  function pick(key, short) { return given ? given[key] : params.get(short); }
  function clean(value, max) {
    if (!value) return "";
    // Ta bort kontrolltecken, slå ihop mellanslag och klipp efter max tecken (räknar åäö och emoji rätt)
    var s = String(value).replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028-\u202E\u2066-\u2069]/g, "").replace(/\s+/g, " ").trim();
    var chars = Array.from(s);
    return chars.length > max ? chars.slice(0, max).join("").trim() : s;
  }
  var name = clean(pick("namn","n"), 60) || "Er salong";
  var city = clean(pick("stad","s"), 60);
  var type = clean(pick("typ","t"), 20).toLowerCase();

  /* ---------- Branschdata (exempeltexter och exempelpriser) ---------- */
  var DATA = {
    frisor: { theme: "light", label: "Frisör", tagline: "Hår som känns som du.",
      lead: "Klipp, färg och styling med tid för varje kund. Boka enkelt online när det passar dig.",
      about: "Här berättar ni om salongen, er stil och vad kunderna kan förvänta sig när de sätter sig i stolen.",
      services: [["Damklippning", "695 kr", "Inklusive tvätt och styling."], ["Herrklippning", "495 kr", ""], ["Barnklippning", "345 kr", "Upp till 12 år."], ["Färgning", "från 995 kr", "Pris efter hårlängd."], ["Slingor", "från 1 195 kr", ""], ["Tvätt och föning", "395 kr", ""]] },
    barberare: { theme: "dark", label: "Barberare", tagline: "Skarpa linjer. Lugnt tempo.",
      lead: "Klipp, fades och skäggvård med fokus på detaljerna. Boka din tid online.",
      about: "Här berättar ni om salongen, ert hantverk och vad som gör ett besök hos er till något extra.",
      services: [["Herrklipp", "450 kr", "Med tvätt och styling."], ["Skinfade", "520 kr", ""], ["Skäggtrim", "300 kr", "Med konturer och skäggolja."], ["Rakning med varm handduk", "450 kr", ""], ["Klipp + skägg", "695 kr", ""], ["Barnklipp", "320 kr", "Upp till 12 år."]] },
    nagel: { theme: "soft", label: "Nagelstudio", tagline: "Naglar med lyster och omsorg.",
      lead: "Gellack, förlängning och nail art med noggrann nagelvård. Boka enkelt online.",
      about: "Här berättar ni om studion, era favoritbehandlingar och hur ni tar hand om varje kund.",
      services: [["Gellack", "495 kr", "Inklusive nagelbandsvård."], ["Nagelförlängning, nytt set", "från 895 kr", ""], ["Påfyllning", "695 kr", ""], ["Manikyr", "495 kr", ""], ["Pedikyr", "595 kr", ""], ["Nail art", "från 50 kr/nagel", ""]] },
    lash: { theme: "soft", label: "Lash-studio", tagline: "Fransar som lyfter blicken.",
      lead: "Fransförlängning och lash lift med naturligt, hållbart resultat. Boka din tid online.",
      about: "Här berättar ni om studion, er teknik och hur ni hjälper varje kund att hitta rätt look.",
      services: [["Klassiska fransar, nytt set", "895 kr", ""], ["Volymfransar, nytt set", "1 195 kr", ""], ["Påfyllning, 2–3 veckor", "595 kr", ""], ["Lash lift", "650 kr", ""], ["Lash lift med färg", "750 kr", ""], ["Borttagning", "250 kr", ""]] },
    bryn: { theme: "soft", label: "Brynstudio", tagline: "Bryn som ramar in dig.",
      lead: "Formning, färg och lamination anpassat efter ditt ansikte. Boka enkelt online.",
      about: "Här berättar ni om studion och hur ni arbetar för att hitta den form som passar varje kund.",
      services: [["Brynformning", "350 kr", ""], ["Formning och färg", "450 kr", ""], ["Brow lamination", "650 kr", ""], ["Lamination med färg", "750 kr", ""], ["Fransfärg", "250 kr", ""]] },
    skonhet: { theme: "soft", label: "Skönhetssalong", tagline: "Skönhet med omsorg i varje detalj.",
      lead: "Behandlingar för ansikte, bryn, fransar och naglar under samma tak. Boka enkelt online.",
      about: "Här berättar ni om salongen, era behandlingar och vad kunderna kan förvänta sig hos er.",
      services: [["Ansiktsbehandling", "895 kr", ""], ["Brynformning och färg", "450 kr", ""], ["Fransfärg", "250 kr", ""], ["Lash lift", "650 kr", ""], ["Vaxning, ben", "495 kr", ""], ["Manikyr", "495 kr", ""]] },
    hudvard: { theme: "soft", label: "Hudterapeut", tagline: "Hud som mår bra, på riktigt.",
      lead: "Ansiktsbehandlingar och hudvård anpassade efter din hud. Boka konsultation eller behandling online.",
      about: "Här berättar ni om kliniken, er utbildning och hur ni arbetar med varje kunds hud.",
      services: [["Hudanalys med konsultation", "450 kr", ""], ["Ansiktsbehandling", "895 kr", ""], ["Djuprengöring", "995 kr", ""], ["Kemisk peeling", "från 1 095 kr", ""], ["Microneedling", "från 1 695 kr", ""]] },
    massage: { theme: "light", label: "Massör", tagline: "Tid att landa i kroppen.",
      lead: "Massage för återhämtning, avslappning och spända muskler. Boka din tid online.",
      about: "Här berättar ni om er, era behandlingar och hur ett besök hos er går till.",
      services: [["Klassisk massage, 30 min", "495 kr", ""], ["Klassisk massage, 60 min", "795 kr", ""], ["Djupvävnadsmassage, 60 min", "895 kr", ""], ["Avslappningsmassage, 60 min", "795 kr", ""], ["Gravidmassage, 60 min", "845 kr", ""]] },
    tatuering: { theme: "dark", label: "Tatuerare", tagline: "Konst som håller hela livet.",
      lead: "Egna motiv och flash, gjorda med omsorg och rena förhållanden. Boka konsultation online.",
      about: "Här berättar ni om studion, er stil och hur ni arbetar från idé till färdig tatuering.",
      services: [["Konsultation", "Kostnadsfri", "Vi går igenom idé, storlek och placering."], ["Mindre tatuering", "från 1 200 kr", ""], ["Timpris", "från 1 300 kr/tim", ""], ["Heldag", "från 7 500 kr", ""], ["Cover-up", "Enligt offert", ""]] },
    fotvard: { theme: "soft", label: "Fotvårdare", tagline: "Fötter som får den omsorg de förtjänar.",
      lead: "Medicinsk fotvård och spabehandlingar för fötter som mår bra. Boka din tid online.",
      about: "Här berättar ni om kliniken, er utbildning och hur en behandling hos er går till.",
      services: [["Medicinsk fotvård", "595 kr", ""], ["Fotvård med lack", "695 kr", ""], ["Nagelvård", "395 kr", ""], ["Förhårdnader och hälsprickor", "495 kr", ""], ["Spapedikyr", "795 kr", ""]] }
  };
  var FALLBACK = { theme: "light", label: "Salong", tagline: "Skönhet med omsorg i varje detalj.",
    lead: "Här ser era kunder direkt vad ni erbjuder och kan boka på några sekunder.",
    about: "Här berättar ni om er själva, vad ni brinner för och vad kunderna kan förvänta sig hos er.",
    services: [["Behandling ett", "från 495 kr", ""], ["Behandling två", "från 695 kr", ""], ["Behandling tre", "från 895 kr", ""], ["Paketbehandling", "från 1 195 kr", ""]] };
  var d = Object.prototype.hasOwnProperty.call(DATA, type) ? DATA[type] : FALLBACK;

  /* ---------- Tema och typsnitt ---------- */
  var FONTS = {
    light: "family=Cormorant+Garamond:wght@500;600&family=Manrope:wght@400;500;600",
    soft: "family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Jost:wght@400;500;600",
    dark: "family=Archivo:wdth,wght@62..125,600..800&family=Inter:wght@400;500;600"
  };
  var THEME_COLOR = { light: "#f4ede4", soft: "#f6f0ec", dark: "#100f0e" };
  document.body.className = "theme-" + d.theme;
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?" + FONTS[d.theme] + "&family=Inter:wght@400;600&display=swap";
  document.head.appendChild(font);
  document.getElementById("theme-color").setAttribute("content", THEME_COLOR[d.theme]);

  /* ---------- Fyll i texter (endast textContent) ---------- */
  function setText(el, text) { if (el) el.textContent = text; }
  document.querySelectorAll('[data-fill="name"]').forEach(function (el) { setText(el, name); });
  document.querySelectorAll('[data-fill="city-line"]').forEach(function (el) { setText(el, city); });
  setText(document.getElementById("eyebrow"), city ? d.label + " i " + city : d.label);
  setText(document.getElementById("tagline"), d.tagline);
  setText(document.getElementById("lead"), d.lead);
  setText(document.getElementById("about-1"), d.about);
  document.title = name + " – skiss av Northline Studio";

  var list = document.getElementById("services");
  d.services.forEach(function (s) {
    var li = document.createElement("li");
    li.className = "service reveal";
    var n = document.createElement("span"); n.className = "service__name"; n.textContent = s[0];
    var p = document.createElement("span"); p.className = "service__price"; p.textContent = s[1];
    li.appendChild(n); li.appendChild(p);
    if (s[2]) { var desc = document.createElement("span"); desc.className = "service__desc"; desc.textContent = s[2]; li.appendChild(desc); }
    list.appendChild(li);
  });

  /* ---------- Mät banner och ruta så att innehållet inte hamnar under dem ---------- */
  var bar = document.querySelector(".sketch-bar");
  var offer = document.querySelector(".offer");
  function measure() {
    var root = document.documentElement.style;
    root.setProperty("--bar-h", bar.offsetHeight + "px");
    root.setProperty("--offer-h", (window.innerWidth < 760 ? offer.offsetHeight + 10 : 0) + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- Bokningsknappen är bara en skiss ---------- */
  var toast = document.getElementById("toast"), timer;
  document.querySelectorAll("[data-demo]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast.textContent = "Det här är en skiss. Här kopplas ert bokningssystem in.";
      toast.classList.add("is-visible");
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3200);
    });
  });

  /* ---------- Mjuk intoning ---------- */
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(function (el) { io.observe(el); });
  }
})();
