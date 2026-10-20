# Skiss-sidan: personlig sida byggd på salongens eget innehåll

Datum: 2026-10-20 · Ägare: Jonte (Northline Studio) · Gäller: `skiss/`, `404.html`, `CLAUDE.md`

## Varför
En mottagare av säljmejlet svarade: "En hemsida är mer än bara en boka-knapp, den ska skapa nyfikenhet, ge information,
berätta en story, skapa trygghet, locka kunder, vara anpassad för SEO … Din gör inget av dessa." Han har rätt: skissen
är en branschmall med samma text för alla (en botox-klinik fick "hudanalys, kemisk peeling"). Skissen ska kännas som
**deras** sida, fast mycket bättre, och visa varför den är bättre.

## Mål
1. När webhooken skickar `innehall` byggs sidan av salongens egna texter, tjänster, fördelar, tider och bokningslänk.
2. Sidan svarar på kritiken: nyfikenhet (hero + tagline), information (snabbinfo, behandlingar, tider, frågor),
   story (om oss med foto), trygghet (fördelar), lokal SEO (titel, rubriker, JSON-LD, adress + karta).
3. En knapp i bannern, "Vad vi har tänkt på", visar små anteckningar som förklarar valen (av som standard).
4. Utan `innehall` fungerar sidan som i dag, men utan påhittade öppettider och med priserna märkta som exempel.

## Icke-mål
- Ingen indexering: sidan är fortfarande `noindex, nofollow` och ligger inte i sitemap.
- Inga egna foton från salongen (vi har bara text). Stämningsfoton från Unsplash per bransch som i dag.
- Ingen ändring i n8n-flödena (men se "Data som borde rättas i n8n").

## Anti-mål (då har vi misslyckats även om det "fungerar")
- Något påhittat syns: priser, tider, recensioner, personer, fakta som inte kommer från dem.
- Data från webhooken sätts in med `innerHTML`, eller en länk som inte är `https://` blir klickbar.
- Sidan ser ut som en mall: versaletiketter, identiska kort, ikon-rader, gradientord, fade-in överallt.
- Sidledsscroll i mobilen, konsolfel eller kontrast under AA.

## Data
Webhook `GET https://mystiq.app.n8n.cloud/webhook/skiss?slug=<slug>` →
`{ hittad, namn, stad, typ, adress, telefon, innehall }`. `innehall` är `null` eller
`{ tagline, om, tjanster:[{namn,pris,info}], fordelar:[str], oppettider:[{dag,tid}], bokningslank }`.

**Tvätt i 404.html** (allt är strängar efteråt, annat kastas):
| fält | regel |
|---|---|
| namn, stad | max 60 tecken |
| typ | max 20 |
| adress | max 120 · telefon max 30 |
| tagline | max 140 · om max 700 |
| tjanster | max 10 st, namn max 70, pris max 40, info max 160, tomt namn kastas |
| fordelar | max 4 st, max 90 tecken |
| oppettider | max 7 st, dag max 20, tid max 40 |
| bokningslank | bara om den börjar med `https://`, går att tolka som URL och är max 300 tecken; annars tom |

`skiss/script.js` tvättar samma fält igen (kontrolltecken bort, längder) och sätter allt med `textContent`.
Reservvarianten `?n=&s=&t=&a=&p=` behålls oförändrad (inget `innehall` via URL).

**Normalisering:** ord i VERSALER med 4+ bokstäver skrivs om till versal + gemener (BOTOX → Botox, HUDVÅRD → Hudvård,
FRAX 1550 → Frax 1550). Kortare förkortningar (PRP/PRF, IPL, RF, ZO) lämnas. En fördel som verkar avklippt mitt i
ett ord (60+ tecken och slutar utan skiljetecken mitt i ett ord) kortas till sista hela ordet.

## Sidans innehåll när `innehall` finns
1. **Banner** (som i dag) + raden "Texterna kommer från er nuvarande sida." + knappen "Vad vi har tänkt på" (`aria-pressed`).
2. **Hero:** stort branschfoto, namnet som h1, deras tagline, "Boka tid" + "Se behandlingar".
3. **Snabbinfo** direkt under hero: adress (länk till kartan på sidan), telefon (tel-länk), bokning. Bara det som finns.
4. **Om oss:** h2 "Om {namn}", deras om-text bredvid ett stämningsfoto.
5. **Behandlingar:** deras tjänster som rader: namn, info under, pris till höger bara om det finns. Saknas alla priser:
   en rad "Priser och lediga tider ser du i bokningen" med länk.
6. **Trygghet** (bara om fordelar finns): h2 "Bra att veta om {namn}", deras fördelar som 2–4 tydliga påståenden med
   en tunn accentlinje, inte kort.
7. **Galleri:** 3 stämningsfoton per bransch (som i dag).
8. **Öppettider:** deras tider om de finns. Annars inga tider, bara "Se lediga tider" till bokningen (eller ring).
9. **Vanliga frågor** (native `<details>`): "Var ligger ni?" (adress), "Hur bokar jag?" (bokning/telefon),
   "När har ni öppet?" (tider). Bara frågor med svar visas. Sektionen döljs om ingen fråga har svar.
10. **Hitta hit:** adress, inbäddad Google-karta, "Visa vägen", telefon.
11. **Sidfot:** namn, adress, telefon, liten Northline-rad.

**Boka tid-knapparna** (header, hero, öppettider): bokningslänk (`target="_blank" rel="noopener"`) → annars `tel:` →
annars hopp till Hitta hit. Ingen demo-toast när en riktig länk finns.

"Så går ett besök till" visas bara utan `innehall` (texten är generisk).

