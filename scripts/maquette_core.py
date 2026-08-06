# -*- coding: utf-8 -*-
"""Briques de la maquette Bacchus : jetons, primitives de dessin, gabarit.

Separe des ecrans eux-memes parce que la maquette complete couvre vingt-quatre
surfaces : tout garder dans un fichier depasserait largement le seuil de
lisibilite, et les primitives sont ce qui garantit qu'un ecran ressemble aux
autres.

LES JETONS SONT LUS DANS tokens.css, jamais recopies. Une maquette qui derive
des vraies couleurs ment, exactement comme une doc perimee.
"""
import base64
import pathlib
import re

RACINE = pathlib.Path(__file__).resolve().parent.parent

css = (RACINE / "src" / "styles" / "tokens.css").read_text(encoding="utf-8")
# Le SELECTEUR en debut de ligne, pas sa premiere mention : `[data-theme='dark']`
# apparait d'abord dans un COMMENTAIRE, bien avant les jetons. Couper la perdait
# la moitie du bloc clair, sans rien signaler.
_fin = re.search(r"^\[data-theme='dark'\] \{", css, re.M)
if not _fin:
    raise SystemExit("bloc de theme sombre introuvable dans tokens.css")
clair = css[css.index(":root {"):_fin.start()]
sombre = css[_fin.start():]


def jeton(nom, defaut=None, bloc=None):
    m = re.search(rf"--color-{nom}:\s*(#[0-9a-fA-F]{{3,8}})\s*;", bloc if bloc is not None else clair)
    if not m:
        if defaut:
            return defaut
        raise SystemExit(f"jeton --color-{nom} introuvable dans tokens.css")
    return m.group(1)


BG, SURFACE, SURFACE_HAUT = jeton("bg"), jeton("surface"), jeton("surface-elevated")
BG_HAUT = jeton("bg-raised")
INK, INK2, INK3 = jeton("ink"), jeton("ink-secondary"), jeton("ink-muted")
NEON, ORANGE_INK = jeton("neon"), jeton("orange-ink")
JAUNE, ROSE, BLEU, LIME = jeton("pop-yellow"), jeton("pop-pink"), jeton("pop-blue"), jeton("pop-lime")
TILE_INK, DEPTH = jeton("tile-ink"), jeton("depth")
DANGER, SUCCES, PREMIUM = jeton("danger"), jeton("success"), jeton("premium")
CARD_FACE = jeton("card-face", "#FFFFFF")
CARD_RED = jeton("card-red", "#C71F2D")

DISPLAY = "Anton, Impact, sans-serif"
BODY = "Bricolage Grotesque, system-ui, sans-serif"

# Gabarit : viewport iPhone 14 Pro Max, celui des captures de recette.
L, H = 430, 932
COL, LIGNE = L + 120, H + 180

ICONES = {f.stem: base64.b64encode(f.read_bytes()).decode()
          for f in sorted((RACINE / "public" / "icons" / "modes").glob("*.png"))}


def echap(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def texte(x, y, contenu, taille=16, police=BODY, couleur=None, gras=None,
          ancre="start", espacement=None, opacite=None):
    a = [f'x="{x}"', f'y="{y}"', f'font-family="{police}"', f'font-size="{taille}"',
         f'fill="{couleur or INK}"', f'text-anchor="{ancre}"']
    if gras:
        a.append(f'font-weight="{gras}"')
    if espacement is not None:
        a.append(f'letter-spacing="{espacement}"')
    if opacite is not None:
        a.append(f'opacity="{opacite}"')
    return f'<text {" ".join(a)}>{echap(contenu)}</text>'


def bloc(x, y, w, h, fond, r=12, cerne=None, epaisseur=2, ombre=0, ombre_couleur=None, opacite=None):
    """Aplat neobrutaliste : cerne franc et ombre portee DURE, par decalage.

    L'ombre est un rectangle decale et non un filtre : un feDropShadow s'importe
    mal dans Figma et serait flou, donc contraire au style.
    """
    out = []
    if ombre:
        out.append(f'<rect x="{x + ombre}" y="{y + ombre}" width="{w}" height="{h}" rx="{r}" fill="{ombre_couleur or TILE_INK}"/>')
    c = f' stroke="{cerne}" stroke-width="{epaisseur}"' if cerne else ""
    o = f' opacity="{opacite}"' if opacite is not None else ""
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fond}"{c}{o}/>')
    return "\n      ".join(out)


def icone(nom, x, y, taille=34):
    d = ICONES.get(nom.lower())
    return "" if not d else (f'<image x="{x}" y="{y}" width="{taille}" height="{taille}" '
                             f'xlink:href="data:image/png;base64,{d}"/>')


def bouton(x, y, w, libelle, primaire=True, h=56, taille=17):
    """Bouton plein largeur, variante primaire (neon) ou secondaire (surface)."""
    fond = NEON if primaire else SURFACE
    encre = TILE_INK if primaire else INK
    ombre_c = TILE_INK if primaire else INK
    return (bloc(x, y, w, h, fond, r=12, cerne=ombre_c, epaisseur=3, ombre=4, ombre_couleur=ombre_c)
            + "\n      " + texte(x + w / 2, y + h / 2 + 6, libelle, taille, DISPLAY, encre, ancre="middle"))


def entete(cx, cy, titre, retour=True):
    """En-tete collant : opaque, cerne bas, comme dans l'app depuis 0.38.0."""
    out = [bloc(cx, cy, L, 74, BG, r=0, cerne=None),
           f'<line x1="{cx}" y1="{cy + 74}" x2="{cx + L}" y2="{cy + 74}" stroke="{INK}" stroke-width="2"/>',
           texte(cx + (66 if retour else 28), cy + 48, titre, 20, DISPLAY, INK)]
    if retour:
        out.append(bloc(cx + 20, cy + 20, 36, 36, SURFACE, r=18, cerne=INK, epaisseur=2))
        out.append(texte(cx + 38, cy + 45, "‹", 20, DISPLAY, INK, ancre="middle"))
    return "\n      ".join(out)


def paragraphe(x, y, lignes, taille=11, couleur=None, interligne=16, ancre="start"):
    return "\n      ".join(
        texte(x, y + i * interligne, l, taille, BODY, couleur or INK2, ancre=ancre)
        for i, l in enumerate(lignes)
    )


def ecran(sorties, nom, cx, cy, corps, fond=None):
    """Un ecran nomme. Le `id` devient le nom du calque une fois importe."""
    sorties.append(f'  <g id="{nom}">')
    sorties.append(f'    {texte(cx, cy - 30, nom.upper(), 20, DISPLAY, INK, espacement=0.5)}')
    sorties.append(f'    <g id="{nom} / cadre">')
    sorties.append(f'      <rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="34" fill="{fond or BG}" stroke="{INK}" stroke-width="3"/>')
    sorties.append(f'      {corps}')
    sorties.append('    </g>')
    sorties.append('  </g>')
