# Gangetabeller – 100-opgaven

En selvstændig PWA uden eksterne afhængigheder, hvor du kan øve alle gangestykker fra 1 × 1 til 10 × 10. Hver runde blander alle 100 opgaver, starter tidtagningen, når du går i gang, og gemmer dine ti hurtigste tider i browseren.

Spillet er udgivet på <https://petervestergaard.github.io/games/>. GitHub Actions udgiver automatisk ændringer, der pushes til `main`.

## Kør lokalt

Service workers kræver HTTPS eller en lokal server. Kør denne kommando fra mappen:

```powershell
py -m http.server 8000
```

Åbn `http://localhost:8000` i en browser. På iPhone skal du udgive mappen på en HTTPS-server, åbne adressen i Safari og vælge **Del → Føj til hjemmeskærm**. Når spillet er indlæst første gang, fungerer det og listen over bedste tider også offline.
