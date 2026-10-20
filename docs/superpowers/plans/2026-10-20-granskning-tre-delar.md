# Granskning tre delar – implementationsplan

> Följ med superpowers:executing-plans. Steg med `- [ ]`.

**Mål:** Startsidan säljer tydligare, skissen avslutar med trygghet och synligt SEO-tänk, demosidorna följer regeln om inget påhittat.
**Arkitektur:** Ren HTML/CSS/JS som i dag, inga nya beroenden.
**Spec:** `docs/superpowers/specs/2026-10-20-granskning-tre-delar.md`

## Globala krav
- `textContent` för all data, AA-kontrast, ingen sidledsscroll vid 390/768/1366, `prefers-reduced-motion` respekteras.
- Bara ändrade filer i commits, aldrig `git add -A`.

## Uppgift 1 – Demosidorna (`demo/*/*.html`, `demo/*/style.css`)
- [ ] Byt personlistorna mot "Det här är vi bra på" utan namn.
- [ ] Ta bort telefonnummer och `tel:`-länkar, gatuadresser → "Centrala Linköping", mejl → `@…example`.
- [ ] Kontroll: `grep` efter `tel:`, `gatan [0-9]`, namnen ger inga träffar. Skärmdumpar 390/1366.

## Uppgift 2 – Startsidan (`index.html`, `styles.css`, `script.js`, `sitemap.xml`)
- [ ] Head: title, description, JSON-LD (ProfessionalService, Offer ×2, FAQPage).
- [ ] Hero: ny h1, lead, fakta-rad (från 2 995 kr, klar inom en vecka, ingen bindningstid).
- [ ] Ny sektion "Vem står bakom", ny sektion "Vanliga frågor" (`<details>`), nav uppdaterad.
- [ ] Priser: ta bort "Populärast". Kontakt: ljus yta, formuläret utan låda.
- [ ] Rörelse: en entré per sektion (transform/opacity, en gång, utan JS syns allt).
- [ ] Kontroll: `inspect.mjs`, egen Playwright-koll, tangentbord.

## Uppgift 3 – Skissen (`skiss/index.html`, `skiss/style.css`, `skiss/script.js`, `tests/skiss/check.mjs`)
- [ ] Tider-sektionen: rubrik "Boka tid" + text när tider saknas.
- [ ] Avslut "Från skiss till färdig sida": Google-förhandsvisning (title + description från sidan, textContent),
      tre fakta, Jonathan, knappar till northlinestudio.se/#kontakt och /#priser.
- [ ] Tester: nya kontroller i check.mjs (förhandsvisning = document.title), kör hela sviten, kolla `/skiss/plaza-norrkoping`.

## Uppgift 4 – Granskning och live
- [ ] impeccable, break-ui (långa namn, tomt innehåll, emoji), review-animations.
- [ ] Push till main, vänta på Pages, Firecrawl mobil + dator på alla sidor, nya skärmdumpar till `assets/`.
