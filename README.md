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

TypeScript is the only dev dependency. `tsc` compiles the source modules into the
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
One purple enemy patrols the platform at x=920. Land on its head for 100 points;
side or bottom contact loses. R also restores the enemy.
Press R any time to restart. A keyboard is required.

## Verify

```sh
npm test
```

Tests build the project and exercise movement, jumping, gravity, ground and
platform landings, coins, win/loss, restart, camera following, and static output.
The compiled reachability test imports the shared level and physics data and
checks all eight surfaces plus the flag using a single-jump graph and BFS.
Fixed-step gameplay tests also verify each raised platform can be landed on,
enemy patrol, stomp scoring, fatal contact, and enemy reset.
Also manually play through the level in a browser to check rendering and input.

## Publish

GitHub Pages currently uses PR #2’s branch and `/docs` source directory. Rebuild and
commit `docs/` whenever source changes. Pushing that branch publishes the output;
no bundler or CI workflow is needed.
