# -*- coding: utf-8 -*-
"""Ameliore le socle de la maquette : echelle, texture, chassis.

Ce que la premiere version ratait, et pourquoi ca se voyait.

  - ECHELLE. Corps a 11-12 pixels dans un cadre de 430 : au zoom ou l'on regarde
    une planche de maquette, c'est de la bouillie grise. Une maquette se lit de
    loin. L'echelle passe a 15 pour le corps, 13 pour les libelles secondaires.
  - TEXTURE. L'application a une trame diagonale de fond depuis 0.38.0, qui a
    remplace les halos flous. La maquette l'ignorait, donc les fonds etaient
    plats et morts, exactement le defaut que la trame corrige dans l'app.
  - CHASSIS. Un rectangle arrondi nu ne se lit pas comme un ecran. Une barre
    d'etat et une barre d'accueil suffisent a l'ancrer, et coutent six lignes.
  - DENSITE. Les ecrans se terminaient a mi-hauteur, ce qui donne l'impression
    d'une page inachevee plutot que d'un ecran cadre.
"""
import base64
import pathlib
import re

RACINE = pathlib.Path(__file__).resolve().parent.parent

css = (RACINE / "src" / "styles" / "tokens.css").read_text(encoding="utf-8")
_fin = re.search(r"^\[data-theme='dark'\] \{", css, re.M)
if not _fin:
    raise SystemExit("bloc de theme sombre introuvable dans tokens.css")
clair = css[css.index(":root {"):_fin.start()]


def jeton(nom, defaut=None):
    m = re.search(rf"--color-{nom}:\s*(#[0-9a-fA-F]{{3,8}})\s*;", clair)
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

# Echelle typographique. Une maquette se lit de loin : le corps est a 15, pas a
# 11, sinon la planche entiere vire au gris.
T_TITRE, T_SOUS, T_CORPS, T_LABEL, T_MICRO = 30, 21, 15, 13, 11

L, H = 430, 932
COL, LIGNE = L + 120, H + 190

ICONES = {f.stem: base64.b64encode(f.read_bytes()).decode()
          for f in sorted((RACINE / "public" / "icons" / "modes").glob("*.png"))}

_dos = RACINE / "public" / "card-back.svg"
DOS_CARTE = base64.b64encode(_dos.read_bytes()).decode() if _dos.exists() else None


def defs():
    """Trame diagonale, identique a `.bg-hatch` : arrets DURS, jamais de degrade."""
    return (
        '  <defs>\n'
        '    <pattern id="hatch" width="17" height="17" patternTransform="rotate(45)" '
        'patternUnits="userSpaceOnUse">\n'
        f'      <rect width="17" height="17" fill="none"/>\n'
        f'      <rect width="2.8" height="17" fill="{INK}" opacity="0.05"/>\n'
        '    </pattern>\n'
        '  </defs>'
    )


