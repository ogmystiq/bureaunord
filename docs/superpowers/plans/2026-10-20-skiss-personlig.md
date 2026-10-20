# Personlig skiss – implementationsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skiss-sidan byggs av salongens eget innehåll från webhooken (tagline, om, tjänster, fördelar, tider, bokning) med SEO, trygghet, vanliga frågor och "Vad vi har tänkt på".
**Architecture:** `404.html` hämtar och tvättar webhook-svaret till `window.SKISS_DATA`; `skiss/script.js` tvättar igen, väljer familj och bygger varje sektion med `textContent`; `skiss/index.html` har sektionerna som statisk markup (döljs med `hidden` när data saknas); `skiss/style.css` stylar per familj.
**Tech Stack:** Ren HTML/CSS/JS (inget byggsteg), Playwright (`/opt/node-tools/node_modules/playwright`) för tester mot en lokal server som beter sig som GitHub Pages.
**Spec:** `docs/superpowers/specs/2026-10-20-skiss-personlig-design.md`

## Global Constraints
- Allt från webhook/URL sätts med `textContent`, aldrig `innerHTML`; länkar bara `https://` (bokning) eller `tel:` med siffror.
- Inga påhittade priser, tider, recensioner, personer eller fakta.
- `noindex, nofollow` kvar; slug + webhook + `?n=&s=&t=&a=&p=` kvar; `/skiss/plaza-norrkoping` → "Plaza", Norrköping, lash.
- 390 och 1366 px: `scrollWidth <= innerWidth`, inga konsolfel, kontrast AA.
- Bara ändrade filer i git (aldrig `git add -A` / `git add .`), små commits, push till `main`.

## Review Focus
1. Fält med HTML/`javascript:` i webhook-svaret → visas som text, ingen länk med fel protokoll. (Task 1 test `hostile`)
2. `innehall` delvis tomt (tom tjanster, saknad tagline/om) → branschens fallback, aldrig tom sektion med rubrik. (Task 1 test `partial`)
3. Inga öppettider + ingen bokningslänk + ingen telefon → ingen tidstabell, "Boka tid" går till Hitta hit. (Task 1 test `bare`)
4. Väldigt lång tjänstelista (20 st) → max 10 visas. (Task 1 test `hostile`)
5. Namn i VERSALER ("AAJT TATTOO") → oförändrat namn. (Task 1 test `aajt`)

---

### Task 1: Testsvit och fixturer

**Files:**
- Create: `tests/skiss/fixtures.json` – webhook-svaren för de 7 testlänkarna (riktiga, hämtade 2026-10-20) + `partial`, `bare`, `hostile`.
- Create: `tests/skiss/check.mjs` – Playwright: startar ingen server själv, kräver `http://localhost:8766` (GitHub Pages-lik server), mockar n8n med fixturerna, Unsplash med 1×1-bild, blockerar Tally/kartor.
- Create: `tests/skiss/README.md` – hur man kör.

**Interfaces:** Produces: `node tests/skiss/check.mjs` → skriver `PASS`/`FAIL <slug> <width>: <orsak>` per rad och avslutar med exit 0 bara om allt passerar.

Kontroller per slug och bredd (390, 1366):
- `scrollWidth <= innerWidth`, inga `pageerror`/konsolfel.
- `h1` = namnet oförändrat; `document.title` = "{namn} – {Bransch} i {stad}".
- Med innehåll: `#hero-tagline` = tagline; antal `.service` = min(10, tjanster); inget `.service__price` med text som inte finns i data; `#trust` synlig om fordelar; `.hours` rader = antal oppettider, annars ingen `.hours`; alla `[data-book]` har href = bokningslank (target `_blank`) eller `tel:` eller `#hitta`; `#faq details` bara med svar; `script[type="application/ld+json"]` går att `JSON.parse` och har `name` = namnet.
- Utan innehåll: inga `.hours`-rader, `#price-note` synlig, `#steps` synlig.
- `hostile`: inget element skapat ur data (`document.querySelector('main img[src="x"]')` = null), ingen `a[href^="javascript:"]`.
- `aajt`: h1 = "Aajt Tattoo"/exakt namnet från fixturen.
- Notes: `.note` dolda; efter klick på `#notes-toggle` synliga och `aria-pressed="true"`.
- Plus `?n=Test&s=Umeå&t=<typ>` för alla 10 typer: inga fel, ingen sidledsscroll.

- [ ] **Step 1:** Skriv fixturer och `check.mjs`.
- [ ] **Step 2:** Kör `node tests/skiss/check.mjs > $W/t1.log; tail -5 $W/t1.log`. Expected: FAIL (tagline, title, trust m.fl. saknas i nuvarande sida).
- [ ] **Step 3:** Commit "Test: skiss-svit med riktiga webhook-svar".

### Task 2: 404.html skickar vidare tvättat innehåll

**Files:** Modify: `404.html` (lookup-blocket, rad ~68–82).
**Interfaces:** Produces `window.SKISS_DATA = {namn, stad, typ, adress, telefon, innehall}` där `innehall` är `null` eller `{tagline, om, tjanster:[{namn,pris,info}], fordelar:[str], oppettider:[{dag,tid}], bokningslank}` med längder enligt spec.

