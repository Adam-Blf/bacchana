
## 2026-08-02 - gate de tests cassable
- `npx vitest run | grep "Tests"` laisse passer un echec (grep sort 0 des qu'une ligne matche). Gate correct : `npx vitest run` nu, code de sortie seul.
- `npm run build` (tsc -b) compile AUSSI les tests : relancer le build apres tout ajout de fichier .test.tsx, pas seulement apres le code produit.
- Testing Library sans fichier de setup : pas d'auto-cleanup entre tests (matchs multiples) et pas de matchers jest-dom (`toBeInTheDocument` invalide). cleanup() manuel + matchers chai natifs.

## 2026-08-02 - accents dans les saisies automatisees
- Ne JAMAIS retirer les accents d'un texte francais avant de le taper dans un champ via l'automatisation browser (le type UTF-8 passe parfaitement). Un formulaire Google publie sans accents = livrable fautif, correction couteuse. Toujours saisir le texte final avec sa typographie complete, puis relire le rendu.
