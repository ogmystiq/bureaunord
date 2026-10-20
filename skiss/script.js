/* Skiss från Northline Studio.
   Läser namn, stad, bransch, adress, telefon och salongens eget innehåll och fyller sidan.
   Uppgifterna kommer från 404.html (korta länkar /skiss/<slug>, via window.SKISS_DATA)
   eller från ?n= (namn), ?s= (stad), ?t= (bransch), ?a= (adress), ?p= (telefon) i länken.
   Eget innehåll (tagline, om, tjänster, fördelar, öppettider, bokningslänk) kommer bara via webhooken.
   SÄKERHET: allt från länken sätts in med textContent, aldrig innerHTML. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  /* ---------- Läs och städa uppgifterna ---------- */
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
  var name = clean(pick("namn", "n"), 60) || "Er salong";
  var city = clean(pick("stad", "s"), 60);
  var type = clean(pick("typ", "t"), 20).toLowerCase();
  var address = clean(pick("adress", "a"), 120);
  var phone = clean(pick("telefon", "p"), 30);
  var phoneHref = phone.replace(/[^\d+]/g, "");
  if (phoneHref.length < 6) { phone = ""; phoneHref = ""; }

  /* ---------- Fem visuella familjer ---------- */
  var FAMILIES = {
    ljus:    { fonts: "family=Gloock&family=Albert+Sans:wght@400;500;600", color: "#fbfbf9" },
    mode:    { fonts: "family=Syne:wght@600;700;800&family=Manrope:wght@400;500;700", color: "#ffffff" },
    klinik:  { fonts: "family=Spectral:wght@300;400&family=Work+Sans:wght@400;500;600", color: "#f3f6f5" },
    massing: { fonts: "family=Big+Shoulders+Display:wght@600;800&family=Libre+Franklin:wght@400;500;700", color: "#0e0e0e" },
    black:   { fonts: "family=Anybody:wdth,wght@75..150,500..900&family=IBM+Plex+Mono:wght@400;500;600", color: "#121212" }
  };

  /* Foton från Unsplash: [id, alt-text, beskärning] */
  var P = {
    F1: ["1560066984-138dadb4c035", "Ljus salong med höga fönster och stolar längs väggen", "40% 55%"],
    F2: ["1521590832167-7bcbfaa6381f", "Rosa frisörstolar framför en lång spegel", "50% 60%"],
    F3: ["1600948836101-f9ffda59d250", "Salong med mörkgrön vägg, runda speglar och frisörstolar", "50% 50%"],
    F4: ["1746723375184-5f537d2e6f31", "Ljus frisörsalong med valvöppning, en frisör arbetar vid stolen", "50% 50%"],
    F5: ["1675034743339-0b0747047727", "Frisörer som klipper och föner kunder framför runda speglar", "40% 50%"],
    F6: ["1781450090585-1a511b7066d9", "Vit salong med stolar framför runda speglar", "50% 60%"],
    M1: ["1741934023052-26baf5535088", "Massör masserar nacken på en kund som ligger på en vit handduk", "50% 45%"],
    M2: ["1790244338456-af6194d2436e", "Händer som masserar en kunds ansikte och tinningar", "50% 40%"],
    N1: ["1632345031435-8727f6897d53", "Manikyr på ett vitt bord, nagelterapeuten arbetar med nagelbanden", "60% 50%"],
    N2: ["1676926606566-58f2e00b592b", "Nagelterapeut filar och formar en kunds naglar", "50% 45%"],
    N3: ["1693776529070-2cdea397595b", "Kundens händer under en lampa när gellacket härdar", "50% 50%"],
    N4: ["1737214475292-949c0bf920b0", "Händer i svarta handskar målar en nagel med tunn pensel", "50% 40%"],
    L1: ["1589710751893-f9a6770ad71b", "Närbild på fransförlängning med pincett", "50% 40%"],
    L2: ["1674049406467-824ea37c7184", "Fransstylist sätter fransförlängning på en kund som ligger ner", "50% 50%"],
    L3: ["1639629509821-c54cdd984227", "Närbild på ett öga med formade bryn och långa fransar", "50% 50%"],
    L4: ["1528047128849-2382ff646073", "Ansikte med fylliga fransar och formade bryn", "50% 40%"],
    H1: ["1782159981479-5e90597f284a", "Kund som ligger avslappnad under en ansiktsbehandling", "50% 45%"],
    H2: ["1706795033728-9232ef548a16", "Terapeut masserar ansiktet på en kund under en behandling", "50% 30%"],
    H3: ["1570172619644-dfd03ed5d881", "Terapeut penslar på en ansiktsmask på en kund med hårband", "50% 45%"],
    H4: ["1761718210089-ba3bb5ccb54f", "Kund med ansiktsmask under en hudvårdsbehandling", "50% 40%"],
    B1: ["1626379499242-52863d313084", "Barberarstol sedd genom en rund spegel", "45% 50%"],
    B3: ["1771489465791-00ee339a9c92", "Barberare klipper kunder i en full salong, svartvit bild", "50% 40%"],
    B4: ["1781768526571-ef9c333279c7", "Rad med barberarstolar och speglar i en mörk salong", "50% 50%"],
    B6: ["1631648080466-906e6a83dc7d", "Barberare trimmar en kunds skägg med trimmer", "62% 35%"],
    T1: ["1769605767720-6b512d96aa4e", "Tatuerare arbetar på en kunds rygg i en studio med rosa ljus", "50% 45%"],
    T2: ["1783973190331-53d4db4f697f", "Tatueringsstudio med neonslinga på väggen", "50% 40%"],
    T3: ["1568515045052-f9a854d70bfd", "Händer i vita handskar tatuerar en arm", "50% 40%"],
    T4: ["1724343163782-52276ca2e6c2", "Tatuerare i svarta handskar med tatueringsmaskin", "50% 50%"],
    T5: ["1605647533135-51b5906087d0", "Tatuerare vid sin arbetsplats i en studio, svartvit bild", "50% 50%"],
    B2: ["1614438865362-9137f7e3036e", "Ljus barbershop med stolar framför stora fönster", "50% 50%"],
    B5: ["1643788570573-5589aa016dc1", "Barberarstol i en ljus salong med växter och spegel", "50% 60%"]
  };

  var STEPS_DEFAULT = [
    ["Boka", "Välj behandling och en tid som passar dig, direkt här på sidan."],
    ["På plats", ""],
    ["Efteråt", "Du får råd om hur du tar hand om resultatet hemma."]
  ];

  /* ---------- Branschdata (exempeltexter och exempelpriser) ---------- */
  var DATA = {
    frisor: { fam: "ljus", label: "Frisör", hero: P.F4, about: P.F6, gallery: [P.F5, P.F3, P.F1],
      lead: "Klipp, färg och styling. Boka tid online när det passar dig.",
      intro: "Klipp, färg och styling i lugnt tempo, med tid för varje kund.",
      visit: "Varje besök börjar med en kort konsultation, så att resultatet passar både håret och vardagen.",
      services: [["Damklippning", "695 kr", "Med tvätt och styling."], ["Herrklippning", "495 kr", ""], ["Barnklippning", "345 kr", "Upp till 12 år."], ["Färgning", "från 995 kr", "Pris efter hårlängd."], ["Slingor", "från 1 195 kr", ""], ["Tvätt och föning", "395 kr", ""]] },
    massage: { fam: "ljus", label: "Massage", pricesTitle: "Massage", hero: P.M1, about: P.H4, gallery: [P.M2, P.H2, P.H1],
      lead: "Massage för spända muskler, återhämtning och avslappning.",
      intro: "Massage för spända muskler, återhämtning och ren avslappning.",
      visit: "Vi börjar med en kort genomgång av hur du mår och anpassar trycket efter dig.",
      steps: [["Boka", "Välj längd på massagen och en tid som passar dig."], ["Före massagen", ""], ["Efteråt", "Ta det lugnt en stund och drick vatten. Boka gärna nästa tid direkt."]],
      services: [["Klassisk massage, 30 min", "495 kr", ""], ["Klassisk massage, 60 min", "795 kr", ""], ["Djupvävnadsmassage, 60 min", "895 kr", ""], ["Avslappningsmassage, 60 min", "795 kr", ""], ["Gravidmassage, 60 min", "845 kr", ""]] },
    nagel: { fam: "mode", label: "Nagelstudio", hero: P.N1, about: P.F2, gallery: [P.N2, P.N4, P.N3],
      lead: "Gellack, förlängning och nail art. Boka tid online.",
      intro: "Gellack, förlängning och nail art, gjort med noggrann nagelvård.",
      visit: "Vi går igenom form, längd och färg innan vi börjar, och tar oss tid för nagelbanden.",
      services: [["Gellack", "495 kr", "Med nagelbandsvård."], ["Nagelförlängning, nytt set", "från 895 kr", ""], ["Påfyllning", "695 kr", ""], ["Manikyr", "495 kr", ""], ["Pedikyr", "595 kr", ""], ["Nail art", "från 50 kr/nagel", ""]] },
    lash: { fam: "mode", label: "Fransstudio", hero: P.L2, about: P.F6, gallery: [P.L1, P.L3, P.L4],
      lead: "Fransförlängning och lash lift. Boka tid online.",
      intro: "Fransförlängning och lash lift med ett naturligt, hållbart resultat.",
      visit: "Vi hjälper dig att välja längd och volym som passar dina ögon och din vardag.",
      services: [["Klassiska fransar, nytt set", "895 kr", ""], ["Volymfransar, nytt set", "1 195 kr", ""], ["Påfyllning, 2–3 veckor", "595 kr", ""], ["Lash lift", "650 kr", ""], ["Lash lift med färg", "750 kr", ""], ["Borttagning", "250 kr", ""]] },
    bryn: { fam: "mode", label: "Brynstudio", hero: P.L3, about: P.F6, gallery: [P.L4, P.L1, P.L2],
      lead: "Formning, färg och lamination. Boka tid online.",
      intro: "Formning, färg och lamination, anpassat efter ditt ansikte.",
      visit: "Formen anpassas efter ditt ansikte, och vi visar hur du sköter brynen hemma.",
      services: [["Brynformning", "350 kr", ""], ["Formning och färg", "450 kr", ""], ["Brow lamination", "650 kr", ""], ["Lamination med färg", "750 kr", ""], ["Fransfärg", "250 kr", ""]] },
    hudvard: { fam: "klinik", label: "Hudvård", hero: P.H2, about: P.H1, gallery: [P.H3, P.H4, P.M2],
      lead: "Ansiktsbehandlingar anpassade efter din hud. Boka online.",
      intro: "Ansiktsbehandlingar och hudvård som utgår från just din hud.",
      visit: "Första besöket börjar med en hudanalys, så att behandlingen passar din hud.",
      services: [["Hudanalys med konsultation", "450 kr", ""], ["Ansiktsbehandling", "895 kr", ""], ["Djuprengöring", "995 kr", ""], ["Kemisk peeling", "från 1 095 kr", ""], ["Microneedling", "från 1 695 kr", ""]] },
    skonhet: { fam: "klinik", label: "Skönhetssalong", hero: P.H3, about: P.H4, gallery: [P.H1, P.N1, P.H2],
      lead: "Ansikte, bryn, fransar och naglar under samma tak.",
      intro: "Ansikte, bryn, fransar och naglar under samma tak.",
      visit: "Kombinera gärna flera behandlingar vid samma besök, så planerar vi tiden åt dig.",
      services: [["Ansiktsbehandling", "895 kr", ""], ["Brynformning och färg", "450 kr", ""], ["Fransfärg", "250 kr", ""], ["Lash lift", "650 kr", ""], ["Vaxning, ben", "495 kr", ""], ["Manikyr", "495 kr", ""]] },
    fotvard: { fam: "klinik", label: "Fotvård", hero: P.H1, about: P.M1, gallery: [P.H2, P.N3, P.H4],
      lead: "Medicinsk fotvård och spabehandlingar för fötterna.",
      intro: "Medicinsk fotvård och spabehandlingar för fötter som behöver omsorg.",
      visit: "Vi går igenom fötternas behov vid första besöket och ger råd om skötsel hemma.",
      services: [["Medicinsk fotvård", "595 kr", ""], ["Fotvård med lack", "695 kr", ""], ["Nagelvård", "395 kr", ""], ["Förhårdnader och hälsprickor", "495 kr", ""], ["Spapedikyr", "795 kr", ""]] },
    barberare: { fam: "massing", label: "Barbershop", pricesTitle: "Tjänster", hero: P.B3, about: P.B5, gallery: [P.B6, P.B4, P.B1],
      lead: "Klipp, fades och skägg. Boka tid online.",
      intro: "Klipp, fades och skäggvård, gjort ordentligt och utan stress.",
      visit: "Varje besök börjar med ett kort samtal om vad du vill ha.",
      steps: [["Boka", "Välj tjänst och en tid som passar dig, direkt här på sidan."], ["I stolen", ""], ["Klart", "Vi visar hur du stylar själv, så att det ser lika bra ut hemma."]],
      services: [["Herrklipp", "450 kr", "Med tvätt och styling."], ["Skinfade", "520 kr", ""], ["Skäggtrim", "300 kr", "Med konturer och skäggolja."], ["Rakning med varm handduk", "450 kr", ""], ["Klipp och skägg", "695 kr", ""], ["Barnklipp", "320 kr", "Upp till 12 år."]] },
    tatuering: { fam: "black", label: "Tatueringsstudio", pricesTitle: "Priser", hero: P.T1, about: P.T5, gallery: [P.T3, P.T4, P.T2],
      lead: "Egna motiv och flash. Boka en konsultation online.",
      intro: "Egna motiv och flash, från första skiss till färdig tatuering.",
      visit: "",
      steps: [["Konsultation", "Berätta om din idé. Vi går igenom motiv, storlek och placering."], ["Sittningen", "Allt förbereds rent och sterilt, och vi tar pauser när du behöver."], ["Läkning", "Du får skötselråd med dig hem och kan alltid höra av dig med frågor."]],
      services: [["Konsultation", "Kostnadsfri", "Idé, storlek och placering."], ["Mindre tatuering", "från 1 200 kr", ""], ["Timpris", "från 1 300 kr/tim", ""], ["Heldag", "från 7 500 kr", ""], ["Cover-up", "Enligt offert", ""]] }
  };
  var FALLBACK = { fam: "ljus", label: "Salong", hero: P.F1, about: P.F3, gallery: [P.F6, P.F2, P.F5],
    lead: "Boka tid online när det passar dig.",
    intro: "Hos oss får varje besök ta den tid det behöver.",
    visit: "Vi börjar med en kort pratstund om vad du vill ha, så att resultatet blir rätt.",
    services: [["Behandling ett", "från 495 kr", ""], ["Behandling två", "från 695 kr", ""], ["Behandling tre", "från 895 kr", ""], ["Paketbehandling", "från 1 195 kr", ""]] };

  /* ---------- Salongens eget innehåll (från deras sida, via webhooken) ---------- */
  function capsFix(s) {
    // Ord i VERSALER med 4+ bokstäver skrivs om (BOTOX -> Botox). Kortare förkortningar (PRP, IPL) lämnas.
    return s.replace(/(^|[^\p{L}])(\p{Lu}{4,})(?=$|[^\p{L}])/gu, function (m, pre, w) { return pre + w.charAt(0) + w.slice(1).toLowerCase(); });
  }
  function trimCut(s) {
    // Text som verkar avklippt mitt i ett ord (60+ tecken, slutar på bokstav utan skiljetecken) kortas till sista hela ordet
    var c = Array.from(s);
    if (c.length >= 58 && /\p{L}$/u.test(s) && s.lastIndexOf(" ") > 20) return s.slice(0, s.lastIndexOf(" ")).replace(/[\s,-]+$/, "") + "…";
    return s;
  }
  function own(v, max) { return capsFix(clean(v, max)); }
  var C = null;
  var raw = given && given.innehall && typeof given.innehall === "object" ? given.innehall : null;
  if (raw) {
    C = {
      tagline: own(raw.tagline, 140),
      om: own(raw.om, 700),
      tjanster: (Array.isArray(raw.tjanster) ? raw.tjanster : []).slice(0, 30).map(function (t) {
        t = t || {}; return { namn: own(t.namn, 70), pris: clean(t.pris, 40), info: own(t.info, 160) };
      }).filter(function (t) { return t.namn; }).slice(0, 10),
      fordelar: (Array.isArray(raw.fordelar) ? raw.fordelar : []).slice(0, 10).map(function (f) { return trimCut(own(f, 90)); }).filter(Boolean).slice(0, 4),
      oppettider: (Array.isArray(raw.oppettider) ? raw.oppettider : []).slice(0, 14).map(function (o) {
        o = o || {}; return { dag: clean(o.dag, 20), tid: clean(o.tid, 40) };
      }).filter(function (o) { return o.dag && o.tid; }).slice(0, 7),
      bokningslank: (function (u) {
        u = clean(u, 300);
        if (!/^https:\/\//i.test(u)) return "";
        try { return new URL(u).protocol === "https:" ? u : ""; } catch (e) { return ""; }
      })(raw.bokningslank)
    };
  }

  /* Fel bransch i datan: en frisör som fått typ nagel/lash/bryn visas som frisör */
  /* Eget innehåll räknas bara om det finns text från dem (inte bara tider eller en länk) */
  var ownText = !!(C && (C.tagline || C.om || C.tjanster.length || C.fordelar.length));
  var dKey = Object.prototype.hasOwnProperty.call(DATA, type) ? type : "";
  if (C && /^(nagel|lash|bryn)$/.test(dKey) && /frisör|hårvård|klippning|frisyr/i.test(C.tagline + " " + C.om)) dKey = "frisor";
  var d = dKey ? DATA[dKey] : FALLBACK;
  var fam = FAMILIES[d.fam];

  /* ---------- Familj och typsnitt ---------- */
  document.body.className = "fam-" + d.fam + (ownText ? " has-content" : "");
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?" + fam.fonts + "&display=swap";
  document.head.appendChild(font);
  document.getElementById("theme-color").setAttribute("content", fam.color);

  /* ---------- Hjälpare ---------- */
  function $(id) { return document.getElementById(id); }
  function setText(e, text) { if (e) e.textContent = text; }
  function show(e, on) { if (e) e.hidden = !on; }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function photo(img, p, sizes) {
    var u = function (w) { return "https://images.unsplash.com/photo-" + p[0] + "?auto=format&fit=crop&w=" + w + "&q=80"; };
    img.srcset = u(800) + " 800w, " + u(1200) + " 1200w, " + u(1600) + " 1600w";
    if (sizes) img.sizes = sizes;
    img.src = u(1200);
    img.alt = p[1];
    img.style.objectPosition = p[2];
  }
  var here = window.location.pathname + window.location.search;

  /* ---------- Bokning: deras länk, annars telefon, annars Hitta hit ---------- */
  var book = C && C.bokningslank ? { href: C.bokningslank, ext: true } : phone ? { href: "tel:" + phoneHref, ext: false } : { href: here + "#hitta", ext: false };
  document.querySelectorAll("[data-book]").forEach(function (a) {
    a.href = book.href;
    if (book.ext) { a.target = "_blank"; a.rel = "noopener"; }
  });
  if (!book.ext && phone) {
    setText($("q-book-link"), "Ring och boka");
    setText($("hours-cta").querySelector("a"), "Ring och boka");
  }

  /* ---------- Texter (endast textContent) ---------- */
  var place = city ? d.label + " i " + city : d.label;
  document.querySelectorAll('[data-fill="name"]').forEach(function (e) { setText(e, name); });
  setText($("kind"), place);
  setText($("hero-tagline"), C && C.tagline ? C.tagline : d.lead);
  setText($("prices-title"), ownText && C.tjanster.length ? (d.pricesTitle === "Priser" ? "Tatueringar" : d.pricesTitle || "Behandlingar") : d.pricesTitle || "Behandlingar och priser");
  if (C && C.om) {
    setText($("about-text"), C.om);
    $("about-text").classList.toggle("about__lead--long", Array.from(C.om).length > 260);
    show($("about-2"), false);
  } else {
    setText($("about-text"), d.intro);
    setText($("about-2"), city ? "Du hittar oss i " + city + ". Boka tid direkt här på sidan, eller hör av dig om du har frågor." : "Boka tid direkt här på sidan, eller hör av dig om du har frågor.");
  }
  show($("from-site"), ownText);
  show($("note-about"), !!(C && C.om));
  setText($("note-seo"), "Byggd för Google: “" + place + "” i rubrik och kod");
  setText($("footer-place"), [address || city, phone].filter(Boolean).join(", "));

  /* ---------- Foton: branschens bilder, i en ordning som beror på namnet ---------- */
  /* Två salonger i samma bransch får då olika hero, om-bild och galleri. */
  var pool = [d.hero, d.about || d.gallery[0]].concat(d.gallery);
  var hash = 0;
  Array.from(name).forEach(function (ch) { hash = (hash * 31 + ch.codePointAt(0)) % 9973; });
  var shift = hash % pool.length;
  pool = pool.slice(shift).concat(pool.slice(0, shift));
  photo($("hero-img"), pool[0], "100vw");
  photo($("about-img"), pool[1], "(min-width: 900px) 45vw, 100vw");
  var gallery = $("gallery");
  pool.slice(2, 5).forEach(function (p, i) {
    var fig = el("figure", "gallery__item gallery__item--" + (i + 1));
    var img = el("img");
    img.width = 1200; img.height = 900;
    img.loading = "lazy";
    img.decoding = "async";
    photo(img, p, i === 0 ? "(min-width: 900px) 60vw, 100vw" : "(min-width: 900px) 35vw, 50vw");
    fig.appendChild(img);
    gallery.appendChild(fig);
  });

  /* ---------- Behandlingar: deras, annars branschens exempel ---------- */
  var own_services = C && C.tjanster.length ? C.tjanster : null;
  var services = own_services || d.services.map(function (s) { return { namn: s[0], pris: s[1], info: s[2] }; });
  var list = $("services");
  services.forEach(function (s) {
    var li = el("li", "service");
    li.appendChild(el("span", "service__name", s.namn));
    if (s.pris) li.appendChild(el("span", "service__price", s.pris));
    if (s.info) li.appendChild(el("span", "service__desc", s.info));
    list.appendChild(li);
  });
  list.classList.toggle("services--long", services.length > 5);
  show($("price-note"), !own_services);
  show($("price-cta"), book.ext && !!own_services && !own_services.some(function (s) { return s.pris; }));

  /* ---------- Trygghet: bara deras egna fakta ---------- */
  if (C && C.fordelar.length) {
    var tl = $("trust-list");
    C.fordelar.forEach(function (f) { tl.appendChild(el("li", "trust__item", f)); });
    show($("trust"), true);
  }

  /* ---------- Så går ett besök till (bara utan eget innehåll, texten är generisk) ---------- */
  if (!ownText) {
    var steps = $("steps");
    (d.steps || STEPS_DEFAULT).forEach(function (s) {
      var li = el("li", "step");
      li.appendChild(el("h3", "", s[0]));
      li.appendChild(el("p", "", s[1] || d.visit));
      steps.appendChild(li);
    });
    show($("besok"), true);
  }

  /* ---------- Öppettider: bara deras, aldrig påhittade ---------- */
  var hours = C ? C.oppettider : [];
  if (hours.length) {
    var dl = $("hours");
    hours.forEach(function (o) {
      var row = el("div");
      row.appendChild(el("dt", "", o.dag));
      row.appendChild(el("dd", "", o.tid));
      dl.appendChild(row);
    });
    show(dl, true);
    show($("hours-cta"), false);
  } else if (!book.ext && !phone) {
    show($("tider").querySelector(".info__hours"), false);
  }

  /* ---------- Vanliga frågor: bara de vi kan svara på ---------- */
  function faq(id, answer) {
    if (!answer) return;
    setText($(id).querySelector("p"), answer);
    show($(id), true);
  }
  faq("faq-address", address ? "Du hittar oss på " + address + ". Längre ner på sidan finns en karta med vägbeskrivning." : "");
  faq("faq-book", book.ext ? "Boka direkt online med knappen Boka tid." + (phone ? " Du kan också ringa oss på " + phone + "." : "")
    : phone ? "Ring oss på " + phone + " så hittar vi en tid som passar." : "");
  faq("faq-hours", hours.length ? hours.map(function (o) { return o.dag + " " + o.tid; }).join(", ") + "." : "");
  if ($("faq").querySelectorAll("details:not([hidden])").length === 0) show($("faq"), false);
  if ($("faq").hidden && $("tider").querySelector(".info__hours").hidden) show($("tider"), false);
  document.querySelector("#snabbinfo .note").hidden = !(address || phone);
  document.querySelector("#hitta .note").hidden = !address;

  /* ---------- Adress, karta och telefon (döljs helt om de saknas) ---------- */
  if (address) {
    setText($("address"), address);
    var maps = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(address);
    $("maps-link").href = maps;
    show($("address-block"), true);
    $("map").src = "https://maps.google.com/maps?q=" + encodeURIComponent(address) + "&output=embed";
    $("map").title = "Karta över " + address;
    show($("map-wrap"), true);
    document.querySelector(".find").classList.add("find--map");
    setText($("q-address-link"), address);
    $("q-address-link").href = here + "#hitta";
    show($("q-address"), true);
  }
  if (phone) {
    setText($("phone"), phone);
    $("phone").href = "tel:" + phoneHref;
    show($("phone-block"), true);
    setText($("q-phone-link"), phone);
    $("q-phone-link").href = "tel:" + phoneHref;
    show($("q-phone"), true);
  }

  var firstQuick = document.querySelector(".quick__list li:not([hidden])");
  if (firstQuick) firstQuick.classList.add("is-first");

  /* ---------- SEO: titel, beskrivning och schema.org ---------- */
  document.title = name + " – " + place;
  function sentence(t) { t = t.trim(); return t && !/[.!?…]$/.test(t) ? t + "." : t; }
  var firstOm = C && C.om ? (C.om.match(/^[^.!?]+[.!?]/) || [C.om])[0] : "";
  var desc = C && (C.tagline || C.om) ? [sentence(C.tagline || ""), sentence(firstOm)].filter(Boolean).join(" ") : d.lead;
  desc = Array.from(desc);
  $("meta-description").setAttribute("content", (desc.length > 155 ? desc.slice(0, 154).join("") + "…" : desc.join("")));
  var LD_TYPE = { frisor: "HairSalon", barberare: "HairSalon", nagel: "NailSalon", lash: "BeautySalon", bryn: "BeautySalon", skonhet: "BeautySalon", tatuering: "TattooParlor", hudvard: "HealthAndBeautyBusiness", fotvard: "HealthAndBeautyBusiness", massage: "HealthAndBeautyBusiness" };
  var ld = { "@context": "https://schema.org", "@type": LD_TYPE[dKey] || "BeautySalon", name: name };
  if (C && (C.tagline || C.om)) ld.description = C.tagline || C.om;
  if (address) ld.address = { "@type": "PostalAddress", streetAddress: address, addressLocality: city || undefined, addressCountry: "SE" };
  else if (city) ld.address = { "@type": "PostalAddress", addressLocality: city, addressCountry: "SE" };
  if (phone) ld.telephone = phone;
  var DAYS = { "mån": "Monday", "tis": "Tuesday", "ons": "Wednesday", "tor": "Thursday", "fre": "Friday", "lör": "Saturday", "sön": "Sunday" };
  var ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  function dayList(s) {
    if (!/^(mån|tis|ons|tor|fre|lör|sön)[a-zåäö]*(\s*[–-]\s*(mån|tis|ons|tor|fre|lör|sön)[a-zåäö]*)?$/i.test(s.trim())) return [];
    var parts = s.toLowerCase().split(/\s*[–-]\s*/).map(function (x) { return DAYS[x.slice(0, 3)]; });
    if (parts.length === 1) return parts[0] ? [parts[0]] : [];
    if (parts.length === 2 && parts[0] && parts[1]) return ORDER.slice(ORDER.indexOf(parts[0]), ORDER.indexOf(parts[1]) + 1);
    return [];
  }
  function hhmm(h, m) { return ("0" + h).slice(-2) + ":" + (m || "00"); }
  var spec = [];
  hours.forEach(function (o) {
    var t = o.tid.match(/^(\d{1,2})(?:[.:](\d{2}))?\s*[–-]\s*(\d{1,2})(?:[.:](\d{2}))?$/);
    var days = dayList(o.dag);
    if (t && days.length) spec.push({ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: hhmm(t[1], t[2]), closes: hhmm(t[3], t[4]) });
  });
  if (spec.length) ld.openingHoursSpecification = spec;
  $("ld").textContent = JSON.stringify(ld);

  /* ---------- Ingen bokningslänk och inget telefonnummer: visa vad som kopplas in ---------- */
  if (!book.ext && !phone) {
    var toast = $("toast"), timer;
    document.querySelectorAll("[data-book]").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        toast.textContent = "Det här är en skiss. Här kopplas ert bokningssystem in, till exempel Bokadirekt.";
        toast.classList.add("is-visible");
        clearTimeout(timer);
        timer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3400);
      });
    });
  }

  /* ---------- "Vad vi har tänkt på": anteckningar av som standard ---------- */
  var toggle = $("notes-toggle");
  toggle.addEventListener("click", function () {
    var on = !document.body.classList.contains("show-notes");
    document.body.classList.toggle("show-notes", on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
  });

  /* ---------- Listen längst ner: visas först efter hero ---------- */
  var bar = document.querySelector(".sketch-bar");
  var offer = $("offer");
  var hero = document.querySelector(".hero");
  function measure() {
    var root = document.documentElement.style;
    root.setProperty("--bar-h", bar.offsetHeight + "px");
    root.setProperty("--offer-h", offer.offsetHeight + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      offer.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(hero);
  } else {
    offer.classList.add("is-visible");
  }
})();
