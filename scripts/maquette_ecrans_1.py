# -*- coding: utf-8 -*-
"""Parcours d'entree et Coupe-Gorge. Copie et structure lues dans le code."""
from maquette_core import (BG, BG_HAUT, BLEU, BODY, CARD_FACE, CARD_RED, DANGER, DEPTH,
                           DISPLAY, H, INK, INK2, INK3, JAUNE, L, LIME, NEON, ORANGE_INK,
                           PREMIUM, ROSE, SUCCES, SURFACE, SURFACE_HAUT, TILE_INK,
                           T_CORPS, T_LABEL, T_MICRO, T_SOUS, T_TITRE,
                           bloc, bouton, dos_carte, ecran, entete, icone, paragraphe, puce, texte)

MODES = [("Quitte ou Double", "brain", BLEU), ("La Criee", "megaphone", LIME),
         ("Action ou Verite", "flame", ROSE), ("Je n'ai jamais", "handmetal", ROSE),
         ("Tu preferes", "scale", LIME), ("C'est un 10 mais", "heart", BLEU),
         ("7 Secondes", "timer", JAUNE), ("La Roue du Destin", "disc3", JAUNE)]


def onboarding(s, cx, cy):
    b = [texte(cx + L - 34, cy + 76, "Passer", T_LABEL, BODY, INK2, ancre="end"),
         bloc(cx + 28, cy + 168, L - 56, 430, JAUNE, r=18, cerne=TILE_INK, epaisseur=3, ombre=7),
         icone("handmetal", cx + L / 2 - 30, cy + 226, 60),
         texte(cx + L / 2, cy + 352, "ZERO PUB,", 32, DISPLAY, TILE_INK, ancre="middle"),
         texte(cx + L / 2, cy + 388, "HORS LIGNE", 32, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 442, ["Pas de connexion, pas de pop-up :",
                                           "Bacchana joue meme sans reseau, du",
                                           "sous-sol au fond du jardin."],
                    T_CORPS, TILE_INK, 26, "middle")]
    for i in range(3):
        actif = i == 1
        b.append(bloc(cx + L / 2 - 30 + i * 26, cy + 648, 24 if actif else 10, 10,
                      NEON if actif else INK3, r=5, cerne=None, epaisseur=0))
    b.append(bouton(cx + 28, cy + 812, L - 56, "SUIVANT"))
    ecran(s, "Onboarding", cx, cy, "\n      ".join(b))


def accueil(s, cx, cy):
    b = [texte(cx + L / 2, cy + 168, "BACCHANA", 66, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 202, "Les meilleurs jeux de soiree, servis au comptoir.", T_LABEL, BODY, INK2, ancre="middle"),
         bloc(cx + 22, cy + 234, L - 44, 512, SURFACE, r=18, cerne=INK, epaisseur=3, ombre=6, ombre_couleur=INK),
         puce(cx + 46, cy + 262, "2 A LA TABLEE", NEON),
         texte(cx + 46, cy + 342, "LA TABLEE", 24, DISPLAY, INK)]
    for i, nom in enumerate(["Adam", "Nawel"]):
        yy = cy + 366 + i * 66
        b.append(bloc(cx + 46, yy, 46, 46, BG_HAUT, r=23, cerne=INK, epaisseur=2))
        b.append(texte(cx + 69, yy + 31, str(i + 1), T_CORPS, BODY, INK, gras=700, ancre="middle"))
        b.append(bloc(cx + 104, yy, 226, 46, BG_HAUT, r=10, cerne=INK, epaisseur=2))
        b.append(texte(cx + 122, yy + 31, nom, T_CORPS, BODY, INK))
        b.append(bloc(cx + 342, yy, 46, 46, SURFACE, r=10, cerne=INK, epaisseur=2))
    b.append(paragraphe(cx + 46, cy + 520, ["Genre et statut sont facultatifs, juste pour des",
                                            "jeux plus personnalises. Rien ne quitte ton telephone."], T_MICRO))
    b.append(f'<rect x="{cx + 46}" y="{cy + 552}" width="342" height="52" rx="10" fill="none" stroke="{INK}" stroke-width="2.5" stroke-dasharray="9 7"/>')
    b.append(texte(cx + 217, cy + 585, "Une chaise de plus", T_CORPS, BODY, INK, gras=700, ancre="middle"))
    b.append(bouton(cx + 46, cy + 632, 342, "POUSSER LA PORTE", True, 64, 20))
    b.append(texte(cx + 217, cy + 722, "Minimum 2 joueurs, maximum 8", T_MICRO, BODY, INK3, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 792, "Ces noms seront utilises pour tous les jeux", T_LABEL, BODY, INK2, ancre="middle"))
    ecran(s, "Accueil - la tablee", cx, cy, "\n      ".join(b))


