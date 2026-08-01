# BlackOut - Casino de Luxe

[![version](https://img.shields.io/badge/version-0.0.1-000091?style=flat-square)](https://github.com/Adam-Blf/black-out/releases)

<!-- adam-badges:start -->
[![commits](https://img.shields.io/github/commit-activity/t/Adam-Blf/black-out?color=001329&label=commits&style=flat-square)](https://github.com/Adam-Blf/black-out/commits) [![visites](https://hits.sh/github.com/Adam-Blf/black-out.svg?style=flat-square&label=visites&color=001329)](https://hits.sh/github.com/Adam-Blf/black-out/) [![last commit](https://img.shields.io/github/last-commit/Adam-Blf/black-out?color=D4A437&style=flat-square&label=dernier%20push)](https://github.com/Adam-Blf/black-out/commits) [![top language](https://img.shields.io/github/languages/top/Adam-Blf/black-out?style=flat-square)](https://github.com/Adam-Blf/black-out) [![license](https://img.shields.io/github/license/Adam-Blf/black-out?style=flat-square&color=D4A437)](LICENSE)
<!-- adam-badges:end -->


![Status](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/deploy-Vercel-000?logo=vercel&logoColor=white)

Collection de jeux à boire avec une UI **Casino de Luxe / High Roller** et des animations premium.

## Le Borderland

**52 cartes, 4 règles, 0 pitié.**

Tire une carte, découvre son pouvoir. Distribue des gorgées, ou bois-les. Conteste si tu oses. Survie si tu peux.

### Règles par Couleur

| Couleur | Règle | Description |
|---------|-------|-------------|
| **Trèfle** | Le Guess | Carte face cachée. Un joueur devine la valeur. S'il a juste, tu distribues. Sinon, il boit. |
| **Carreau** | L'Action | Donne une action au joueur de ton choix. |
| **Coeur** | La Question | Pose une question au joueur de ton choix. |
| **Pique** | La Contrainte | Donne une contrainte à accomplir au joueur de ton choix. |

### Système de Contest

Conteste la décision et double la mise ! Les niveaux d'escalade multiplient les pénalités :
- Niveau 1 : x1
- Niveau 2 : x2
- Niveau 3 : x4

**As = SHOT** | Autres cartes = gorgées (valeur de la carte)

## Mini-Jeux Textuels

En plus du jeu de cartes, 6 mini-jeux basés sur des prompts sont disponibles :

| Jeu | Description |
|-----|-------------|
| **Je n'ai jamais** | Bois si tu l'as déjà fait |
| **Action ou Vérité** | Choisis ton poison |
| **Tu préfères** | Fais ton choix impossible |
| **Le plus susceptible** | Désigne le coupable |
| **C'est un 10 mais** | Le deal-breaker ultime |
| **7 Secondes** | Réponds vite ou bois |

## Features

- [x] Écran de check-in des joueurs (WelcomeScreen) - Style VIP List
- [x] Hub de jeux avec carte style Machine à Sous Vintage
- [x] Jeu de cartes "Le Borderland" complet
- [x] Système de contest avec escalade
- [x] **6 Mini-Jeux Textuels** (Never Have I Ever, Truth or Dare, etc.)
- [x] Animations Framer Motion premium avec effets shuffle
- [x] Persistence des joueurs (localStorage)
- [x] **Thème Casino de Luxe** (vert feutre, or, rouge poker)
- [x] Boutons style Jetons de Poker 3D
- [x] Typographie Art Déco (Cinzel + Montserrat)
- [x] Responsive mobile-first
- [x] **PWA Installable** (iOS & Android)
- [x] **Internationalisation (i18n)** - FR, EN, ES, DE, IT, PT
- [x] Mode hors-ligne avec Service Worker

## Installation

```bash
# Cloner le repo
git clone https://github.com/Adam-Blf/black-out.git
cd black-out

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

## Tech Stack

| Technologie | Usage |
|-------------|-------|
| **React 19** | UI Components |
| **TypeScript 5.7** | Type Safety |
| **Vite 6** | Build Tool |
| **Tailwind CSS 3.4** | Styling |
| **Framer Motion 12** | Animations |
| **Zustand 5** | State Management |
| **Lucide React** | Iconographie |
| **Google Fonts** | Cinzel, Playfair Display, Montserrat |
| **i18next** | Internationalisation |
| **vite-plugin-pwa** | PWA & Service Worker |

## Design System - Casino de Luxe

### Palette de Couleurs

| Couleur | Hex | Usage |
|---------|-----|-------|
| **Casino Green** | `#0a3622` | Fond principal (feutre de table) |
| **Gold Leaf** | `#d4af37` | Accents, bordures, textes importants |
| **Poker Red** | `#b91c1c` | Boutons danger/contestation |
| **Velvet Black** | `#1a1a1a` | Cartes, surfaces élevées |
| **Ivory** | `#f5f5f0` | Texte principal |

### Typographie

- **Titres** : Cinzel (Art Déco élégant)
- **Corps** : Montserrat (Sans-serif moderne)
- **Accents** : Playfair Display (Serif classique)

### Composants Casino

- **Chip Button** : Boutons 3D style jetons de poker avec ombres relief
- **VIP Input** : Champs de saisie avec soulignement doré
- **Casino Card** : Cartes avec bordures dorées et effets de lumière
- **Slot Card** : Style affiche de machine à sous vintage

## Architecture

```mermaid
flowchart TB
    APP["App.tsx<br/>router principal"]
    SCREENS["components/screens<br/>Welcome - Hub - Rules"]
    GAME["components/game<br/>GameBoard - PlayingCard - ContestModal"]
    UI["components/ui<br/>Button - composants partagés"]
    APPSTORE["stores/appStore.ts<br/>navigation - thème"]
    GAMESTORE["stores/gameStore.ts<br/>joueurs - cartes - contest"]
    LS["localStorage<br/>persistance joueurs"]
    PWA["vite-plugin-pwa<br/>Service Worker - i18next"]
    APP --> SCREENS
    APP --> GAME
    SCREENS --> UI
    GAME --> UI
    SCREENS --> APPSTORE
    GAME --> GAMESTORE
    GAMESTORE --> LS
    APP --> PWA
```

## Flow de Navigation

```
WelcomeScreen (VIP Check-in)
       │
       ▼
   HubScreen ◄──────────┐
       │                │
       ├─► RulesScreen ─┘
       │
       ▼
   GameBoard (Table de Casino)
       │
       └─► (Quitter) ───► HubScreen
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm run lint` | Linter ESLint |

## Déploiement

Consulte le guide complet dans [DEPLOY.md](DEPLOY.md) pour mettre en ligne le site.

**Options disponibles :**

- **Vercel** (Recommandé) - CI/CD automatique, CDN global, gratuit
- **Render** - Alternative gratuite avec `render.yaml` pré-configuré
- **OVH FTP** - Hébergement mutualisé classique avec `.htaccess`

**Configuration domaine OVH :** Ajoute un CNAME `blackout` → `cname.vercel-dns.com` dans ta Zone DNS.

## Changelog

### 2025-01-15 - Prompts Enrichissement
- **content**: Enrichissement massif des prompts (70 → 190 prompts)
- **content**: Je n'ai jamais : 30 prompts (relations, soirées, secrets, réseaux sociaux)
- **content**: Action ou Vérité : 40 prompts (20 truth + 20 dare)
- **content**: Tu préfères : 30 prompts (super-pouvoirs, dilemmes, absurdes)
- **content**: Le plus susceptible : 30 prompts (soirées, relations, traits)
- **content**: C'est un 10 mais : 30 prompts (red flags, habitudes, deal-breakers)
- **content**: 7 Secondes : 30 prompts (culture, pop culture, fun)

### 2025-01-15 - Mini-Jeux Update
- **feat**: 6 mini-jeux textuels (Prompt Games)
- **feat**: Je n'ai jamais, Action ou Vérité, Tu préfères
- **feat**: Le plus susceptible, C'est un 10 mais, 7 Secondes
- **feat**: UI Casino Luxe pour les cartes de prompts
- **feat**: Animations slide entre prompts

### 2025-01-13 - PWA & i18n Update
- **feat**: PWA installable sur iOS et Android (mode standalone)
- **feat**: Internationalisation avec i18next (FR, EN, ES, DE, IT, PT)
- **feat**: Detection automatique de la langue du navigateur
- **feat**: Service Worker pour mode hors-ligne
- **feat**: Manifest PWA avec theme Obsidian (#050505)
- **config**: Balises iOS (apple-touch-icon, apple-mobile-web-app)


### 2025-01-13 - Casino de Luxe Update
- **style**: Refonte complète UI thème "Casino de Luxe / High Roller"
- **style**: Nouvelle palette (Casino Green, Gold Leaf, Poker Red)
- **style**: Typographie Art Déco (Cinzel, Montserrat)
- **feat**: Boutons style Jetons de Poker 3D avec effets relief
- **feat**: Inputs VIP avec soulignement doré
- **feat**: Cartes style Machine à Sous Vintage
- **feat**: Animations shuffle entre écrans
- **feat**: Effets glow dorés et shimmer

### 2025-01-13
- **feat**: Ajout WelcomeScreen pour check-in des joueurs avant le Hub
- **feat**: Bouton "Modifier les joueurs" dans le header du Hub
- **fix**: Préservation des joueurs lors du reset de partie

### 2025-01-12
- **feat**: Hub screen avec GameCard premium
- **feat**: Rules screen avec animations

### Initial Release
- **feat**: Jeu de cartes "Le Borderland" complet
- **feat**: Système de contest avec escalade
- **feat**: Thème Obsidian & Gold

## Licence

Projet privé - Adam Beloucif

---

*À consommer avec modération*


---

<p align="center">
  <sub>Par <a href="https://adam.beloucif.com">Adam Beloucif</a> - Data Engineer & Fullstack Developer - <a href="https://github.com/Adam-Blf">GitHub</a> - <a href="https://www.linkedin.com/in/adambeloucif/">LinkedIn</a></sub>
</p>


## Star History

<a href="https://www.star-history.com/?repos=Adam-Blf%2Fblack-out&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=Adam-Blf/black-out&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=Adam-Blf/black-out&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=Adam-Blf/black-out&type=date&legend=top-left" />
 </picture>
</a>
