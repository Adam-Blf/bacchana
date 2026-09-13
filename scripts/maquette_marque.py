# -*- coding: utf-8 -*-
"""Planche de marque Bacchana : identite, palette, typographie, composants.

Ce que « tout le necessaire pour Figma » veut dire concretement : de quoi
reconstruire un ecran sans revenir au code. Une planche d'ecrans seule ne suffit
pas, parce qu'elle montre des resultats sans donner les pieces.

Trois planches :
  1. IDENTITE  - logo, nom, palette complete avec valeurs, regle d'encre.
  2. TYPO      - echelle reelle, roles, exemples au bon corps.
  3. COMPOSANTS- boutons, tuiles, cartes, puces, champs, interrupteurs, etats.
"""
import base64
import pathlib

from maquette_core import (BG, BG_HAUT, BLEU, BODY, CARD_FACE, CARD_RED, DANGER, DEPTH,
                           DISPLAY, H, INK, INK2, INK3, JAUNE, L, LIME, NEON, ORANGE_INK,
                           PREMIUM, ROSE, SUCCES, SURFACE, SURFACE_HAUT, TILE_INK,
                           T_CORPS, T_LABEL, T_MICRO, T_SOUS, T_TITRE,
                           RACINE, bloc, bouton, dos_carte, ecran, icone, paragraphe, puce, texte)

_logo = RACINE / "public" / "icon.svg"
LOGO = base64.b64encode(_logo.read_bytes()).decode() if _logo.exists() else None


