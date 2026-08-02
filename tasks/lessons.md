
## 2026-08-02 - gate de tests cassable
- `npx vitest run | grep "Tests"` laisse passer un echec (grep sort 0 des qu'une ligne matche). Gate correct : `npx vitest run` nu, code de sortie seul.
- `npm run build` (tsc -b) compile AUSSI les tests : relancer le build apres tout ajout de fichier .test.tsx, pas seulement apres le code produit.
- Testing Library sans fichier de setup : pas d'auto-cleanup entre tests (matchs multiples) et pas de matchers jest-dom (`toBeInTheDocument` invalide). cleanup() manuel + matchers chai natifs.