def echap(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def texte(x, y, contenu, taille=T_CORPS, police=BODY, couleur=None, gras=None,
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


def bloc(x, y, w, h, fond, r=12, cerne=None, epaisseur=3, ombre=0, ombre_couleur=None,
         opacite=None, rotation=None):
    """Aplat neobrutaliste : cerne franc, ombre portee DURE par decalage.

    L'ombre est un rectangle decale et non un filtre : un feDropShadow s'importe
    mal dans Figma et serait flou, donc contraire au style.
    """
    out = []
    g = ""
    if rotation:
        g = f'<g transform="rotate({rotation} {x + w / 2} {y + h / 2})">'
        out.append(g)
    if ombre:
        out.append(f'<rect x="{x + ombre}" y="{y + ombre}" width="{w}" height="{h}" rx="{r}" fill="{ombre_couleur or TILE_INK}"/>')
    c = f' stroke="{cerne}" stroke-width="{epaisseur}"' if cerne else ""
    o = f' opacity="{opacite}"' if opacite is not None else ""
    out.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fond}"{c}{o}/>')
    if rotation:
        out.append('</g>')
    return "\n      ".join(out)


def icone(nom, x, y, taille=36):
    d = ICONES.get(nom.lower())
    return "" if not d else (f'<image x="{x}" y="{y}" width="{taille}" height="{taille}" '
                             f'xlink:href="data:image/png;base64,{d}"/>')


def dos_carte(x, y, w, h):
    """Vrai asset de dos de carte, embarque, plutot qu'un aplat invente."""
    if not DOS_CARTE:
        return bloc(x, y, w, h, NEON, r=10, cerne=TILE_INK, epaisseur=3)
    return (f'<image x="{x}" y="{y}" width="{w}" height="{h}" preserveAspectRatio="none" '
            f'xlink:href="data:image/svg+xml;base64,{DOS_CARTE}"/>')


def bouton(x, y, w, libelle, primaire=True, h=60, taille=19):
    fond = NEON if primaire else SURFACE
    encre = TILE_INK if primaire else INK
    bord = TILE_INK if primaire else INK
    return (bloc(x, y, w, h, fond, r=12, cerne=bord, epaisseur=3, ombre=5, ombre_couleur=bord)
            + "\n      " + texte(x + w / 2, y + h / 2 + 7, libelle, taille, DISPLAY, encre, ancre="middle"))


def puce(x, y, libelle, fond=JAUNE, encre=None, taille=T_MICRO, h=30):
    w = 22 + len(libelle) * (taille * 0.62)
    return (bloc(x, y, w, h, fond, r=h / 2, cerne=TILE_INK, epaisseur=2)
            + "\n      " + texte(x + w / 2, y + h / 2 + 4, libelle, taille, DISPLAY,
                                 encre or TILE_INK, ancre="middle"))


def entete(cx, cy, titre, retour=True):
    """En-tete collant : opaque et cerne bas, comme dans l'app depuis 0.38.0."""
    out = [f'<rect x="{cx}" y="{cy + 46}" width="{L}" height="76" fill="{BG}"/>',
           f'<line x1="{cx}" y1="{cy + 122}" x2="{cx + L}" y2="{cy + 122}" stroke="{INK}" stroke-width="3"/>',
           texte(cx + (72 if retour else 30), cy + 96, titre, T_SOUS, DISPLAY, INK)]
    if retour:
        out.append(bloc(cx + 24, cy + 66, 38, 38, SURFACE, r=19, cerne=INK, epaisseur=2))
        out.append(texte(cx + 43, cy + 94, "‹", T_SOUS, DISPLAY, INK, ancre="middle"))
    return "\n      ".join(out)


def paragraphe(x, y, lignes, taille=T_LABEL, couleur=None, interligne=None, ancre="start", gras=None):
    interligne = interligne or (taille + 7)
    return "\n      ".join(
        texte(x, y + i * interligne, l, taille, BODY, couleur or INK2, ancre=ancre, gras=gras)
        for i, l in enumerate(lignes)
    )


def chassis(cx, cy, fond):
    """Barre d'etat et barre d'accueil : ce qui fait lire un rectangle comme un ecran."""
    return "\n      ".join([
        f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="{fond}"/>',
        f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="url(#hatch)"/>',
        texte(cx + 34, cy + 32, "22:41", T_LABEL, BODY, INK, gras=700),
        bloc(cx + L - 78, cy + 18, 26, 13, INK, r=3, epaisseur=0),
        bloc(cx + L - 46, cy + 18, 22, 13, INK, r=3, epaisseur=0),
        f'<rect x="{cx + L / 2 - 62}" y="{cy + H - 22}" width="124" height="6" rx="3" fill="{INK}" opacity="0.5"/>',
        f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="none" stroke="{INK}" stroke-width="4"/>',
    ])


def ecran(sorties, nom, cx, cy, corps, fond=None):
    """Un ecran nomme. Le `id` devient le nom du calque une fois importe."""
    sorties.append(f'  <g id="{nom}">')
    sorties.append(f'    {texte(cx, cy - 32, nom.upper(), T_SOUS, DISPLAY, INK, espacement=0.5)}')
    sorties.append(f'    <g id="{nom} / cadre">')
    sorties.append(f'      {chassis(cx, cy, fond or BG)}')
    sorties.append(f'      {corps}')
    sorties.append('    </g>')
    sorties.append('  </g>')
