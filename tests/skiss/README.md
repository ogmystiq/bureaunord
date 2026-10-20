# Test för skiss-sidan

    node tests/skiss/check.mjs

Kräver Playwright (`/opt/node-tools/node_modules/playwright`). Skriptet startar en egen lokal server som beter sig
som GitHub Pages, mockar n8n-webhooken med `fixtures.json` (riktiga svar för testlänkarna, hämtade 2026-10-20, plus
konstruerade fall `test-partial`, `test-bare`, `test-hostile`) och kontrollerar 390 och 1366 px. Slutar med
`N/N PASS` och exit 0 när allt går igenom.
