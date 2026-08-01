# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

## [0.2.0] - 2026-08-01

### Added
- Vitest test suite covering the pure Borderland game logic (deck integrity, penalty units, contest multipliers, player rotation).
- ESLint 9 flat config (typescript-eslint, react-hooks, react-refresh) - `npm run lint` now works.
- Global `ErrorBoundary` with a recovery screen.
- `vercel.json` (SPA rewrite, immutable asset caching) - deployment moves from Apache to Vercel.
- GitHub Actions CI: lint, tests, build, typography guard, gitleaks secret scanning.
- Defensive `.gitignore` patterns (build artifacts, secrets, `.vercel`).

### Changed
- Pure game logic extracted from the store to `src/core/borderland.ts` (testable without DOM).
- `App.tsx`: store subscription via hook instead of `getState()` in render, screen redirect moved to an effect.
- PWA manifest: name and `theme_color` aligned with the design, removed references to missing assets.

### Fixed
- Clubs cards no longer flash their face before the flip: reveal state is now reset during render (not in an effect after paint) and the card mounts directly back-side up (`initial={false}`). "Le Guess" stays guessable.
- Share recap text: forbidden middle dots replaced, wrong domain corrected to blackout.beloucif.com.

### Removed
- i18next stack (unused: no component consumed translations) - FR only, content schema keeps a `lang` field for later.
- Committed build artifacts (`vite.config.js`, `*.tsbuildinfo`).
- `public/.htaccess` (replaced by Vercel config).

## [0.0.1] - 2026-04-14

Initial version - Le Borderland card game, casino theme, PWA.
