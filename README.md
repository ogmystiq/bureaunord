# Bureau Nord

Hemsidan för Bureau Nord, publicerad via GitHub Pages på [bureaunord.se](https://bureaunord.se).

## Filerna i korthet

| Fil | Vad den gör |
| --- | --- |
| `index.html` | Själva sidan: all text och alla sektioner. Vill du ändra en rubrik eller en mening är det här du gör det. |
| `styles.css` | Utseendet: färger, typsnitt, avstånd och hur sidan anpassar sig till mobil och dator. Färgerna ligger överst i filen. |
| `script.js` | Mjuk intoning när man scrollar, årtalet i sidfoten och laddning av kontaktformuläret från Tally. Om filen inte laddas visas sidan ändå, men formuläret måste då öppnas via länken under det. |
| `CNAME` | Talar om för GitHub Pages att sidan ska visas på bureaunord.se. |
| `favicon.svg` | Den lilla ikonen i webbläsarfliken. |
| `apple-touch-icon.png` | Ikonen om någon sparar sidan på hemskärmen i en iPhone. |
| `og-image.png` | Bilden som visas när länken delas i till exempel Messenger, LinkedIn eller iMessage. |
| `robots.txt`, `sitemap.xml` | Hjälper Google att hitta och läsa sidan. |

Kontaktformuläret ligger hos [Tally](https://tally.so) och bäddas in på sidan. Vill du byta formulär: sök efter `QKgN4X` i `index.html` och byt ut koden mot det nya formulärets kod.

Priserna står i `index.html` under rubriken `PRISER`. Ändra siffrorna och punktlistorna där.

## Lägga in demosidorna

I `index.html`, under rubriken `DEMOSIDOR`, finns tre kort. För varje kort:

1. Lägg till `href="https://adressen-till-demosidan"` på kortets `<a>`.
2. Ta bort `data-coming-soon`.
3. Ändra texten `Kommer snart` till `Öppna demo`.