def hub(s, cx, cy):
    b = [texte(cx + L / 2, cy + 106, "BACCHANA", 50, DISPLAY, NEON, ancre="middle"),
         paragraphe(cx + L / 2, cy + 138, ["Au menu ce soir : 13 jeux, servis",
                                           "sans moderation de mauvaise foi."], T_LABEL, INK2, 19, "middle")]
    for i, lab in enumerate(["2 joueurs - Modifier", "Mes regles"]):
        px = cx + 24 + i * 210
        b.append(bloc(px, cy + 178, 196 if i == 0 else 150, 42, SURFACE, r=21, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
        b.append(texte(px + (98 if i == 0 else 75), cy + 205, lab, T_LABEL, BODY, INK, gras=700, ancre="middle"))
    b.append(bloc(cx + 388, cy + 178, 0, 0, BG, r=0))
    b.append(bloc(cx + 24, cy + 234, L - 48, 218, NEON, r=16, cerne=TILE_INK, epaisseur=3, ombre=7))
    b.append(icone("spade", cx + 46, cy + 256, 46))
    b.append(texte(cx + 46, cy + 356, "LE COUPE-GORGE", 32, DISPLAY, TILE_INK))
    b.append(texte(cx + 46, cy + 382, "52 cartes - 4 regles - 0 pitie.", T_LABEL, BODY, TILE_INK, gras=700))
    b.append(bloc(cx + 46, cy + 398, 122, 40, TILE_INK, r=20))
    b.append(texte(cx + 107, cy + 424, "JOUER", T_LABEL, DISPLAY, JAUNE, ancre="middle"))
    b.append(texte(cx + 192, cy + 424, "Regles", T_LABEL, BODY, TILE_INK, gras=700))
    for i, (titre, ic, couleur) in enumerate(MODES):
        px, py = cx + 24 + (i % 2) * 192, cy + 470 + (i // 2) * 106
        b.append(bloc(px, py, 180, 94, couleur, r=14, cerne=TILE_INK, epaisseur=3, ombre=5))
        b.append(icone(ic, px + 14, py + 12, 30))
        b.append(bloc(px + 138, py + 10, 30, 30, CARD_FACE, r=15, cerne=TILE_INK, epaisseur=2))
        b.append(texte(px + 153, py + 31, "?", T_LABEL, DISPLAY, TILE_INK, ancre="middle"))
        b.append(texte(px + 14, py + 72, titre.upper()[:15], 15, DISPLAY, TILE_INK))
    b.append(bloc(cx + 24, cy + 890, L - 48, 0, BG, r=0))
    b.append(texte(cx + L / 2, cy + 878, "Jouez responsable : Bacchana veille sur sa tablee.", T_MICRO, BODY, INK2, ancre="middle"))
    ecran(s, "Hub", cx, cy, "\n      ".join(b))


def options_borderland(s, cx, cy):
    b = [f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="{TILE_INK}" opacity="0.6"/>',
         bloc(cx, cy + 250, L, H - 250, BG, r=24, cerne=INK, epaisseur=3),
         f'<rect x="{cx + L / 2 - 30}" y="{cy + 268}" width="60" height="6" rx="3" fill="{INK3}"/>',
         texte(cx + 28, cy + 316, "LE COUPE-GORGE - OPTIONS", T_SOUS, DISPLAY, INK),
         texte(cx + 28, cy + 356, "Nombre de paquets", T_LABEL, BODY, INK, gras=700)]
    for i in range(3):
        px, actif = cx + 28 + i * 126, i == 0
        b.append(bloc(px, cy + 368, 114, 48, JAUNE if actif else SURFACE, r=10,
                      cerne=TILE_INK if actif else INK, epaisseur=2, ombre=3 if actif else 0))
        b.append(texte(px + 57, cy + 398, f"{i + 1} ({52 * (i + 1)})", T_LABEL, BODY,
                       TILE_INK if actif else INK, gras=700, ancre="middle"))
    b.append(bloc(cx + 22, cy + 434, L - 44, 174, SURFACE_HAUT, r=14, cerne=NEON, epaisseur=3))
    b.append(puce(cx + 38, cy + 448, "NOUVEAU", NEON))
    b.append(texte(cx + 38, cy + 512, "Nombre de trefles", T_CORPS, BODY, INK, gras=700))
    b.append(paragraphe(cx + 38, cy + 534, ["Le trefle porte Le Guess, la seule regle a phase",
                                            "cachee : ce nombre regle la frequence du Guess."], T_MICRO))
    for i, v in enumerate(["0", "4", "8", "13"]):
        px, actif = cx + 38 + i * 90, v == "13"
        b.append(bloc(px, cy + 566, 78, 34, LIME if actif else SURFACE, r=9,
                      cerne=TILE_INK if actif else INK, epaisseur=2, ombre=3 if actif else 0))
        b.append(texte(px + 39, cy + 589, v, T_LABEL, BODY, TILE_INK if actif else INK, gras=700, ancre="middle"))
    b.append(bloc(cx + 28, cy + 624, L - 56, 52, SURFACE, r=10, cerne=INK, epaisseur=2))
    b.append(texte(cx + 46, cy + 656, "Jokers (2 par paquet)", T_LABEL, BODY, INK, gras=700))
    b.append(bloc(cx + 320, cy + 634, 56, 32, LIME, r=16, cerne=TILE_INK, epaisseur=2))
    b.append(bloc(cx + 28, cy + 686, L - 56, 52, SURFACE, r=10, cerne=INK, epaisseur=2))
    b.append(texte(cx + 46, cy + 718, "Cartes aleatoires a l'infini", T_LABEL, BODY, INK, gras=700))
    b.append(puce(cx + 300, cy + 696, "PREMIUM", PREMIUM, CARD_FACE, T_MICRO - 1, 28))
    b.append(texte(cx + 28, cy + 772, "Composition du paquet", T_LABEL, BODY, INK, gras=700))
    for i, (nom, sym, roug) in enumerate([("Le Guess", "♣", False), ("L'Action", "♦", True),
                                          ("La Question", "♥", True), ("La Contrainte", "♠", False)]):
        px, py = cx + 28 + (i % 2) * 188, cy + 786 + (i // 2) * 48
        b.append(bloc(px, py, 176, 40, SURFACE, r=10, cerne=INK, epaisseur=2))
        b.append(texte(px + 14, py + 27, sym, 16, BODY, DANGER if roug else INK))
        b.append(texte(px + 36, py + 27, nom, T_MICRO, BODY, INK, gras=700))
    b.append(bouton(cx + 28, cy + 878, L - 56, "C'EST PARTI !", True, 54, 18))
    ecran(s, "Options du Coupe-Gorge", cx, cy, "\n      ".join(b))


def pioche(s, cx, cy):
    b = [texte(cx + L / 2, cy + 96, "ADAM", 32, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 122, "C'est ton tour de distribuer", T_LABEL, BODY, INK2, ancre="middle"),
         bloc(cx + 30, cy + 144, 296, 8, SURFACE, r=4, cerne=INK, epaisseur=1),
         bloc(cx + 336, cy + 134, 74, 30, SURFACE, r=15, cerne=INK, epaisseur=2),
         texte(cx + 373, cy + 154, "54 / 54", T_MICRO, BODY, INK, gras=700, ancre="middle")]
    # Pioche : trois dos en eventail, exactement comme dans GameBoard.
    for i, (rot, dx) in enumerate([(-7, 10), (-3, 4), (0, 0)]):
        b.append(f'<g transform="rotate({rot} {cx + 215} {cy + 430})">')
        b.append(dos_carte(cx + 143 + dx, cy + 320, 144, 212))
        b.append('</g>')
    b.append(bloc(cx + 178, cy + 500, 74, 30, CARD_FACE, r=15, cerne=TILE_INK, epaisseur=2))
    b.append(texte(cx + 215, cy + 521, "54", T_LABEL, BODY, TILE_INK, gras=700, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 610, "TOUCHE LE PAQUET POUR TIRER", 20, DISPLAY, INK, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 638, "Adam, la table t'attend", T_LABEL, BODY, INK2, ancre="middle"))
    ecran(s, "Coupe-Gorge - la pioche", cx, cy, "\n      ".join(b))


def trefle_cache(s, cx, cy):
    b = [texte(cx + L / 2, cy + 96, "ADAM", 32, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 122, "C'est ton tour de distribuer", T_LABEL, BODY, INK2, ancre="middle"),
         bloc(cx + 30, cy + 144, 296, 8, SURFACE, r=4, cerne=INK, epaisseur=1),
         bloc(cx + 336, cy + 134, 74, 30, SURFACE, r=15, cerne=INK, epaisseur=2),
         texte(cx + 373, cy + 154, "53 / 54", T_MICRO, BODY, INK, gras=700, ancre="middle"),
         dos_carte(cx + 143, cy + 240, 144, 212),
         bloc(cx + 34, cy + 500, 362, 148, JAUNE, r=14, cerne=TILE_INK, epaisseur=3, ombre=6),
         texte(cx + 215, cy + 542, "TREFLE - LE GUESS", 24, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + 215, cy + 578, ["Fais deviner sa valeur exacte a la",
                                         "table avant de la retourner."],
                    T_CORPS, TILE_INK, 24, "middle"),
         texte(cx + 215, cy + 630, "Juste : tu distribues. Faux : il prend.", T_MICRO, BODY, TILE_INK, ancre="middle"),
         bloc(cx + 84, cy + 690, 262, 54, TILE_INK, r=27),
         texte(cx + 215, cy + 725, "TOUCHER POUR REVELER", T_LABEL, DISPLAY, JAUNE, ancre="middle"),
         paragraphe(cx + L / 2, cy + 800, ["Seul le trefle arrive face cachee : sa regle est la",
                                           "seule qui exige de deviner AVANT le retournement.",
                                           "Les trois autres enseignes sont revelees d'emblee."],
                    T_MICRO, INK3, 17, "middle")]
    ecran(s, "Coupe-Gorge - trefle cache", cx, cy, "\n      ".join(b))


def carte_revelee(s, cx, cy):
    b = [texte(cx + L / 2, cy + 96, "NAWEL", 32, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 122, "C'est ton tour de distribuer", T_LABEL, BODY, INK2, ancre="middle"),
         bloc(cx + 30, cy + 144, 296, 8, SURFACE, r=4, cerne=INK, epaisseur=1),
         bloc(cx + 143, cy + 190, 144, 212, CARD_FACE, r=12, cerne=TILE_INK, epaisseur=3, ombre=6),
         texte(cx + 160, cy + 226, "7", 26, DISPLAY, CARD_RED),
         texte(cx + 160, cy + 248, "♥", 16, BODY, CARD_RED),
         texte(cx + 215, cy + 316, "♥", 62, BODY, CARD_RED, ancre="middle"),
         texte(cx + 270, cy + 380, "7", 26, DISPLAY, CARD_RED, ancre="middle"),
         bloc(cx + 34, cy + 436, 362, 190, SURFACE_HAUT, r=14, cerne=INK, epaisseur=3, ombre=6, ombre_couleur=INK),
         texte(cx + 215, cy + 484, "LA QUESTION", 28, DISPLAY, INK, ancre="middle"),
         f'<line x1="{cx + 66}" y1="{cy + 504}" x2="{cx + 364}" y2="{cy + 504}" stroke="{INK}" stroke-width="2"/>',
         paragraphe(cx + 215, cy + 540, ["Pose une question au joueur", "de ton choix."],
                    T_CORPS, INK2, 24, "middle"),
         texte(cx + 215, cy + 600, "VALEUR", T_MICRO, BODY, INK3, ancre="middle", espacement=1.5),
         puce(cx + 158, cy + 566, "7 GORGEES", JAUNE),
         bouton(cx + 34, cy + 664, 176, "CONTESTER", False, 58, 17),
         bouton(cx + 220, cy + 664, 176, "TOUR SUIVANT", True, 58, 17)]
    ecran(s, "Coupe-Gorge - carte revelee", cx, cy, "\n      ".join(b))


def contestation(s, cx, cy):
    b = [f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="{TILE_INK}" opacity="0.8"/>',
         bloc(cx + 28, cy + 240, L - 56, 452, SURFACE_HAUT, r=18, cerne=NEON, epaisseur=3, ombre=7, ombre_couleur=INK),
         puce(cx + L / 2 - 52, cy + 224, "NIVEAU 2/3", NEON),
         texte(cx + L / 2, cy + 320, "CONTESTATION", 30, DISPLAY, INK, ancre="middle"),
         texte(cx + 96, cy + 372, "ATTAQUANT", T_MICRO, BODY, INK3, ancre="middle", espacement=1.2),
         texte(cx + 96, cy + 400, "Nawel", 20, DISPLAY, INK, ancre="middle"),
         texte(cx + L / 2, cy + 396, "VS", 24, DISPLAY, NEON, ancre="middle"),
         texte(cx + 334, cy + 372, "DEFIE", T_MICRO, BODY, INK3, ancre="middle", espacement=1.2),
         texte(cx + 334, cy + 400, "Adam", 20, DISPLAY, INK, ancre="middle"),
         texte(cx + L / 2, cy + 500, "14", 74, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 530, "GORGEES", T_LABEL, DISPLAY, INK, ancre="middle", espacement=2),
         texte(cx + L / 2, cy + 566, "Multiplicateur actuel : x2", T_LABEL, BODY, INK2, ancre="middle"),
         bouton(cx + 56, cy + 596, L - 112, "ESCALADER (X4)", True, 56, 17),
         texte(cx + L / 2, cy + 676, "Qui perd la contestation ?", T_LABEL, BODY, INK2, ancre="middle"),
         bouton(cx + 56, cy + 704, 148, "NAWEL", False, 50, 15),
         bouton(cx + 226, cy + 704, 148, "ADAM", False, 50, 15)]
    ecran(s, "Contestation", cx, cy, "\n      ".join(b))


def ticket(s, cx, cy):
    """Le recapitulatif est un TICKET DE CAISSE : papier creme fixe, bords crantes,
    legere rotation. Ce n'est pas une carte de l'interface, c'est un objet."""
    tx, ty, tw, th = cx + 42, cy + 96, 346, 560
    crans = "".join(f'<circle cx="{tx + 12 + i * 22}" cy="{ty}" r="7" fill="{BG}"/>' for i in range(16))
    crans_bas = "".join(f'<circle cx="{tx + 12 + i * 22}" cy="{ty + th}" r="7" fill="{BG}"/>' for i in range(16))
    b = [f'<g transform="rotate(-1.2 {tx + tw / 2} {ty + th / 2})">',
         f'<rect x="{tx + 6}" y="{ty + 6}" width="{tw}" height="{th}" fill="{TILE_INK}"/>',
         f'<rect x="{tx}" y="{ty}" width="{tw}" height="{th}" fill="#FBF7EE" stroke="{TILE_INK}" stroke-width="2"/>',
         crans, crans_bas,
         texte(tx + tw / 2, ty + 60, "BACCHANA", 30, DISPLAY, "#1c1a17", ancre="middle"),
         texte(tx + tw / 2, ty + 84, "Au coin du comptoir - Chevilly-Larue", T_MICRO, BODY, "#6b6357", ancre="middle"),
         texte(tx + tw / 2, ty + 102, "bacchana.beloucif.com", T_MICRO - 1, BODY, "#6b6357", ancre="middle"),
         f'<line x1="{tx + 24}" y1="{ty + 124}" x2="{tx + tw - 24}" y2="{ty + 124}" stroke="#b9b0a2" stroke-width="2" stroke-dasharray="5 5"/>',
         texte(tx + 24, ty + 152, "Article", T_LABEL, BODY, "#6b6357", gras=700),
         texte(tx + tw - 24, ty + 152, "Penalites", T_LABEL, BODY, "#6b6357", gras=700, ancre="end")]
    for i, (nom, n) in enumerate([("Adam", "23"), ("Nawel", "17"), ("Emilien", "11")]):
        yy = ty + 186 + i * 34
        b.append(texte(tx + 24, yy, nom, T_CORPS, BODY, "#1c1a17"))
        b.append(texte(tx + tw - 24, yy, n, T_CORPS, BODY, "#1c1a17", ancre="end"))
    b.append(f'<line x1="{tx + 24}" y1="{ty + 308}" x2="{tx + tw - 24}" y2="{ty + 308}" stroke="#b9b0a2" stroke-width="2" stroke-dasharray="5 5"/>')
    b.append(texte(tx + 24, ty + 338, "Total", 19, DISPLAY, "#1c1a17"))
    b.append(texte(tx + tw - 24, ty + 338, "51", 19, DISPLAY, "#1c1a17", ancre="end"))
    b.append(texte(tx + 24, ty + 362, "dont 3 penalites majeures", T_MICRO, BODY, "#6b6357"))
    b.append(texte(tx + tw / 2, ty + 412, "Adam est elu", T_LABEL, BODY, "#1c1a17", ancre="middle"))
    b.append(texte(tx + tw / 2, ty + 440, "CHAMPION DE LA TABLEE", 18, DISPLAY, "#1c1a17", ancre="middle"))
    b.append(texte(tx + tw / 2, ty + 470, "Ici, tout le monde regle l'addition.", T_MICRO, BODY, "#6b6357", ancre="middle"))
    for i in range(38):
        w = 2 if i % 3 else 4
        b.append(f'<rect x="{tx + 40 + i * 7}" y="{ty + 492}" width="{w}" height="34" fill="#1c1a17"/>')
    b.append(texte(tx + tw / 2, ty + 546, "MERCI DE VOTRE VISITE", T_MICRO, BODY, "#6b6357", ancre="middle", espacement=1.5))
    b.append('</g>')
    b.append(bouton(cx + 42, cy + 688, 346, "PARTAGER", False, 52, 16))
    b.append(bouton(cx + 42, cy + 752, 346, "REVANCHE", True, 52, 16))
    b.append(texte(cx + L / 2, cy + 840, "Retour a l'accueil", T_LABEL, BODY, INK2, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 876, "Jouez responsable : Bacchana veille sur sa tablee.", T_MICRO, BODY, INK3, ancre="middle"))
    ecran(s, "Fin de partie - l'addition", cx, cy, "\n      ".join(b))


def galerie(s, cx, cy):
    b = [texte(cx + 30, cy + 100, "GALERIE DES 52 CARTES", 24, DISPLAY, INK)]
    for r in range(4):
        for c in range(4):
            px, py = cx + 26 + c * 98, cy + 132 + r * 152
            rouge = r in (1, 2)
            b.append(bloc(px, py, 86, 128, CARD_FACE, r=10, cerne=TILE_INK, epaisseur=3, ombre=4))
            b.append(texte(px + 12, py + 30, ["A", "7", "10", "K"][c], 20, DISPLAY, CARD_RED if rouge else TILE_INK))
            b.append(texte(px + 43, py + 84, ["♠", "♥", "♦", "♣"][r], 32, BODY,
                           CARD_RED if rouge else TILE_INK, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 800, "Ecran de controle design, accessible via /?cards", T_MICRO, BODY, INK3, ancre="middle"))
    ecran(s, "Galerie des cartes", cx, cy, "\n      ".join(b))


ECRANS_1 = [onboarding, accueil, hub, options_borderland, pioche,
            trefle_cache, carte_revelee, contestation, ticket, galerie]
