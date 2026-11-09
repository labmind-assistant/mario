import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
mkdirSync('docs', { recursive: true });
// These two local modules form a classic script, also usable by the VM tests.
const level = readFileSync('.build/level.js', 'utf8').replace(/^export /gm, '');
const game = readFileSync('.build/game.js', 'utf8').replace(/^import .*;\n/gm, '');
writeFileSync('docs/game.js', level + '\n' + game);
copyFileSync('static/index.html', 'docs/index.html');
