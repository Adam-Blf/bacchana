# -*- coding: utf-8 -*-
"""Maquette Bacchus, premiere moitie des surfaces.

Nuancier, entree dans la partie, hub, et le Coupe-Gorge avec ses surfaces
annexes (contestation, recapitulatif, galerie). Scinde en deux fichiers pour
rester sous le seuil de lisibilite.
"""
from maquette_core import (BG, BG_HAUT, BLEU, BODY, CARD_FACE, CARD_RED, DANGER, DEPTH,
                           DISPLAY, H, INK, INK2, INK3, JAUNE, L, LIME, NEON, ORANGE_INK,
                           ROSE, SUCCES, SURFACE, SURFACE_HAUT, TILE_INK, PREMIUM,
                           bloc, bouton, ecran, entete, icone, paragraphe, texte)

MODES = [("Quitte ou double", "brain", BLEU), ("La criee", "megaphone", LIME),
         ("Action ou verite", "flame", ROSE), ("Je n'ai jamais", "handmetal", ROSE),
         ("Tu preferes", "scale", LIME), ("C'est un 10 mais", "heart", BLEU),
         ("7 secondes", "timer", JAUNE), ("La roue du destin", "disc3", JAUNE)]


def nuancier(s, cx, cy):
    b = [texte(cx + 32, cy + 66, "BACCHUS", 44, DISPLAY, NEON),
         texte(cx + 32, cy + 92, "Systeme de marque - jetons lus dans tokens.css", 12, BODY, INK2)]
    palette = [("bg", BG), ("surface", SURFACE), ("ink", INK), ("neon", NEON),
               ("orange-ink", ORANGE_INK), ("pop-yellow", JAUNE), ("pop-pink", ROSE),
               ("pop-blue", BLEU), ("pop-lime", LIME), ("depth", DEPTH),
               ("danger", DANGER), ("success", SUCCES), ("premium", PREMIUM),
               ("card-red", CARD_RED), ("card-face", CARD_FACE), ("bg-raised", BG_HAUT)]
    y = cy + 124
    b.append(texte(cx + 32, y, "COULEURS", 14, DISPLAY, INK, espacement=1))
    for i, (nom, val) in enumerate(palette):
        px, py = cx + 32 + (i % 4) * 92, y + 14 + (i // 4) * 74
        b.append(bloc(px, py, 78, 42, val, r=8, cerne=INK, epaisseur=2))
        b.append(texte(px, py + 55, nom, 9, BODY, INK2))
        b.append(texte(px, py + 66, val.upper(), 8, BODY, INK3))
    y += 320
    b.append(texte(cx + 32, y, "TYPOGRAPHIE", 14, DISPLAY, INK, espacement=1))
    b.append(texte(cx + 32, y + 42, "Anton", 32, DISPLAY, INK))
    b.append(texte(cx + 142, y + 42, "titres, tuiles, verdicts", 11, BODY, INK2))
    b.append(texte(cx + 32, y + 78, "Bricolage Grotesque", 19, BODY, INK, gras=700))
    b.append(texte(cx + 32, y + 98, "corps, boutons, libelles", 11, BODY, INK2))
    y += 132
    b.append(texte(cx + 32, y, "COMPOSANTS", 14, DISPLAY, INK, espacement=1))
    b.append(bouton(cx + 32, y + 14, 164, "PRIMAIRE", True, 48, 14))
    b.append(bouton(cx + 212, y + 14, 164, "SECONDAIRE", False, 48, 14))
    b.append(bloc(cx + 32, y + 76, 164, 90, JAUNE, r=12, cerne=TILE_INK, epaisseur=3, ombre=4))
    b.append(icone("spade", cx + 46, y + 88, 28))
    b.append(texte(cx + 46, y + 148, "TUILE DE MODE", 13, DISPLAY, TILE_INK))
    b.append(bloc(cx + 212, y + 76, 164, 90, CARD_FACE, r=12, cerne=TILE_INK, epaisseur=3, ombre=4))
    b.append(texte(cx + 294, y + 122, "CARTE", 14, DISPLAY, TILE_INK, ancre="middle"))
    b.append(texte(cx + 294, y + 142, "face claire fixe", 9, BODY, INK2, ancre="middle"))
    y += 190
    b.append(texte(cx + 32, y, "REGLE D'ENCRE", 14, DISPLAY, INK, espacement=1))
    b.append(paragraphe(cx + 32, y + 22, [
        "Un fond clair dans les DEUX themes porte un cerne et",
        "une ombre FIXES (tile-ink). Un fond qui s'inverse porte",
        "l'encre du theme. Ce qui decide n'est pas la couleur de",
        "l'objet, mais ce que le cerne borde."]))
    ecran(s, "Nuancier", cx, cy, "\n      ".join(b))


def onboarding(s, cx, cy):
    b = [texte(cx + L - 40, cy + 52, "Passer", 13, BODY, INK2, ancre="end"),
         bloc(cx + 30, cy + 180, L - 60, 400, ROSE, r=18, cerne=TILE_INK, epaisseur=3, ombre=6),
         icone("handmetal", cx + L / 2 - 26, cy + 240, 52),
         texte(cx + L / 2, cy + 360, "SANS RESEAU", 30, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 400, [
             "Pas de connexion, pas de pop-up :",
             "Bacchus joue meme sans reseau, du",
             "sous-sol au fond du jardin."], 14, TILE_INK, 22, "middle")]
    for i in range(3):
        b.append(bloc(cx + L / 2 - 34 + i * 26, cy + 640, 18 if i == 1 else 12, 12,
                      NEON if i == 1 else SURFACE, r=6, cerne=INK, epaisseur=2))
    b.append(bouton(cx + 30, cy + 800, L - 60, "SUIVANT"))
    ecran(s, "Onboarding", cx, cy, "\n      ".join(b))


def accueil(s, cx, cy):
    b = [texte(cx + L / 2, cy + 150, "BACCHUS", 60, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 184, "Les meilleurs jeux de soiree, servis au comptoir.", 12, BODY, INK2, ancre="middle"),
         bloc(cx + 24, cy + 216, L - 48, 464, SURFACE, r=18, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK),
         bloc(cx + 48, cy + 244, 146, 38, NEON, r=19, cerne=TILE_INK, epaisseur=2),
         texte(cx + 121, cy + 269, "2 a la tablee", 12, BODY, TILE_INK, gras=700, ancre="middle"),
         texte(cx + 48, cy + 318, "LA TABLEE", 19, DISPLAY, INK)]
    for i, nom in enumerate(["Adam", "Nawel"]):
        yy = cy + 342 + i * 60
        b.append(bloc(cx + 48, yy, 42, 42, BG, r=21, cerne=INK, epaisseur=2))
        b.append(texte(cx + 69, yy + 28, str(i + 1), 14, BODY, INK, gras=700, ancre="middle"))
        b.append(bloc(cx + 102, yy, 230, 42, SURFACE_HAUT, r=10, cerne=INK, epaisseur=2))
        b.append(texte(cx + 118, yy + 28, nom, 14, BODY, INK))
        b.append(bloc(cx + 344, yy, 42, 42, SURFACE, r=21, cerne=INK, epaisseur=2))
    b.append(f'<rect x="{cx + 48}" y="{cy + 478}" width="338" height="50" rx="10" fill="none" stroke="{INK}" stroke-width="2.5" stroke-dasharray="9 7"/>')
    b.append(texte(cx + 217, cy + 509, "Une chaise de plus", 14, BODY, INK, gras=700, ancre="middle"))
    b.append(bouton(cx + 48, cy + 562, 338, "POUSSER LA PORTE", True, 60, 18))
    b.append(texte(cx + 217, cy + 656, "Ces noms seront utilises pour tous les jeux", 10, BODY, INK2, ancre="middle"))
    ecran(s, "Accueil", cx, cy, "\n      ".join(b))


def hub(s, cx, cy):
    b = [texte(cx + L / 2, cy + 76, "BACCHUS", 38, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 102, "Au menu ce soir : 13 jeux", 11, BODY, INK2, ancre="middle"),
         bloc(cx + 100, cy + 120, 230, 38, SURFACE, r=10, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK),
         texte(cx + 215, cy + 145, "2 joueurs  -  Modifier", 12, BODY, INK, gras=700, ancre="middle"),
         bloc(cx + 24, cy + 180, L - 48, 200, NEON, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
         icone("spade", cx + 46, cy + 200, 40),
         texte(cx + 46, cy + 292, "LE COUPE-GORGE", 29, DISPLAY, TILE_INK),
         texte(cx + 46, cy + 316, "52 cartes - 4 regles - 0 pitie.", 12, BODY, TILE_INK, gras=700),
         bloc(cx + 46, cy + 332, 114, 36, TILE_INK, r=18),
         texte(cx + 103, cy + 356, "JOUER", 13, DISPLAY, JAUNE, ancre="middle"),
         texte(cx + 184, cy + 356, "Regles", 12, BODY, TILE_INK, gras=700)]
    for i, (titre, ic, couleur) in enumerate(MODES):
        px, py = cx + 24 + (i % 2) * 192, cy + 398 + (i // 2) * 112
        b.append(bloc(px, py, 180, 100, couleur, r=14, cerne=TILE_INK, epaisseur=3, ombre=4))
        b.append(icone(ic, px + 14, py + 14, 30))
        b.append(bloc(px + 136, py + 10, 30, 30, CARD_FACE, r=15, cerne=TILE_INK, epaisseur=2))
        b.append(texte(px + 151, py + 31, "?", 14, DISPLAY, TILE_INK, ancre="middle"))
        b.append(texte(px + 14, py + 74, titre.upper()[:16], 14, DISPLAY, TILE_INK))
    b.append(texte(cx + L / 2, cy + 872, "Jouez responsable : Bacchus veille sur sa tablee.", 10, BODY, INK2, ancre="middle"))
    ecran(s, "Hub", cx, cy, "\n      ".join(b))


def options_coupe_gorge(s, cx, cy):
    b = [entete(cx, cy, "LE COUPE-GORGE - OPTIONS"),
         texte(cx + 28, cy + 116, "Nombre de paquets", 13, BODY, INK, gras=700)]
    for i in range(3):
        px, actif = cx + 28 + i * 126, i == 0
        b.append(bloc(px, cy + 128, 114, 48, JAUNE if actif else SURFACE, r=10,
                      cerne=TILE_INK if actif else INK, epaisseur=2, ombre=3 if actif else 0))
        b.append(texte(px + 57, cy + 158, f"{i + 1} ({52 * (i + 1)})", 13, BODY,
                       TILE_INK if actif else INK, gras=700, ancre="middle"))
    b.append(bloc(cx + 20, cy + 196, L - 40, 190, SURFACE_HAUT, r=14, cerne=NEON, epaisseur=3))
    b.append(bloc(cx + 36, cy + 210, 86, 24, NEON, r=12, cerne=TILE_INK, epaisseur=2))
    b.append(texte(cx + 79, cy + 227, "NOUVEAU", 10, DISPLAY, TILE_INK, ancre="middle"))
    b.append(texte(cx + 36, cy + 264, "Nombre de trefles", 15, BODY, INK, gras=700))
    b.append(paragraphe(cx + 36, cy + 288, [
        "Le trefle porte Le Guess, la seule regle a phase",
        "face cachee : ce nombre regle donc la frequence",
        "des tours de devinette."]))
    for i, v in enumerate(["0", "4", "8", "13"]):
        px, actif = cx + 36 + i * 92, v == "13"
        b.append(bloc(px, cy + 336, 80, 38, LIME if actif else SURFACE, r=10,
                      cerne=TILE_INK if actif else INK, epaisseur=2, ombre=3 if actif else 0))
        b.append(texte(px + 40, cy + 361, v, 14, BODY, TILE_INK if actif else INK, gras=700, ancre="middle"))
    b.append(texte(cx + 28, cy + 422, "Composition du paquet", 13, BODY, INK, gras=700))
    for i, (nom, sym, roug) in enumerate([("Le Guess", "♣", False), ("L'Action", "♦", True),
                                          ("La Question", "♥", True), ("La Contrainte", "♠", False)]):
        px, py = cx + 28 + (i % 2) * 190, cy + 436 + (i // 2) * 56
        b.append(bloc(px, py, 178, 46, SURFACE, r=10, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
        b.append(texte(px + 16, py + 30, sym, 17, BODY, DANGER if roug else INK))
        b.append(texte(px + 40, py + 30, nom, 12, BODY, INK, gras=700))
    b.append(texte(cx + 28, cy + 578, "Valeurs retirees", 13, BODY, INK, gras=700))
    for i, r in enumerate(["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]):
        px = cx + 28 + (i % 7) * 54
        py = cy + 592 + (i // 7) * 48
        exclu = r == "Q"
        b.append(bloc(px, py, 46, 40, SURFACE if exclu else JAUNE, r=9,
                      cerne=INK if exclu else TILE_INK, epaisseur=2, ombre=0 if exclu else 3))
        b.append(texte(px + 23, py + 26, r, 13, BODY, INK3 if exclu else TILE_INK, gras=700, ancre="middle"))
    b.append(bouton(cx + 28, cy + 800, L - 56, "C'EST PARTI", True, 58, 19))
    ecran(s, "Options du Coupe-Gorge", cx, cy, "\n      ".join(b))


def coupe_gorge_cachee(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "ADAM", 28, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 98, "C'est ton tour de distribuer", 11, BODY, INK2, ancre="middle"),
         bloc(cx + 24, cy + 118, 300, 8, SURFACE, r=4, cerne=INK, epaisseur=1),
         bloc(cx + 336, cy + 108, 70, 28, SURFACE, r=14, cerne=INK, epaisseur=2),
         texte(cx + 371, cy + 127, "54 / 54", 11, BODY, INK, gras=700, ancre="middle"),
         bloc(cx + 131, cy + 240, 168, 244, CARD_FACE, r=14, cerne=TILE_INK, epaisseur=3, ombre=6),
         f'<rect x="{cx + 147}" y="{cy + 256}" width="136" height="212" rx="8" fill="{NEON}" stroke="{TILE_INK}" stroke-width="3"/>',
         texte(cx + 215, cy + 380, "?", 60, DISPLAY, CARD_FACE, ancre="middle"),
         bloc(cx + 40, cy + 522, 350, 128, JAUNE, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
         texte(cx + 215, cy + 558, "TREFLE - LE GUESS", 20, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + 215, cy + 586, ["Fais deviner sa valeur exacte a la table",
                                         "AVANT de retourner la carte.",
                                         "Juste : tu distribues. Faux : il prend."], 11, TILE_INK, 20, "middle"),
         bloc(cx + 90, cy + 680, 250, 50, TILE_INK, r=25),
         texte(cx + 215, cy + 712, "TOUCHER POUR REVELER", 13, DISPLAY, JAUNE, ancre="middle"),
         paragraphe(cx + 215, cy + 782, ["Seul le trefle arrive face cachee.",
                                         "Les autres enseignes sont revelees d'emblee."], 10, INK2, 17, "middle")]
    ecran(s, "Coupe-Gorge - trefle face cachee", cx, cy, "\n      ".join(b))


def coupe_gorge_revelee(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "NAWEL", 28, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 98, "Carte revelee", 11, BODY, INK2, ancre="middle"),
         bloc(cx + 131, cy + 160, 168, 244, CARD_FACE, r=14, cerne=TILE_INK, epaisseur=3, ombre=6),
         texte(cx + 152, cy + 204, "7", 32, DISPLAY, CARD_RED),
         texte(cx + 215, cy + 312, "♥", 76, BODY, CARD_RED, ancre="middle"),
         texte(cx + 278, cy + 380, "7", 32, DISPLAY, CARD_RED, ancre="middle"),
         bloc(cx + 40, cy + 436, 350, 170, SURFACE_HAUT, r=14, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK),
         texte(cx + 215, cy + 478, "LA QUESTION", 25, DISPLAY, INK, ancre="middle"),
         f'<line x1="{cx + 70}" y1="{cy + 496}" x2="{cx + 360}" y2="{cy + 496}" stroke="{INK}" stroke-width="1.5"/>',
         texte(cx + 215, cy + 528, "Pose une question au joueur de ton choix.", 12, BODY, INK2, ancre="middle"),
         bloc(cx + 155, cy + 548, 120, 32, JAUNE, r=16, cerne=TILE_INK, epaisseur=2),
         texte(cx + 215, cy + 570, "7 GORGEES", 12, DISPLAY, TILE_INK, ancre="middle"),
         bouton(cx + 40, cy + 646, 168, "CONTESTER", False),
         bouton(cx + 222, cy + 646, 168, "SUIVANT", True)]
    ecran(s, "Coupe-Gorge - carte revelee", cx, cy, "\n      ".join(b))


def contestation(s, cx, cy):
    b = [f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="34" fill="{TILE_INK}" opacity="0.8"/>',
         bloc(cx + 30, cy + 260, L - 60, 400, SURFACE_HAUT, r=18, cerne=INK, epaisseur=3, ombre=6, ombre_couleur=INK),
         texte(cx + L / 2, cy + 320, "CONTESTATION", 27, DISPLAY, INK, ancre="middle"),
         texte(cx + L / 2, cy + 348, "Nawel conteste Adam", 13, BODY, INK2, ancre="middle"),
         bloc(cx + 90, cy + 372, 250, 90, JAUNE, r=14, cerne=TILE_INK, epaisseur=3, ombre=4),
         texte(cx + 215, cy + 412, "14 GORGEES", 30, DISPLAY, TILE_INK, ancre="middle"),
         texte(cx + 215, cy + 440, "mise doublee", 11, BODY, TILE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 496, ["Le perdant boit la mise entiere.",
                                           "Relancer double encore."], 12, INK2, 20, "middle"),
         bouton(cx + 60, cy + 546, 140, "RELANCER", False, 52, 14),
         bouton(cx + 216, cy + 546, 140, "TRANCHER", True, 52, 14),
         texte(cx + L / 2, cy + 634, "Abandonner", 12, BODY, INK2, ancre="middle")]
    ecran(s, "Contestation", cx, cy, "\n      ".join(b))


def recapitulatif(s, cx, cy):
    b = [entete(cx, cy, "FIN DE PARTIE"),
         bloc(cx + 24, cy + 100, L - 48, 300, CARD_FACE, r=14, cerne=TILE_INK, epaisseur=3, ombre=6),
         texte(cx + L / 2, cy + 146, "L'ADDITION", 26, DISPLAY, TILE_INK, ancre="middle"),
         f'<line x1="{cx + 60}" y1="{cy + 166}" x2="{cx + 370}" y2="{cy + 166}" stroke="{TILE_INK}" stroke-width="2" stroke-dasharray="6 5"/>']
    for i, (nom, n) in enumerate([("Adam", "23"), ("Nawel", "17")]):
        yy = cy + 200 + i * 40
        b.append(texte(cx + 60, yy, nom, 14, BODY, TILE_INK, gras=700))
        b.append(texte(cx + 370, yy, f"{n} gorgees", 14, BODY, TILE_INK, ancre="end"))
    b.append(f'<line x1="{cx + 60}" y1="{cy + 296}" x2="{cx + 370}" y2="{cy + 296}" stroke="{TILE_INK}" stroke-width="2" stroke-dasharray="6 5"/>')
    b.append(texte(cx + 60, cy + 330, "TOTAL", 16, DISPLAY, TILE_INK))
    b.append(texte(cx + 370, cy + 330, "40 gorgees", 16, DISPLAY, TILE_INK, ancre="end"))
    b.append(texte(cx + L / 2, cy + 368, "54 cartes - 21 tours - 1 contestation", 10, BODY, INK3, ancre="middle"))
    b.append(bloc(cx + 24, cy + 428, L - 48, 96, LIME, r=14, cerne=TILE_INK, epaisseur=3, ombre=4))
    b.append(texte(cx + L / 2, cy + 468, "SOIREE TERMINEE", 22, DISPLAY, TILE_INK, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 496, "Rentrez bien, buvez de l'eau.", 12, BODY, TILE_INK, ancre="middle"))
    b.append(bouton(cx + 24, cy + 560, L - 48, "REJOUER", True))
    b.append(bouton(cx + 24, cy + 632, L - 48, "RETOUR AU HUB", False))
    ecran(s, "Recapitulatif de session", cx, cy, "\n      ".join(b))


def galerie(s, cx, cy):
    b = [entete(cx, cy, "CARTES JOUEES")]
    for i in range(12):
        px, py = cx + 26 + (i % 4) * 96, cy + 106 + (i // 4) * 132
        rouge = i % 3 == 1
        b.append(bloc(px, py, 84, 118, CARD_FACE, r=10, cerne=TILE_INK, epaisseur=3, ombre=4))
        b.append(texte(px + 12, py + 30, ["A", "7", "K", "3"][i % 4], 20, DISPLAY, CARD_RED if rouge else TILE_INK))
        b.append(texte(px + 42, py + 76, ["♠", "♥", "♣", "♦"][i % 4], 30, BODY,
                       CARD_RED if rouge else TILE_INK, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 660, "12 cartes sur 54", 12, BODY, INK2, ancre="middle"))
    b.append(bouton(cx + 26, cy + 700, L - 52, "FERMER", False))
    ecran(s, "Galerie des cartes", cx, cy, "\n      ".join(b))


def quiz(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "QUITTE OU DOUBLE", 26, DISPLAY, NEON, ancre="middle"),
         bloc(cx + 150, cy + 96, 130, 30, JAUNE, r=15, cerne=TILE_INK, epaisseur=2),
         texte(cx + 215, cy + 116, "MANCHE 3 / 8", 11, DISPLAY, TILE_INK, ancre="middle"),
         bloc(cx + 24, cy + 150, L - 48, 210, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
         bloc(cx + 46, cy + 172, 110, 28, BLEU, r=14, cerne=TILE_INK, epaisseur=2),
         texte(cx + 101, cy + 191, "CULTURE G", 10, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 250, ["En quelle annee la Tour Eiffel", "a-t-elle ete inauguree ?"],
                    16, TILE_INK, 26, "middle")]
    for i, (rep, etat) in enumerate([("1889", "bon"), ("1900", None), ("1878", None), ("1925", None)]):
        py = cy + 386 + i * 76
        fond = LIME if etat else SURFACE
        b.append(bloc(cx + 24, py, L - 48, 62, fond, r=12,
                      cerne=TILE_INK if etat else INK, epaisseur=3, ombre=4,
                      ombre_couleur=TILE_INK if etat else INK))
        b.append(texte(cx + 48, py + 38, rep, 16, BODY, TILE_INK if etat else INK, gras=700))
    b.append(bloc(cx + 24, cy + 700, L - 48, 70, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 48, cy + 730, "Cagnotte", 11, BODY, INK2))
    b.append(texte(cx + 48, cy + 754, "6 gorgees en jeu", 15, BODY, INK, gras=700))
    b.append(texte(cx + L - 48, cy + 744, "x2", 26, DISPLAY, NEON, ancre="end"))
    ecran(s, "Quitte ou double", cx, cy, "\n      ".join(b))


def classement(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "CLASSEMENT", 26, DISPLAY, NEON, ancre="middle"),
         bloc(cx + 24, cy + 100, L - 48, 86, BLEU, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
         paragraphe(cx + L / 2, cy + 138, ["Classe la tablee du plus", "susceptible au moins."],
                    14, TILE_INK, 22, "middle")]
    for i, (nom, pos) in enumerate([("Nawel", "1"), ("Adam", "2"), ("Emilien", None), ("Amina", None)]):
        py = cy + 216 + i * 76
        choisi = pos is not None
        b.append(bloc(cx + 24, py, L - 48, 62, JAUNE if choisi else SURFACE, r=12,
                      cerne=TILE_INK if choisi else INK, epaisseur=3, ombre=4,
                      ombre_couleur=TILE_INK if choisi else INK))
        b.append(bloc(cx + 44, py + 15, 32, 32, TILE_INK if choisi else BG, r=16,
                      cerne=TILE_INK if choisi else INK, epaisseur=2))
        if choisi:
            b.append(texte(cx + 60, py + 37, pos, 14, DISPLAY, JAUNE, ancre="middle"))
        b.append(texte(cx + 92, py + 39, nom, 16, BODY, TILE_INK if choisi else INK, gras=700))
    b.append(bloc(cx + 24, cy + 540, L - 48, 92, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 44, cy + 572, "Le dernier classe distribue", 13, BODY, INK, gras=700))
    b.append(texte(cx + 44, cy + 598, "autant de gorgees que sa position.", 11, BODY, INK2))
    b.append(bouton(cx + 24, cy + 800, L - 48, "VALIDER LE CLASSEMENT", True, 58, 16))
    ecran(s, "Classement", cx, cy, "\n      ".join(b))


ECRANS_A = [nuancier, accueil, onboarding, hub, options_coupe_gorge,
            coupe_gorge_cachee, coupe_gorge_revelee, contestation,
            recapitulatif, galerie, quiz, classement]
