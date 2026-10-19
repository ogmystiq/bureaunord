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
- Startsidan ska vara **mörk premium** (Jontes val). Demosidorna och skissen har egna stilar per bransch.

## Skiss-länkarna (viktigt – går ut i säljmejl)
- Varje salong får en länk som `https://northlinestudio.se/skiss/aajt-tattoo-linkoping`.
- Adressen finns inte som fil → GitHub Pages visar `404.html`, som känner igen `/skiss/<slug>` och hämtar `https://mystiq.app.n8n.cloud/webhook/skiss?slug=<slug>` → `{hittad, namn, stad, typ}`. Sedan renderas skissen med `skiss/`-sidans kod.
- `typ` är en av: `frisor, barberare, nagel, lash, skonhet, hudvard, massage, tatuering, fotvard, bryn`.
- Reservvariant: `/skiss/?n=<namn>&s=<stad>&t=<typ>`.
- Ändrar du skissen: behåll båda varianterna, slug-formatet och webhook-anropet, och testa `/skiss/plaza-norrkoping` (ska visa "Plaza", Norrköping, lash).

## Automationen (n8n, mystiq.app.n8n.cloud)
Allt ligger i n8n och styrs därifrån – inte från repot.
- Datatabeller: **bn_leads** (alla salonger, status, mejltext, slug m.m.) och **bn_stader** (städer i sökordning).
- Flöden (alla med namnet "Northline – …"):
  1. Hitta salonger – mån+tor 06:07, nästa stad ur bn_stader, 10 branscher via Brave.
  2. Bedöm hemsidor – vardagar 06:37, Firecrawl-skärmdump i mobilläge + Claude Haiku betyg 1–10 (≤6 = mejla).
  3. Mejl och bolagsform – vardagar 07:13, Brave + Claude Haiku. Bara AB/HB mejlas (enskild firma kräver samtycke enligt marknadsföringslagen).
  4. Skriv mejl – vardagar 07:58, Claude Sonnet, kort mejl (max 60 ord) med personlig skiss-länk.
  5. Skicka mejl – vardagar 08:47, max 10/dag, ren text, 3–7 min mellan mejl, från "Northline Studio <kontakt@northlinestudio.se>".
  6. Uppföljning – vardagar 10:17, en uppföljning efter 6 dagar, max 5/dag.
  7. Skiss-data – webhook som skiss-sidan anropar.
- En mejladress får aldrig mer än ett första mejl och en uppföljning.
- API-nycklar ligger som credentials i n8n (Anthropic, Brave, Firecrawl, SMTP via Zoho). Skriv aldrig in nycklar i repot.

## Mejlstil (säljmejl)
- Ren text, kort, mänsklig ton, "Hej!" som hälsning.
- Hitta aldrig på saker om mottagaren (t.ex. att man följer dem eller varit där).
- Inga priser, inga "gratis"/"erbjudande", aldrig "svara bara på det här mejlet", ingen "nej tack"-rad.
- Signatur: Med vänliga hälsningar / Jonathan Heimdahl / Northline Studio / kontakt@northlinestudio.se