def identite(s, cx, cy):
    b = []
    if LOGO:
        b.append(f'<image x="{cx + 30}" y="{cy + 60}" width="120" height="120" '
                 f'xlink:href="data:image/svg+xml;base64,{LOGO}"/>')
    b.append(texte(cx + 168, cy + 118, "BACCHANA", 48, DISPLAY, NEON))
    b.append(texte(cx + 170, cy + 146, "Jeux de soiree - BLF Lab's", T_LABEL, BODY, INK2))
    b.append(texte(cx + 170, cy + 168, "bacchana.beloucif.com", T_MICRO, BODY, INK3))

    b.append(texte(cx + 30, cy + 232, "PALETTE", T_SOUS, DISPLAY, INK, espacement=1))
    palette = [("bg", BG), ("bg-raised", BG_HAUT), ("surface", SURFACE), ("surface-elev", SURFACE_HAUT),
               ("ink", INK), ("ink-secondary", INK2), ("ink-muted", INK3), ("tile-ink", TILE_INK),
               ("neon", NEON), ("orange-ink", ORANGE_INK), ("depth", DEPTH), ("premium", PREMIUM),
               ("aplat-1", JAUNE), ("aplat-2", ROSE), ("aplat-3", BLEU), ("aplat-4", LIME),
               ("danger", DANGER), ("success", SUCCES), ("card-face", CARD_FACE), ("card-red", CARD_RED)]
    for i, (nom, val) in enumerate(palette):
        px, py = cx + 30 + (i % 4) * 94, cy + 250 + (i // 4) * 80
        b.append(bloc(px, py, 82, 46, val, r=8, cerne=INK, epaisseur=2))
        b.append(texte(px, py + 62, nom, T_MICRO - 1, BODY, INK2, gras=700))
        b.append(texte(px, py + 74, val.upper(), T_MICRO - 2, BODY, INK3))

    y = cy + 682
    b.append(texte(cx + 30, y, "REGLE D'ENCRE", T_SOUS, DISPLAY, INK, espacement=1))
    b.append(bloc(cx + 30, y + 20, 176, 88, JAUNE, r=12, cerne=TILE_INK, epaisseur=3, ombre=5))
    b.append(texte(cx + 118, y + 60, "FIXE", T_SOUS, DISPLAY, TILE_INK, ancre="middle"))
    b.append(texte(cx + 118, y + 82, "aplat clair", T_MICRO, BODY, TILE_INK, ancre="middle"))
    b.append(bloc(cx + 224, y + 20, 176, 88, SURFACE, r=12, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK))
    b.append(texte(cx + 312, y + 60, "THEMATIQUE", T_SOUS, DISPLAY, INK, ancre="middle"))
    b.append(texte(cx + 312, y + 82, "fond qui s'inverse", T_MICRO, BODY, INK2, ancre="middle"))
    b.append(paragraphe(cx + 30, y + 138, [
        "Ce qui decide n'est pas la couleur de l'objet, mais ce",
        "que le cerne borde. Un aplat pop reste clair dans les",
        "deux themes : son cerne et son ombre sont fixes. Un",
        "fond qui s'inverse porte l'encre du theme."], T_LABEL))
    ecran(s, "Marque - identite", cx, cy, "\n      ".join(b))


def typographie(s, cx, cy):
    b = [texte(cx + 30, cy + 92, "TYPOGRAPHIE", T_TITRE, DISPLAY, INK)]
    y = cy + 130
    b.append(texte(cx + 30, y, "ANTON - titres, tuiles, verdicts", T_LABEL, BODY, INK2, gras=700))
    for i, (lab, taille) in enumerate([("Titre geant", 54), ("Titre d'ecran", 34), ("Titre de tuile", 24), ("Libelle bouton", 19)]):
        yy = y + 46 + i * 62
        b.append(texte(cx + 30, yy, "Bacchana", taille, DISPLAY, INK))
        b.append(texte(cx + L - 30, yy, f"{lab} - {taille}", T_MICRO, BODY, INK3, ancre="end"))
    y += 320
    b.append(texte(cx + 30, y, "BRICOLAGE GROTESQUE - corps, libelles", T_LABEL, BODY, INK2, gras=700))
    for i, (lab, taille, gras) in enumerate([("Corps", T_CORPS, None), ("Corps gras", T_CORPS, 700),
                                             ("Libelle", T_LABEL, None), ("Micro", T_MICRO, None)]):
        yy = y + 40 + i * 46
        b.append(texte(cx + 30, yy, "Les meilleurs jeux de soiree", taille, BODY, INK, gras=gras))
        b.append(texte(cx + L - 30, yy, f"{lab} - {taille}", T_MICRO, BODY, INK3, ancre="end"))
    y += 240
    b.append(texte(cx + 30, y, "TON", T_SOUS, DISPLAY, INK, espacement=1))
    b.append(paragraphe(cx + 30, y + 26, [
        "Registre de comptoir, direct, jamais moralisateur.",
        "Phrases courtes. Tutoiement. Une pointe d'insolence,",
        "jamais de mepris. « Servis sans moderation de",
        "mauvaise foi », pas « Amusez-vous bien ! »."], T_LABEL))
    b.append(bloc(cx + 30, y + 130, L - 60, 78, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 48, y + 160, "A PROSCRIRE", T_LABEL, DISPLAY, DANGER))
    b.append(texte(cx + 48, y + 186, "Tiret cadratin, mediopoint, emoji-icone, Inter.", T_MICRO, BODY, INK2))
    ecran(s, "Marque - typographie", cx, cy, "\n      ".join(b))


def composants(s, cx, cy):
    b = [texte(cx + 30, cy + 92, "COMPOSANTS", T_TITRE, DISPLAY, INK)]
    y = cy + 116
    b.append(texte(cx + 30, y, "BOUTONS", T_LABEL, DISPLAY, INK2, espacement=1))
    b.append(bouton(cx + 30, y + 14, 172, "PRIMAIRE", True, 54, 16))
    b.append(bouton(cx + 218, y + 14, 172, "SECONDAIRE", False, 54, 16))
    b.append(bloc(cx + 30, y + 84, 172, 54, NEON, r=12, cerne=TILE_INK, epaisseur=3))
    b.append(texte(cx + 116, y + 118, "PRESSE", 16, DISPLAY, TILE_INK, ancre="middle"))
    b.append(bloc(cx + 218, y + 84, 172, 54, SURFACE, r=12, cerne=INK, epaisseur=3, opacite=0.45))
    b.append(texte(cx + 304, y + 118, "DESACTIVE", 16, DISPLAY, INK3, ancre="middle"))

    y += 168
    b.append(texte(cx + 30, y, "PUCES ET BADGES", T_LABEL, DISPLAY, INK2, espacement=1))
    b.append(puce(cx + 30, y + 14, "PREMIUM", PREMIUM, CARD_FACE))
    b.append(puce(cx + 148, y + 14, "NOUVEAU", NEON))
    b.append(puce(cx + 266, y + 14, "PARTAGEE", LIME))
    b.append(puce(cx + 30, y + 56, "8 GORGEES", JAUNE))
    b.append(puce(cx + 158, y + 56, "CULTURE G", BLEU))
    b.append(puce(cx + 286, y + 56, "RATE", ROSE))

    y += 116
    b.append(texte(cx + 30, y, "CHAMPS ET INTERRUPTEURS", T_LABEL, DISPLAY, INK2, espacement=1))
    b.append(bloc(cx + 30, y + 14, 230, 50, BG_HAUT, r=10, cerne=INK, epaisseur=2))
    b.append(texte(cx + 48, y + 45, "Joueur 1", T_CORPS, BODY, INK3))
    b.append(bloc(cx + 276, y + 20, 62, 34, LIME, r=17, cerne=TILE_INK, epaisseur=2))
    b.append(f'<circle cx="{cx + 322}" cy="{cy + y - cy + 37}" r="12" fill="{CARD_FACE}" stroke="{TILE_INK}" stroke-width="2"/>')
    b.append(bloc(cx + 352, y + 20, 34, 34, SURFACE, r=8, cerne=INK, epaisseur=3))

    y += 92
    b.append(texte(cx + 30, y, "TUILES ET CARTES", T_LABEL, DISPLAY, INK2, espacement=1))
    b.append(bloc(cx + 30, y + 14, 172, 112, JAUNE, r=14, cerne=TILE_INK, epaisseur=3, ombre=5))
    b.append(icone("spade", cx + 46, y + 30, 34))
    b.append(texte(cx + 46, y + 104, "TUILE DE MODE", 15, DISPLAY, TILE_INK))
    b.append(bloc(cx + 218, y + 14, 78, 112, CARD_FACE, r=10, cerne=TILE_INK, epaisseur=3, ombre=5))
    b.append(texte(cx + 232, y + 44, "A", 22, DISPLAY, CARD_RED))
    b.append(texte(cx + 257, y + 92, "♥", 30, BODY, CARD_RED, ancre="middle"))
    b.append(dos_carte(cx + 310, y + 14, 78, 112))

    y += 158
    b.append(texte(cx + 30, y, "TEXTURE DE FOND", T_LABEL, DISPLAY, INK2, espacement=1))
    b.append(f'<rect x="{cx + 30}" y="{y + 14}" width="{L - 60}" height="72" rx="12" fill="{BG}" stroke="{INK}" stroke-width="2"/>')
    b.append(f'<rect x="{cx + 30}" y="{y + 14}" width="{L - 60}" height="72" rx="12" fill="url(#hatch)"/>')
    b.append(texte(cx + L / 2, y + 58, ".bg-hatch - rayures a bords nets", T_LABEL, BODY, INK2, ancre="middle"))
    b.append(texte(cx + 30, y + 108, "Remplace les halos flous : la profondeur vient du", T_MICRO, BODY, INK3))
    b.append(texte(cx + 30, y + 124, "decalage et du bord franc, jamais du flou.", T_MICRO, BODY, INK3))
    ecran(s, "Marque - composants", cx, cy, "\n      ".join(b))


PLANCHES_MARQUE = [identite, typographie, composants]
