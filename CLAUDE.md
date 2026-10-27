# Northline Studio – projektkontext

Läs den här filen först i varje ny chatt/session. Den beskriver hela verksamheten, så att du inte behöver fråga Jonte om sånt som redan är bestämt.

## Om Jonte och hur han vill jobba
- Jonathan "Jonte" Heimdahl driver Northline Studio själv, vid sidan av skiftjobb. Skriv till honom på **svenska**, kort och rakt, ett steg i taget.
- Förklara vad han ska klicka/skriva – inte hur koden fungerar.
- Säg rakt ut om något inte går. Tar han upp något som verkar fel: kolla upp det, försvara inte.
- Prompter han ska klistra in i Claude Code skrivs med vanliga åäö.

## Verksamheten
- **Northline Studio** – webbyrå som bygger premiumhemsidor åt små företag inom skönhet och välmående (frisörer, barberare, nagel, lash/bryn, hudvård, massage, fotvård, tatuering).
- Domän: **northlinestudio.se** (GitHub Pages från detta repo, `main`, CNAME = northlinestudio.se). Gamla namnet var Bureau Nord – repot heter fortfarande `bureaunord`, ändra inte det.
- Kontakt: **kontakt@northlinestudio.se** (alias i Zoho Mail; inloggning sker med jonte@bureaunord.se, så domänen bureaunord.se måste ligga kvar).
- Priser: **Bas 2 995 kr** (one-page), **Premium 4 995 kr** (upp till 5 sidor, galleri, formulär, karta, SEO, animationer). Båda + **199 kr/mån** (hosting, domän, support), ingen bindningstid, klar inom en vecka.
- Kontaktformulär: Tally (`QKgN4X`), inbäddat på startsidan.

## Repot
- Ren HTML/CSS/JS, inget byggsteg, inga ramverk. Mobilen först.
- `index.html`, `styles.css`, `script.js` – startsidan.
- `integritetspolicy.html`, `404.html`, `sitemap.xml`, `robots.txt`.
- `demo/frisor/` (Bas-exempel), `demo/nagel/` och `demo/barber/` (Premium-exempel) – påhittade salonger, `noindex`.
- `skiss/` – personlig skiss-sida som skickas i säljmejlen (se nedan), `noindex, nofollow`, får inte ligga i sitemap.
- `mejl-logo.png` (814×176), `avatar.png` (800×800), `favicon.svg`, `og-image.png`.

### Regler i repot
- **Aldrig `git add -A` eller `git add .`** – lägg bara till filer du faktiskt ändrat.
- Hämta senaste main (`git pull`) innan du börjar – flera sessioner jobbar i repot.
- Data från länkar/URL sätts alltid in med `textContent`, aldrig `innerHTML`.
- Inga påhittade recensioner, betyg, citat, personer, adresser eller telefonnummer på demo-/skisssidor.
- Text ska ha god kontrast (minst WCAG AA 4.5:1 för brödtext) – särskilt på ljusa teman.

## Design
- Designskillen ligger i `.claude/skills/frontend-design/`. Läs den och följ den innan du ändrar utseendet på någon sida.

## Designskills
- `.claude/skills/frontend-design/` (Anthropic) och `.claude/skills/no-ui-slop/` (UXKIN) laddas automatiskt i Claude Code i det här repot. Använd dem vid allt design- och layoutarbete.
- Fler designskills i `.claude/skills/`: `impeccable` (pbakaus, granskning och polering), `taste-skill` (leonxlnx, smak/anti-generiskt), `ui-ux-pro-max` (nextlevelbuilder, stilar, färger, typsnitt – har ett sökskript), samt Emil Kowalskis `emil-design-eng`, `animate`, `improve-animations`, `review-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `apple-design` och `break-ui`. Läs de som passar uppgiften innan du designar, och använd granskningsskillsen (impeccable, review-animations, break-ui) innan du säger att något är klart.
- Skillsen är bara instruktioner. Kör inga av deras skript som installerar något eller skickar data utanför repot utan att fråga Jonte.
- Startsidan ska vara **mörk premium** (Jontes val). Demosidorna och skissen har egna stilar per bransch.

## Skiss-länkarna (viktigt – går ut i säljmejl)
- Varje salong får en länk som `https://northlinestudio.se/skiss/aajt-tattoo-linkoping`.
- Adressen finns inte som fil → GitHub Pages visar `404.html`, som känner igen `/skiss/<slug>` och hämtar `/skiss/data/<slug>.json` (publiceras av northline-motor; den gamla n8n-webhooken är bara reserv) → `{hittad, namn, stad, typ, adress, telefon, innehall}`. Sedan renderas skissen med `skiss/`-sidans kod.
- `innehall` är `null` eller `{tagline, om, tjanster:[{namn, pris, info}], fordelar:[…], oppettider:[{dag, tid}], bokningslank}` – hämtat från salongens egen sida. 404.html tvättar: bara strängar, klippta längder, max 10 tjänster / 4 fördelar / 7 tider, bokningslänk bara om den är https.
- Med innehåll visar skissen deras texter, tjänster (pris bara om det finns), fördelar, tider och bokning. Utan innehåll: branschtext, priser märkta som exempel och **inga** påhittade öppettider. Adress/telefon som saknas döljs.
- Om `typ` är nagel/lash/bryn men texten handlar om hår visas frisörstilen (rätta helst typ i n8n).
- Testa med `node tests/skiss/check.mjs` (riktiga webhook-svar i `tests/skiss/fixtures.json`).
- `typ` är en av: `frisor, barberare, nagel, lash, skonhet, hudvard, massage, tatuering, fotvard, bryn`.
- Reservvariant: `/skiss/?n=<namn>&s=<stad>&t=<typ>` (valfritt `&a=<adress>&p=<telefon>`).
- Ändrar du skissen: behåll båda varianterna, slug-formatet och webhook-anropet, och testa `/skiss/plaza-norrkoping` (ska visa "Plaza", Norrköping, lash).

