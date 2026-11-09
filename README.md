# Tiny Trail

A very small Mario-style platformer using HTML5 canvas and plain TypeScript.
One scrolling level, floating platforms, coins, gaps, and a finish flag.
All graphics are canvas shapes; no engine, runtime libraries, images, or audio.

Play on GitHub Pages: https://labmind-assistant.github.io/mario/

## Install and build

Requires Node.js 22+ and npm.

```sh
npm install
npm run build
```

TypeScript is the only dev dependency. `tsc` compiles `src/game.ts` into the
classic script `docs/game.js`; the build copies `static/index.html` to `docs/`.
The committed `docs/` directory is the complete published game.

## Run locally

```sh
npx serve docs
```

Open the local URL printed by the server. Alternatively, use
`python3 -m http.server 8000 --directory docs` and open http://localhost:8000.

Move with left/right arrows or A/D. Jump with Space, Up, or W.
Collect coins and reach the red flag to win. Falling into a gap loses.
Press R any time to restart. A keyboard is required.

## Verify

```sh
npm test
```

Tests build the project and exercise movement, jumping, gravity, ground and
platform landings, coins, win/loss, restart, camera following, and static output.
Also manually play through the level in a browser to check rendering and input.

## Publish

GitHub Pages uses the `main` branch and `/docs` source directory. Rebuild and
commit `docs/` whenever source changes. Merging the PR publishes that output;
no bundler or CI workflow is needed.
