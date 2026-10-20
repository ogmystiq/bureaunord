# Granskning: startsidan, skissen och demosidorna

Datum: 2026-10-20 · Ägare: Jonte (Northline Studio)

Underlag: Jontes uppdrag (tre delar), CLAUDE.md, före-mätningar med taste-skill `inspect.mjs`
(startsidan: 10 FAIL, 6 WARN), live-skärmdumpar via Firecrawl, `tests/skiss/check.mjs` (674/674 före).

## Vad granskningen hittade (före)

**Startsidan**
- Rubriken är 14 ord och 4 rader i mobilen. Priset syns bara i liten text under knappen.
- Ingen sektion om vem som står bakom (Jonathan nämns bara i sidfoten). Inga vanliga frågor.
- "Populärast" på Premium är ett påstående vi inte kan belägga (och en eyebrow-etikett).
- Formuläret ligger som en ljus låda på mörk sida; i live-skärmdumpen syns bara en tom grå ruta tills det laddats.
- Schema.org är `Organization`, inte `ProfessionalService`. Inga erbjudanden eller frågor i strukturerad data.
- Tally-formulärets samtyckesrad säger fortfarande "Bureau Nord" (ändras i Tally, inte i repot).

**Skissen**
- Utan öppettider visar sektionen "Öppettider" bara en knapp – ser ofärdigt ut.
- SEO-tänket syns bara om man trycker på "Vad vi har tänkt på".
- Inget avslut från oss: vem gör det här, vad händer om man säger ja.

**Demosidorna**
- Påhittade personer (Elin, Sara, Oskar, Maja, Linnea, Nora, Elias, Hugo, Adam), påhittade telefonnummer med
  riktiga riktnummer (`tel:`-länkar till 013-nummer som kan tillhöra någon) och gatuadresser. Bryter mot CLAUDE.md.

## Beslut
1. Startsidan: kortare h1 med sökorden ("Hemsidor för frisörer och salonger"), pris + leveranstid + ingen
   bindningstid direkt i hero, ny sektion "Vem står bakom", ny sektion "Vanliga frågor" (bara fakta vi har),
   kontaktsektionen blir en ljus yta så att Tallys ljusa formulär smälter in, "Populärast" tas bort,
   `ProfessionalService` + `Offer` + `FAQPage` i JSON-LD, ny title/description. Mörk premium, logga och priser behålls.
2. Skissen: tider-sektionen blir "Boka tid" när tider saknas; ett avslut i Northlines stil efter sidfoten med en
   Google-förhandsvisning byggd av sidans riktiga titel och beskrivning, vad som ingår och vem som bygger sidan,
   länk till priser (inga priser på skissen, samma linje som säljmejlen). Slug, webhook och reservvariant orörda.
3. Demosidorna: personer byts mot vad salongen är bra på (utan namn), telefonnummer tas bort, gatuadresser blir
   "Centrala Linköping", mejl får den reserverade domänen `.example`. Startsidans skärmdumpar av demosidorna tas om.

## Anti-mål
Något påhittat (kunder, betyg, citat, personer, nummer), `innerHTML` med data, sidledsscroll, kontrast under AA,
rörelse utan reduced-motion-stöd, ändrat slug-format/webhook.
