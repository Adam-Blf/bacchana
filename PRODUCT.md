# Product

<!-- impeccable:product-schema 1 -->

Written on 2026-09-15 from repository truth. Adam gave carte blanche ("utilise impeccable sur bacchana carte blanche") instead of an interview round, so every fact below comes from the code, the README, the legal screens and the store documents, not from answers to questions.

## Platform

web

A React 19 + Vite PWA, installable and offline, deployed on Vercel at bacchana.beloucif.com. Native Android and iOS apps live in separate repositories and port the web tokens.

## Users

A group of friends, two to eight people, at a party or a dinner, in the evening, usually in a dim room. One phone is passed from hand to hand around the table. The person holding it reads a prompt aloud, or turns a card, and the table reacts. Players are adults: an age gate opens the app.

## Product Purpose

Bacchana gathers the classic party games into one app, so the table never has to hunt for a card deck, a list of questions or a timer. Success is a table that keeps playing without anyone looking up rules: one tap, one prompt, one laugh, pass the phone.

## Positioning

Fourteen game modes behind one player list typed once: Borderland (a card game with its own rules and contest escalation), Quitte ou Double, Le Tableau d'Honneur, La Criée, Le Taulier, Action ou Vérité, Je n'ai jamais, Qui de nous, Tu préfères, Sept secondes, Le Tribunal, La Roulette, Faux Frère, Le Baromètre. Prompts name the players by their first names.

## Operating Context

- The phone travels: every screen must read at arm's length and at a glance, often by someone who did not see the previous screen.
- The room is dark and the table's night vision matters: a large bright flash when the phone changes hands is a real cost.
- The narrative world of the game is a tavern: le comptoir, le taulier, la tablée, la pénalité, l'addition. It is the setting, not the product name, and it must not be renamed.
- Sessions end on a recap ("l'addition", printed like a receipt).

## Capabilities and Constraints

- French UI.
- Monetisation: a one-time lifetime unlock at 12,99 EUR, no subscription, no trial. Five modes carry paid packs (truthOrDare, itsA10But, neverHaveIEver, picolo, whoAmong); the modes stay playable without them.
- The purchase screen carries the legal double consent (immediate execution plus waiver of the withdrawal right) as two separate boxes, never pre-checked.
- The app hands out abstract penalties; the group decides what they are. No content encourages alcohol consumption, and a lexicon guard enforces it.
- Three themes: light, dark (reference) and a colour-blind theme. Colour never carries meaning alone.
- Zero CDN, self-hosted fonts, strict CSP. Guards in `scripts/gardes` check contrast, tile ink, icons, touch targets (44 points), transitions, loops and the alcohol lexicon.
- Icons are authored SVGs in `public/icons`, referenced by name.

## Brand Commitments

- Name: Bacchana, published by BLF Lab's (Adam Beloucif).
- The logo purple `#5B2C87` is the brand's one fixed colour.
- Tone: familiar, playful, tavern vocabulary, tutoiement.
- Fonts reserved for Bacchana in the font registry: Big Shoulders Display, Chivo, Space Mono (receipt only), Bricolage Grotesque.

## Evidence on Hand

- Content: `src/content/` and the `bacchana-content` repository (prompts, packs, premium catalogue).
- Store and brand documents: `docs/BRAND.md`, `docs/STORE_LISTING.md`, `docs/MARKET.md`.
- No testimonials, ratings or user counts exist; none may be invented.

## Product Principles

1. The phone is passed, not held: one decision per screen, readable at arm's length.
2. The table's attention belongs to the table: the interface gets out of the way between prompts.
3. Nothing is hidden behind the paywall that makes the free game feel broken.
4. Every state says what it means with a word or an icon, not only a colour.

## Accessibility & Inclusion

WCAG AA contrast on every theme, AAA-leaning on prompts read aloud (7:1 target on card faces), 44-point touch targets, reduced motion honoured, a dedicated colour-blind theme.
