# -*- coding: utf-8 -*-
"""Assemble la maquette Bacchus en un SVG importable dans Figma.

POURQUOI UN SVG ET PAS UN FICHIER FIGMA. Le format .fig est proprietaire et non
documente, on ne peut pas l'ecrire. Le serveur MCP Figma, qui saurait creer les
frames directement, est plafonne par le plan Starter. Le SVG est la voie qui
reste, et c'est une bonne voie : Figma l'importe nativement en conservant les
groupes comme calques, les formes comme vecteurs editables et les `<text>` comme
texte editable.

CE QUI REND UN SVG UTILISABLE UNE FOIS IMPORTE, et qu'un export naif rate :
  - chaque ecran est un `<g id="...">` nomme, qui devient un calque nomme ;
    sans identifiants on obtient un tas de « Group 47 » inexploitable ;
  - le texte reste du `<text>`, jamais des courbes, sinon il n'est plus
    modifiable et la maquette perd son interet ;
  - les polices sont nommees telles quelles, donc substituees proprement si
    elles ne sont pas installees ;
  - les ombres sont des rectangles decales, pas des filtres : un feDropShadow
    s'importe mal et serait flou, donc contraire au style.

Usage : python scripts/gen_maquette.py
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

from maquette_core import BODY, DISPLAY, COL, H, INK, INK2, L, LIGNE, RACINE, texte  # noqa: E402
from maquette_ecrans_a import ECRANS_A  # noqa: E402
from maquette_ecrans_b import ECRANS_B  # noqa: E402

SORTIE = RACINE / "design-system" / "bacchus" / "maquette-bacchus.svg"
ECRANS = ECRANS_A + ECRANS_B
COLONNES = 5

MARGE = 110
lignes_total = (len(ECRANS) + COLONNES - 1) // COLONNES
LARGEUR = MARGE * 2 + (COLONNES - 1) * COL + L
HAUTEUR = MARGE * 2 + (lignes_total - 1) * LIGNE + H + 90

s = [f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" '
     f'width="{LARGEUR}" height="{HAUTEUR}" viewBox="0 0 {LARGEUR} {HAUTEUR}">',
     f'  <rect width="{LARGEUR}" height="{HAUTEUR}" fill="#E8E2D8"/>',
     f'  {texte(MARGE, 62, "BACCHUS - MAQUETTE COMPLETE", 38, DISPLAY, INK)}',
     f'  {texte(MARGE, 90, f"{len(ECRANS)} surfaces - genere par scripts/gen_maquette.py, jetons lus dans src/styles/tokens.css. Ne pas editer a la main.", 13, BODY, INK2)}']

for i, fn in enumerate(ECRANS):
    cx = MARGE + (i % COLONNES) * COL
    cy = MARGE + 70 + (i // COLONNES) * LIGNE
    fn(s, cx, cy)

s.append('</svg>')

SORTIE.parent.mkdir(parents=True, exist_ok=True)
SORTIE.write_text("\n".join(s), encoding="utf-8")
print(f"{SORTIE.relative_to(RACINE)} : {len(ECRANS)} ecrans, {SORTIE.stat().st_size / 1024:.0f} ko")