- [ ] **Step 1:** Implementera `cut(v, n)` (sträng, trim, klipp på tecken med `Array.from`) och `cleanInnehall(x)` enligt spec-tabellen (max 10/4/7, bokningslank bara `https://` + `new URL` ok + ≤300).
- [ ] **Step 2:** Kör sviten. Expected: `hostile` ger ingen `javascript:`-länk; övriga fel kvar (sidan visar inte innehållet än).
- [ ] **Step 3:** Commit "404: skicka vidare innehåll från webhooken, tvättat".

### Task 3: Datalager i skiss/script.js

**Files:** Modify: `skiss/script.js` (läsning/tvätt överst, familjeval).
**Interfaces:** Consumes `SKISS_DATA` från Task 2. Produces i scriptet: `C` = tvättat innehåll eller `null`; `normCaps(str)`; `trimCut(str)`; `book = {href, external}`; familjeval med frisör-överstyrning (typ nagel/lash/bryn + /frisör|hårvård|klippning|frisyr/i i tagline/om → frisor).

- [ ] **Step 1:** Implementera enligt spec (versaler bara i innehall-fält; namn orört).
- [ ] **Step 2:** Kör sviten. Expected: inga nya fel.
- [ ] **Step 3:** Commit (tillsammans med Task 4 om markup krävs för att se effekt).

### Task 4: Sektioner och rendering

**Files:** Modify: `skiss/index.html`, `skiss/script.js`.
**Interfaces:** Element-id som testerna läser: `#hero-tagline`, `#quick` (snabbinfo), `#om` (+ `#about-text`, `#about-img`), `#priser` (+ `#services`, `#price-note`, `#price-cta`), `#trust` (+ `#trust-list`), `#bilder`, `#besok` (+ `#steps`), `#tider` (+ `#hours`, `#hours-cta`), `#faq`, `#hitta`; alla boka-knappar `[data-book]`.

- [ ] **Step 1:** Markup: lägg till/ändra sektionerna i spec-ordning; ta bort de hårdkodade 10–18-tiderna.
- [ ] **Step 2:** Rendering i script.js: hero, snabbinfo, om, behandlingar (pris bara om det finns, info som rad), trygghet, tider eller "Se lediga tider", FAQ (bara med svar), hitta hit, boka-länkar, besök bara utan innehåll, "Exempelpriser" utan innehåll.
- [ ] **Step 3:** Kör sviten. Expected: allt utom SEO och notes PASS.
- [ ] **Step 4:** Commit "Skiss: salongens eget innehåll i alla sektioner".

### Task 5: SEO

**Files:** Modify: `skiss/script.js`, `skiss/index.html` (tom `<script type="application/ld+json" id="ld">`).
- [ ] **Step 1:** Title, meta description (≤155), JSON-LD (`@type` per bransch, name, address, telephone, openingHoursSpecification för tolkbara tider; ingen url) via `JSON.stringify` + `textContent`.
- [ ] **Step 2:** Kör sviten. Expected: title- och JSON-LD-kontroller PASS.
- [ ] **Step 3:** Commit "Skiss: titel, beskrivning och schema.org".

### Task 6: "Vad vi har tänkt på" och bannerrad

**Files:** Modify: `skiss/index.html`, `skiss/script.js`, `skiss/style.css`.
- [ ] **Step 1:** Knapp `#notes-toggle` (aria-pressed) i bannern, rad `#from-site` ("Texterna kommer från er nuvarande sida.") bara med innehåll; `.note`-element per sektion med texter från spec; dolda tills `body.show-notes`.
- [ ] **Step 2:** Kör sviten. Expected: alla PASS.
- [ ] **Step 3:** Commit "Skiss: Vad vi har tänkt på".

### Task 7: Design och granskning lokalt

**Files:** Modify: `skiss/style.css`.
- [ ] **Step 1:** Stil för snabbinfo, om oss (foto + text), behandlingar (två kolumner på dator vid >5), trygghet (stora påståenden med accentlinje), tider/FAQ, anteckningar; per familj.
- [ ] **Step 2:** Skärmdumpar 390/1366 av de 7 fixturerna; granska mot frontend-design/no-ui-slop; justera.
- [ ] **Step 3:** Kör sviten + kontrastkontroll. Expected: PASS, inga AA-fel.
- [ ] **Step 4:** Commit "Skiss: design för de nya sektionerna"; bumpa `?v=` på css/js.

### Task 8: CLAUDE.md, push och live-granskning

**Files:** Modify: `CLAUDE.md`.
- [ ] **Step 1:** Beskriv nya webhook-formatet och tvättreglerna.
- [ ] **Step 2:** Push, vänta på GitHub Pages-deploy, Firecrawl-skärmdumpar mobil + dator av de 7 testlänkarna; kontrollera kartan separat.
- [ ] **Step 3:** Granska mot kritiken (nyfikenhet, information, story, trygghet, SEO); åtgärda, pusha igen vid behov.
