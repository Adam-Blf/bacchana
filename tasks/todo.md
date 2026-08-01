# BlackOut - refonte produit multi-repo, checkpoint de session

Plan complet : `~/.claude/plans/keen-prancing-quail.md`

## Decisions validees
- DA Neo-Tokyo Borderland (noir #09090B, neon rouge #FF3B41, carte blanche geante signature, Anton + Inter + IBM Plex Mono self-hosted)
- Modes : Borderland, Picolo, Action ou Verite, Je n'ai jamais, Qui de nous, C'est un 10 mais, Le Tribunal, Roulette
- Freemium : tous les modes gratuits, packs intenses premium (abonnement)
- Paiement : Stripe web, Play Billing Android, StoreKit iOS, entitlements Supabase
- blackout-content = repo PRIVE (packs premium via Supabase, gratuits vendorises)

## Etat
- [x] M1 Phase 0 fondations : PR #4 mergee, v0.2.0, tests 12/12, CI, Vercel deploye + curl 200 blackout.beloucif.com, fix flash carte trefle
- [ ] M2 blackout-content : repo local cree (schema, validate.mjs, CI, README, tokens.json), agent contenu en cours (packs migration + premium). Next : npm run validate, commit, gh repo create Adam-Blf/blackout-content --private, push
- [ ] M3 rebranding : branche feat/rebrand-neo-tokyo, fonts vendorisees public/fonts, nouveau logo fait (icon.svg + favicon.svg + PNGs regeneres), docs/DESIGN.md ecrit, agent react-specialist en cours sur tokens.css + tailwind + redesign composants. Next : verifier lint/test/build, screenshots preuve, PR, deploy, bump 0.3.0
- [ ] M4-M5 moteur multi-modes (src/core/engine registry + 8 modes)
- [ ] M6 Supabase + Stripe + RGPD (v1.0.0)
- [ ] M7 blackout-android (Kotlin Compose, Play Billing)
- [ ] M8 blackout-ios (SwiftUI, StoreKit 2, XcodeGen, CI mac)

## Demandes Adam en cours de route
- Refaire le logo (fait, envoye pour validation)
- Rigueur alignements/spacing (spec agent M3 + toutes futures UI)
- Polices optimisees (woff2 subset latin self-hosted - fait)
- Accents/zero faute sur tout contenu FR (corrige, a verifier sur chaque livrable)
- Skill mobile mcpmarket a consulter pour M7/M8 (page 429, reessayer)