## Automationen (northline-motor, GitHub Actions)
Säljautomationen ligger i det **privata** repot `ogmystiq/northline-motor` (flyttad från n8n i okt 2026 – n8n ska stängas av). Den körs gratis i GitHub Actions: `daglig.yml` förbereder (steg 1–4b och 7) vardagar 03:13 UTC, och `skicka.yml` skickar (steg 5–6) vid flera tillfällen under dagen. Mejl går bara ut vardagar 08–17 svensk tid, eftersom GitHub kan starta schemalagda körningar flera timmar sent.
- Data: `data/leads.json` (alla salonger, status, mejltext, slug, variant m.m.) och `data/stader.json` (städer i sökordning). `LANKAR.md` listar alla skickade mejl med skisslänk.
- Steg i ordning (`src/`):
  1. Hitta salonger – två nya städer per körning, 10 branscher via Braves platssökning.
  2. Bedöm hemsidor – Firecrawl-skärmdump i mobilläge + Claude Haiku betyg 1–10 (≤4 = mejla; olämpliga som fel bransch/stängda/kedjor skippas).
  3. Mejl och bolagsform – Brave + Claude Haiku. Bara AB/HB mejlas (enskild firma kräver samtycke enligt marknadsföringslagen).
  4. Skriv mejl – fast mall; Claude Sonnet skriver bara kortnamn och (för egen sida) en ödmjuk iakttagelse. A/B-test: variant B har länken direkt, variant C frågar först (länken kommer i uppföljningen).
  4b. Hämta innehåll till skissen – Firecrawl läser deras sida/bokningssida, Haiku plockar ut tagline, om-text, tjänster, fördelar, tider, bokningslänk och bransch.
  7. Publicera – skriver `skiss/data/<slug>.json` i det här repot (bara offentliga företagsuppgifter, aldrig mejl) och pushar.
  5. Skicka mejl – max 10/dag, 2–4 min mellan, bara störst behov (ingen egen sida eller betyg ≤4), bara om mejlens domän matchar hemsidans eller är gmail/hotmail o.l., aldrig plattformsadresser, och bara om skissfilen finns.
  6. Uppföljning – en efter minst 6 dagar, max 5/dag, alltid med länk.
- En mejladress får aldrig mer än ett första mejl och en uppföljning.
- Hemligheter ligger som GitHub Secrets i northline-motor (ANTHROPIC_API_KEY, BRAVE_API_KEY, FIRECRAWL_API_KEY, SMTP_USER, SMTP_PASS, SITE_TOKEN). Skriv aldrig in nycklar i något repo.
- Besöksstatistik: GoatCounter (`northlinestudio.goatcounter.com`, cookiefri) på startsidan och exempelsidorna.

## Mejlstil (säljmejl)
- Ren text, kort, mänsklig ton, "Hej!" som hälsning.
- Kalla det ett **exempel**, inte "en skiss på er nya sida": designen är en mall och bilderna är exempelbilder. Säg det i mejlet och på sidan.
- Hitta aldrig på saker om mottagaren (t.ex. att man följer dem eller varit där). Påstå aldrig att något saknas helt på deras sida.
- Inga priser, inga "gratis"/"erbjudande".
- Signatur: Med vänliga hälsningar / Jonathan Heimdahl / Northline Studio / kontakt@northlinestudio.se, följt av raden "Jag hittade er adress offentligt på nätet. Så hanterar jag uppgifter: northlinestudio.se/integritetspolicy" (GDPR art. 14 och MFL 20 §).
