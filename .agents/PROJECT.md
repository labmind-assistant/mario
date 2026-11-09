# PROJECT

## Toolset
lang: TypeScript 5.9, Node.js 22+
build: npm run build
test: npm test
lint: strict tsc and git diff --check; no separate lint configuration
run: python3 -m http.server 8000 --directory docs

## Standards
style: match surrounding code
commits: Conventional Commits

## Tickets
tracker: GitHub Issues
location: labmind-assistant/mario
branch: existing labmind job branch or continuing PR branch

## Security
secrets: gitleaks, pre-commit hook at .githooks/pre-commit

## CI
ci: none — gates run locally pre-commit.

## Deploy
GitHub Pages serves the configured branch's committed /docs directory.

## Unattended
merge: judge
max_risk: 1
max_lines: 400
human_test: src/game.ts, static/index.html
allow: none
