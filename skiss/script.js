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

  /* ---------- Fem visuella familjer ---------- */
  var FAMILIES = {
    ljus:    { fonts: "family=Gloock&family=Albert+Sans:wght@400;500;600", color: "#fbfbf9" },
    mode:    { fonts: "family=Syne:wght@600;800&family=Manrope:wght@400;500;700", color: "#ffffff" },
    klinik:  { fonts: "family=Spectral:wght@300;400&family=Work+Sans:wght@400;500;600", color: "#f3f6f5" },
    massing: { fonts: "family=Big+Shoulders+Display:wght@600;800&family=Libre+Franklin:wght@400;500;700", color: "#0e0e0e" },
    black:   { fonts: "family=Anybody:wdth,wght@75..150,500..900&family=IBM+Plex+Mono:wght@400;500;600", color: "#121212" }
  };

  /* Foton från Unsplash: [id, alt-text, beskärning] */
  var F = {
    frisorHero: ["1746723375184-5f537d2e6f31", "Ljus frisörsalong med valvöppning, en frisör arbetar vid stolen", "50% 50%"],
    frisorAbout: ["1600948836101-f9ffda59d250", "Salong med mörkgrön vägg, runda speglar och frisörstolar", "50% 50%"],
    massageHero: ["1741934023052-26baf5535088", "Massör masserar nacken på en kund som ligger på en vit handduk", "50% 45%"],
    massageAbout: ["1790244338456-af6194d2436e", "Händer som masserar en kunds ansikte och tinningar", "50% 40%"],
    nagelHero: ["1632345031435-8727f6897d53", "Manikyr på ett vitt bord, nagelterapeuten arbetar med nagelbanden", "60% 50%"],
    nagelAbout: ["1737214475292-949c0bf920b0", "Händer i svarta handskar målar en nagel med tunn pensel", "50% 40%"],
    lashHero: ["1674049406467-824ea37c7184", "Fransstylist sätter fransförlängning på en kund som ligger ner", "50% 50%"],
    lashAbout: ["1589710751893-f9a6770ad71b", "Närbild på fransförlängning med pincett", "50% 40%"],
    brynHero: ["1639629509821-c54cdd984227", "Närbild på ett öga med formade bryn och långa fransar", "50% 50%"],
    brynAbout: ["1528047128849-2382ff646073", "Ansikte med fylliga fransar och formade bryn, sett uppifrån", "50% 40%"],
    hudHero: ["1706795033728-9232ef548a16", "Hudterapeut masserar ansiktet på en kund under en behandling", "50% 30%"],
    hudAbout: ["1761718210089-ba3bb5ccb54f", "Kund med ansiktsmask under en hudvårdsbehandling", "50% 40%"],
    skonhetHero: ["1570172619644-dfd03ed5d881", "Terapeut penslar på en ansiktsmask på en kund med hårband", "50% 45%"],
    skonhetAbout: ["1782159981479-5e90597f284a", "Ansiktsbehandling där kunden ligger med gult hårband", "50% 40%"],
    fotHero: ["1782159981479-5e90597f284a", "Kund som ligger avslappnad under en behandling", "50% 45%"],
    fotAbout: ["1706795033728-9232ef548a16", "Terapeutens händer under en lugn behandling", "50% 30%"],
    barberHero: ["1771489465791-00ee339a9c92", "Barberare klipper kunder i en full salong, svartvit bild", "50% 40%"],
    barberAbout: ["1626379499242-52863d313084", "Barberarstol sedd genom en rund spegel", "45% 50%"],
    tattooHero: ["1769605767720-6b512d96aa4e", "Tatuerare arbetar på en kunds rygg i en studio med rosa ljus", "50% 45%"],
    tattooAbout: ["1783973190331-53d4db4f697f", "Tatueringsstudio med neonslinga på väggen", "50% 40%"],
    salongHero: ["1560066984-138dadb4c035", "Ljus salong med höga fönster och stolar längs väggen", "40% 55%"],
    salongAbout: ["1781450090585-1a511b7066d9", "Vit salong med stolar framför runda speglar", "50% 60%"]
  };

  /* ---------- Branschdata (exempeltexter och exempelpriser) ---------- */
  var DATA = {
    frisor: { fam: "ljus", label: "Frisör", hero: F.frisorHero, about: F.frisorAbout,
      lead: "Klipp, färg och styling. Boka tid online när det passar dig.",
      about2: "Varje besök börjar med en kort konsultation, så att resultatet passar både håret och vardagen.",
      services: [["Damklippning", "695 kr", "Med tvätt och styling."], ["Herrklippning", "495 kr", ""], ["Barnklippning", "345 kr", "Upp till 12 år."], ["Färgning", "från 995 kr", "Pris efter hårlängd."], ["Slingor", "från 1 195 kr", ""], ["Tvätt och föning", "395 kr", ""]] },
    massage: { fam: "ljus", label: "Massage", hero: F.massageHero, about: F.massageAbout,
      lead: "Massage för spända muskler, återhämtning och avslappning. Boka online.",
      about2: "Vi börjar med en kort genomgång av hur du mår, och anpassar trycket efter dig.",
      services: [["Klassisk massage, 30 min", "495 kr", ""], ["Klassisk massage, 60 min", "795 kr", ""], ["Djupvävnadsmassage, 60 min", "895 kr", ""], ["Avslappningsmassage, 60 min", "795 kr", ""], ["Gravidmassage, 60 min", "845 kr", ""]] },
    nagel: { fam: "mode", label: "Nagelstudio", hero: F.nagelHero, about: F.nagelAbout,
      lead: "Gellack, förlängning och nail art. Boka tid online.",
      about2: "Vi går igenom form, längd och färg innan vi börjar, och tar oss tid för nagelbandsvården.",
      services: [["Gellack", "495 kr", "Med nagelbandsvård."], ["Nagelförlängning, nytt set", "från 895 kr", ""], ["Påfyllning", "695 kr", ""], ["Manikyr", "495 kr", ""], ["Pedikyr", "595 kr", ""], ["Nail art", "från 50 kr/nagel", ""]] },
    lash: { fam: "mode", label: "Fransstudio", hero: F.lashHero, about: F.lashAbout,
      lead: "Fransförlängning och lash lift. Boka tid online.",
      about2: "Vi hjälper dig att välja längd och volym som passar dina ögon och din vardag.",
      services: [["Klassiska fransar, nytt set", "895 kr", ""], ["Volymfransar, nytt set", "1 195 kr", ""], ["Påfyllning, 2–3 veckor", "595 kr", ""], ["Lash lift", "650 kr", ""], ["Lash lift med färg", "750 kr", ""], ["Borttagning", "250 kr", ""]] },
    bryn: { fam: "mode", label: "Brynstudio", hero: F.brynHero, about: F.brynAbout,
      lead: "Formning, färg och lamination. Boka tid online.",
      about2: "Formen anpassas efter ditt ansikte, och vi visar hur du sköter brynen hemma.",
      services: [["Brynformning", "350 kr", ""], ["Formning och färg", "450 kr", ""], ["Brow lamination", "650 kr", ""], ["Lamination med färg", "750 kr", ""], ["Fransfärg", "250 kr", ""]] },
    hudvard: { fam: "klinik", label: "Hudvård", hero: F.hudHero, about: F.hudAbout,
      lead: "Ansiktsbehandlingar anpassade efter din hud. Boka konsultation eller behandling online.",
      about2: "Första besöket börjar med en hudanalys, så att behandlingen passar just din hud.",
      services: [["Hudanalys med konsultation", "450 kr", ""], ["Ansiktsbehandling", "895 kr", ""], ["Djuprengöring", "995 kr", ""], ["Kemisk peeling", "från 1 095 kr", ""], ["Microneedling", "från 1 695 kr", ""]] },
    skonhet: { fam: "klinik", label: "Skönhetssalong", hero: F.skonhetHero, about: F.skonhetAbout,
      lead: "Ansikte, bryn, fransar och naglar under samma tak. Boka online.",
      about2: "Kombinera gärna flera behandlingar vid samma besök, så planerar vi tiden åt dig.",
      services: [["Ansiktsbehandling", "895 kr", ""], ["Brynformning och färg", "450 kr", ""], ["Fransfärg", "250 kr", ""], ["Lash lift", "650 kr", ""], ["Vaxning, ben", "495 kr", ""], ["Manikyr", "495 kr", ""]] },
    fotvard: { fam: "klinik", label: "Fotvård", hero: F.fotHero, about: F.fotAbout,
      lead: "Medicinsk fotvård och spabehandlingar för fötterna. Boka tid online.",
      about2: "Vi går igenom fötternas behov vid första besöket och ger råd om skötsel hemma.",
      services: [["Medicinsk fotvård", "595 kr", ""], ["Fotvård med lack", "695 kr", ""], ["Nagelvård", "395 kr", ""], ["Förhårdnader och hälsprickor", "495 kr", ""], ["Spapedikyr", "795 kr", ""]] },
    barberare: { fam: "massing", label: "Barbershop", hero: F.barberHero, about: F.barberAbout,
      lead: "Klipp, fades och skägg. Boka tid online.",
      about2: "Varje besök börjar med ett kort samtal om vad du vill ha, och slutar med styling.",
      services: [["Herrklipp", "450 kr", "Med tvätt och styling."], ["Skinfade", "520 kr", ""], ["Skäggtrim", "300 kr", "Med konturer och skäggolja."], ["Rakning med varm handduk", "450 kr", ""], ["Klipp och skägg", "695 kr", ""], ["Barnklipp", "320 kr", "Upp till 12 år."]] },
    tatuering: { fam: "black", label: "Tatueringsstudio", hero: F.tattooHero, about: F.tattooAbout,
      lead: "Egna motiv och flash. Boka en konsultation online.",
      about2: "Vi går igenom idé, storlek och placering tillsammans innan vi bokar själva sittningen.",
      services: [["Konsultation", "Kostnadsfri", "Idé, storlek och placering."], ["Mindre tatuering", "från 1 200 kr", ""], ["Timpris", "från 1 300 kr/tim", ""], ["Heldag", "från 7 500 kr", ""], ["Cover-up", "Enligt offert", ""]] }
  };
  var FALLBACK = { fam: "ljus", label: "Salong", hero: F.salongHero, about: F.salongAbout,
    intro: "Hos oss får varje besök ta den tid det behöver.",
    lead: "Här ser era kunder direkt vad ni erbjuder och kan boka på några sekunder.",
    about2: "Boka tid online, eller hör av er om ni har frågor.",
    services: [["Behandling ett", "från 495 kr", ""], ["Behandling två", "från 695 kr", ""], ["Behandling tre", "från 895 kr", ""], ["Paketbehandling", "från 1 195 kr", ""]] };
  var d = Object.prototype.hasOwnProperty.call(DATA, type) ? DATA[type] : FALLBACK;
  var fam = FAMILIES[d.fam];

  /* ---------- Familj och typsnitt ---------- */
  document.body.className = "fam-" + d.fam;
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?" + fam.fonts + "&display=swap";
  document.head.appendChild(font);
  document.getElementById("theme-color").setAttribute("content", fam.color);

  /* ---------- Foton ---------- */
  function photo(el, p) {
    if (!el) return;
    var u = function (w) { return "https://images.unsplash.com/photo-" + p[0] + "?auto=format&fit=crop&w=" + w + "&q=80"; };
    el.srcset = u(800) + " 800w, " + u(1200) + " 1200w, " + u(1600) + " 1600w";
    el.src = u(1600);
    el.alt = p[1];
    el.style.objectPosition = p[2];
  }
  photo(document.getElementById("hero-img"), d.hero);
  photo(document.getElementById("about-img"), d.about);

  /* ---------- Fyll i texter (endast textContent) ---------- */
  function setText(el, text) { if (el) el.textContent = text; }
  document.querySelectorAll('[data-fill="name"]').forEach(function (el) { setText(el, name); });
  document.querySelectorAll('[data-fill="city-line"]').forEach(function (el) { setText(el, city); });
  setText(document.getElementById("kind"), city ? d.label + " i " + city : d.label);
  setText(document.getElementById("lead"), d.lead);
  setText(document.getElementById("about-1"), "Välkommen till " + name + (city ? " i " + city : "") + ". " + (d.intro || d.lead.split(".")[0] + ", med tid för varje kund."));
  setText(document.getElementById("about-2"), d.about2);
  document.title = name + " – skiss av Northline Studio";

  var list = document.getElementById("services");
  d.services.forEach(function (s) {
    var li = document.createElement("li");
    li.className = "service";
    var n = document.createElement("span"); n.className = "service__name"; n.textContent = s[0];
    var p = document.createElement("span"); p.className = "service__price"; p.textContent = s[1];
    li.appendChild(n); li.appendChild(p);
    if (s[2]) { var desc = document.createElement("span"); desc.className = "service__desc"; desc.textContent = s[2]; li.appendChild(desc); }
    list.appendChild(li);
  });

  /* ---------- Mät banner och list så att innehållet inte hamnar under dem ---------- */
  var bar = document.querySelector(".sketch-bar");
  var offer = document.querySelector(".offer");
  function measure() {
    var root = document.documentElement.style;
    root.setProperty("--bar-h", bar.offsetHeight + "px");
    root.setProperty("--offer-h", (window.innerWidth < 900 ? offer.offsetHeight : 0) + "px");
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
})();
