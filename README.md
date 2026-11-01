# Times Tables — The 100 Challenge

A standalone, dependency-free PWA for practising every ordered multiplication from 1 × 1 through 10 × 10. Each round shuffles all 100 problems, starts the timer when you begin, and saves your ten fastest results in this browser.

The live site is published at <https://petervestergaard.github.io/games/>. GitHub Actions deploys updates pushed to `main`.

## Run locally

Service workers require HTTPS or a local server. From this folder, run:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000` in a browser. On iPhone, deploy the folder to an HTTPS host, open its URL in Safari, then choose **Share → Add to Home Screen**. After the first visit has finished loading, the game and its leaderboard work offline.