## Utan `innehall`
Som i dag (branschtexter, exempelpriser, galleri, besök, hitta hit) med ändringarna: inga påhittade öppettider
("Se lediga tider" i stället), en diskret rad "Exempelpriser – era egna läggs in när sidan byggs" under rubriken
Behandlingar, Vanliga frågor med de frågor som har svar (adress/bokning).

## SEO (säljpoäng, sidan är ändå noindex)
- `<title>`: "{namn} – {Bransch} i {stad}" (utan stad: "{namn} – {Bransch}").
- `<meta name="description">`: tagline + första meningen ur om (max 155 tecken), annars branschtexten.
- En h1 (namnet), h2 per sektion, h3 per tjänst saknas inte i struktur (listan är `ul`; tjänstenamn är text, ok).
- JSON-LD i `<script type="application/ld+json">` byggd med `JSON.stringify` och satt med `textContent`:
  `@type` HairSalon (frisör, barber), NailSalon (nagel), BeautySalon (lash, bryn, skönhet), TattooParlor (tatuering),
  HealthAndBeautyBusiness (hudvård, fotvård, massage). Fält: name, address (streetAddress som text), telephone,
  url, openingHoursSpecification bara för tider som går att tolka ("Tis 9–18" → Tuesday 09:00–18:00).

## "Vad vi har tänkt på"
Knapp i bannern slår på klassen `show-notes` på body. Små anteckningar (`<p class="note">`, dolda annars) vid:
hero "Bokning direkt på första skärmen"; snabbinfo "Adress och telefon syns direkt, även i mobilen";
title/SEO "Byggd för Google: '{Bransch} i {stad}' i rubrik och kod"; behandlingar "Varje behandling på egen rad, så
förstår både kunder och Google vad ni gör"; trygghet "Era meriter lyfts fram och skapar trygghet före första besöket";
frågor "Svar på det kunder undrar mest"; hitta hit "Adress och karta ger lokal synlighet"; sidfot "Snabb och byggd för
mobilen". Bara de anteckningar vars sektion syns. Stil: liten mörk etikett med accentprick, i normal skrivning.

## Design
Behåll de fem familjerna (ljus, mode, klinik, mässing, bläck) med egna typsnitt/färger. Ny rytm: hero → snabbinfo-rad →
om oss (foto + text, växlande sida) → behandlingar (två kolumner på dator vid många rader) → trygghet (stora påståenden)
→ galleri → tider + frågor → hitta hit med karta → sidfot. Fasta bildformat, AA-kontrast, typsnitt via Google Fonts
med riktiga fallbacks. En enda laddningsanimation (namnet). Ingen ny motion utöver `<details>` och anteckningarna.

## Bransch när typ är fel (beslut: mitt val)
Om `typ` är nagel/lash/bryn men tagline eller om innehåller "frisör", "hårvård", "klippning" eller "frisyr",
används frisörfamiljen (foton och typsnitt). Exempel: Art Of Hair har `typ: bryn`. Detta är en gissning på sidan;
den riktiga rättningen hör hemma i n8n.

## Data som borde rättas i n8n (rapporteras till Jonte)
- Art Of Hair (art-of-hair-norrkoping) har `typ: "bryn"` men är en frisör.
- Faceboost: fördelen "…injektions- och laserbehandli" är avklippt mitt i ordet i n8n (60 tecken?).

## Testlänkar (från Jonte)
Med innehåll: `skinclinic-nkpg-norrkoping`, `art-of-hair-norrkoping`, `hudvis-linkoping`, `faceboost-klinik-linkoping`,
`hud-och-kroppshalsan-norrkoping`. Utan innehåll (`innehall: null`): `plaza-norrkoping`, `aajt-tattoo-linkoping`.
Webhooken svarar redan live med `innehall` (hämtat 2026-10-20 via Firecrawl). Observerat: priser saknas i alla fem,
öppettider finns bara hos Art Of Hair (format "Tis" / "9–18", "Stängt", "Efter överenskommelse"), versaler hos
Skinclinic (BOTOX, FILLERS), avklippt fördel hos Faceboost, ingen bokningslänk hos Faceboost.

## Mina beslut (markerade som mina, kan ändras)
- **Delvis ifyllt innehåll:** varje fält faller tillbaka var för sig. Saknas tagline används branschens lead; saknas om
  används branschens neutrala intro (påstår inget om dem); är tjänstelistan tom visas branschens exempelpriser med raden
  "Exempelpriser"; saknas fördelar döljs trygghetssektionen.
- **Versaler skrivs bara om i innehall-fälten** (tjänster, fördelar, tagline, om). Namnet rörs aldrig.
- **JSON-LD utan `url`** (vi har inte deras riktiga adress och skissens adress är inte deras). name, address,
  telephone och öppettider tas med, eftersom de kommer från dem.
- **CLAUDE.md:** nya webhook-formatet med `innehall` och dess fält, tvättreglerna i korthet och att typ kan
  överstyras till frisör när texten tydligt handlar om hår.

## Verifiering
- Lokalt (Playwright, riktiga typsnitt, falska foton, mockad webhook med de 7 testlänkarnas riktiga JSON): 390 och 1366 px
  på alla 7 testlänkar + `?n=Test&s=Umeå&t=<typ>` för alla 10 typer + fientlig data (HTML i fält, `javascript:`-länk,
  för långa listor). Krav: `scrollWidth <= innerWidth`, inga konsolfel, alla `<img>` laddade, kontrast AA.
- Live efter push: Firecrawl-skärmdumpar mobil + dator av de 7 testlänkarna, granskade mot kritiken. Kartan kontrolleras
  separat (embed-URL:en hämtas och en skärmdump där kartan är i bild).
- `/skiss/plaza-norrkoping` ska visa "Plaza", Norrköping, lash.
