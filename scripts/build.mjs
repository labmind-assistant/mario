import { copyFileSync, mkdirSync } from 'node:fs';
mkdirSync('docs', { recursive: true });
copyFileSync('static/index.html', 'docs/index.html');
