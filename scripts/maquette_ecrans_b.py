# -*- coding: utf-8 -*-
"""Maquette Bacchus, seconde moitie des surfaces.

Modes restants, reglages, regles, premium et surfaces legales.
"""
from maquette_core import (BG, BG_HAUT, BLEU, BODY, CARD_FACE, CARD_RED, DANGER, DEPTH,
                           DISPLAY, H, INK, INK2, INK3, JAUNE, L, LIME, NEON, ORANGE_INK,
                           ROSE, SUCCES, SURFACE, SURFACE_HAUT, TILE_INK, PREMIUM,
                           bloc, bouton, ecran, entete, icone, paragraphe, texte)

# Aplats de la roue : quatre teintes figees hors theme, comme une piece de jeu.
ROUE = ['#FF8A3D', '#FFD029', '#9BE94C', '#6E9BFF']


def criee(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "LA CRIEE", 26, DISPLAY, NEON, ancre="middle"),
         bloc(cx + 24, cy + 100, L - 48, 130, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
         paragraphe(cx + L / 2, cy + 152, ["Combien de gorgees tiens-tu", "avant de craquer ?"],
                    16, TILE_INK, 26, "middle"),
         texte(cx + L / 2, cy + 214, "SURENCHERIS OU CRIE « TU MENS »", 10, BODY, INK3, ancre="middle", espacement=1),
         bloc(cx + 24, cy + 260, L - 48, 120, LIME, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
         texte(cx + L / 2, cy + 320, "7", 54, DISPLAY, TILE_INK, ancre="middle"),
         texte(cx + L / 2, cy + 352, "enchere de Nawel", 12, BODY, TILE_INK, ancre="middle"),
         bloc(cx + 24, cy + 412, 178, 60, JAUNE, r=12, cerne=TILE_INK, epaisseur=3, ombre=4),
         texte(cx + 113, cy + 450, "+1", 24, DISPLAY, TILE_INK, ancre="middle"),
         bloc(cx + 228, cy + 412, 178, 60, JAUNE, r=12, cerne=TILE_INK, epaisseur=3, ombre=4),
         texte(cx + 317, cy + 450, "+3", 24, DISPLAY, TILE_INK, ancre="middle"),
         bouton(cx + 24, cy + 500, L - 48, "TU MENS", True, 64, 22),
         texte(cx + L / 2, cy + 600, "Si Nawel tient, tu bois son enchere.", 11, BODY, INK2, ancre="middle"),
         texte(cx + L / 2, cy + 620, "Sinon, elle boit la sienne.", 11, BODY, INK2, ancre="middle")]
    ecran(s, "La Criee", cx, cy, "\n      ".join(b))


def gage(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "ACTION OU VERITE", 24, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 100, "Au tour d'Amina", 12, BODY, INK2, ancre="middle"),
         bloc(cx + 24, cy + 200, L - 48, 300, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
         bloc(cx + 46, cy + 224, 96, 28, ROSE, r=14, cerne=TILE_INK, epaisseur=2),
         texte(cx + 94, cy + 243, "ACTION", 11, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 320, ["Imite quelqu'un de la tablee", "jusqu'a ce qu'on devine qui."],
                    17, TILE_INK, 28, "middle"),
         texte(cx + L / 2, cy + 448, "Rate : 3 gorgees", 12, BODY, INK3, ancre="middle"),
         bouton(cx + 24, cy + 560, 190, "VERITE", False, 60, 18),
         bouton(cx + 216, cy + 560, 190, "ACTION", True, 60, 18),
         bouton(cx + 24, cy + 648, L - 48, "SUIVANT", False, 54, 16),
         texte(cx + L / 2, cy + 760, "Pack : Classique  -  42 cartes restantes", 11, BODY, INK2, ancre="middle")]
    ecran(s, "Action ou verite", cx, cy, "\n      ".join(b))


def tu_preferes(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "TU PREFERES", 26, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 100, "La minorite prend la penalite", 11, BODY, INK2, ancre="middle"),
         bloc(cx + 24, cy + 140, L - 48, 190, BLEU, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
         texte(cx + 48, cy + 178, "A", 22, DISPLAY, TILE_INK),
         paragraphe(cx + 48, cy + 216, ["Ne plus jamais revoir", "de series"], 17, TILE_INK, 26),
         bloc(cx + 24, cy + 350, L - 48, 190, ROSE, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
         texte(cx + 48, cy + 388, "B", 22, DISPLAY, TILE_INK),
         paragraphe(cx + 48, cy + 426, ["Ne plus jamais ecouter", "de musique"], 17, TILE_INK, 26),
         texte(cx + L / 2, cy + 588, "RESULTAT", 14, DISPLAY, INK, ancre="middle", espacement=1)]
    for i, (lettre, n, couleur, minorite) in enumerate([("A", "3", BLEU, False), ("B", "1", CARD_RED, True)]):
        px = cx + 24 + i * 192
        b.append(bloc(px, cy + 606, 180, 84, couleur, r=12, cerne=TILE_INK, epaisseur=3,
                      ombre=4, opacite=0.35 if minorite else None))
        b.append(texte(px + 90, cy + 650, n, 26, DISPLAY, TILE_INK, ancre="middle"))
        b.append(texte(px + 90, cy + 674, lettre, 12, BODY, TILE_INK, ancre="middle"))
    b.append(bloc(cx + 130, cy + 706, 170, 30, CARD_RED, r=15, cerne=TILE_INK, epaisseur=2, opacite=0.35))
    b.append(texte(cx + 215, cy + 727, "MINORITE : B BOIT", 11, DISPLAY, TILE_INK, ancre="middle"))
    b.append(bouton(cx + 24, cy + 792, L - 48, "QUESTION SUIVANTE", True, 56, 16))
    ecran(s, "Tu preferes", cx, cy, "\n      ".join(b))


def roulette(s, cx, cy):
    cxr, cyr, r = cx + L / 2, cy + 340, 150
    b = [texte(cx + L / 2, cy + 74, "LA ROUE DU DESTIN", 24, DISPLAY, NEON, ancre="middle"),
         texte(cx + L / 2, cy + 100, "Fais-la tourner, assume le sort", 11, BODY, INK2, ancre="middle")]
    # Secteurs : huit parts, quatre teintes, aucun libelle.
    import math
    for i in range(8):
        a0, a1 = math.radians(i * 45 - 90), math.radians((i + 1) * 45 - 90)
        x0, y0 = cxr + r * math.cos(a0), cyr + r * math.sin(a0)
        x1, y1 = cxr + r * math.cos(a1), cyr + r * math.sin(a1)
        b.append(f'<path d="M{cxr} {cyr} L{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f} Z" '
                 f'fill="{ROUE[i % 4]}" stroke="{TILE_INK}" stroke-width="3"/>')
    b.append(f'<circle cx="{cxr}" cy="{cyr}" r="{r}" fill="none" stroke="{TILE_INK}" stroke-width="5"/>')
    b.append(f'<circle cx="{cxr}" cy="{cyr}" r="26" fill="{CARD_FACE}" stroke="{TILE_INK}" stroke-width="4"/>')
    b.append(f'<path d="M{cxr - 14} {cyr - r - 22} L{cxr + 14} {cyr - r - 22} L{cxr} {cyr - r + 4} Z" fill="{INK}"/>')
    b.append(paragraphe(cx + L / 2, cy + 528, ["Les secteurs ne portent plus de libelle : a huit parts,",
                                               "les textes debordaient sur leurs voisins."], 10, INK3, 16, "middle"))
    b.append(bloc(cx + 40, cy + 568, 350, 116, CARD_FACE, r=14, cerne=TILE_INK, epaisseur=3, ombre=6))
    b.append(texte(cx + 215, cy + 616, "CUL SEC", 28, DISPLAY, CARD_RED, ancre="middle"))
    b.append(texte(cx + 215, cy + 648, "Adam vide son verre. Sans discuter.", 12, BODY, TILE_INK, ancre="middle"))
    b.append(bouton(cx + 40, cy + 720, 350, "RELANCER LA ROUE", True, 60, 18))
    ecran(s, "La Roue du Destin", cx, cy, "\n      ".join(b))


def pilori(s, cx, cy):
    b = [texte(cx + L / 2, cy + 74, "LE PILORI", 28, DISPLAY, NEON, ancre="middle"),
         bloc(cx + 24, cy + 120, L - 48, 200, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
         icone("gavel", cx + L / 2 - 20, cy + 146, 40),
         paragraphe(cx + L / 2, cy + 232, ["Accuse d'avoir regarde son",
                                           "telephone pendant trois tours."], 15, TILE_INK, 24, "middle"),
         texte(cx + L / 2, cy + 296, "ACCUSATION ANONYME DE LA TABLE", 9, BODY, INK3, ancre="middle", espacement=1.5)]
    for i, (lab, n) in enumerate([("Coupable", "3"), ("Non coupable", "1")]):
        px = cx + 24 + i * 192
        b.append(bloc(px, cy + 350, 180, 82, SURFACE, r=12, cerne=INK, epaisseur=3, ombre=4, ombre_couleur=INK))
        b.append(texte(px + 90, cy + 392, n, 25, DISPLAY, INK, ancre="middle"))
        b.append(texte(px + 90, cy + 416, lab.upper(), 10, BODY, INK2, ancre="middle", espacement=1))
    b.append(bloc(cx + 40, cy + 462, 350, 96, SURFACE_HAUT, r=14, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK))
    b.append(icone("gavel", cx + 92, cy + 490, 32))
    b.append(texte(cx + 244, cy + 518, "COUPABLE", 27, DISPLAY, NEON, ancre="middle"))
    b.append(texte(cx + 215, cy + 542, "1 penalite", 12, BODY, INK2, ancre="middle"))
    b.append(paragraphe(cx + L / 2, cy + 592, ["Le verdict est double par la FORME.",
                                               "Orange contre vert est le couple que la",
                                               "protanopie confond le plus."], 10, INK3, 16, "middle"))
    b.append(bouton(cx + 40, cy + 680, 350, "AFFAIRE SUIVANTE", True, 58, 17))
    ecran(s, "Le Pilori - verdict", cx, cy, "\n      ".join(b))


def mes_regles(s, cx, cy):
    b = [entete(cx, cy, "MES REGLES"),
         texte(cx + 28, cy + 100, "Ecrites une fois, gardees sur l'appareil.", 11, BODY, INK2),
         bloc(cx + 24, cy + 118, L - 48, 146, SURFACE, r=14, cerne=INK, epaisseur=3, ombre=4, ombre_couleur=INK),
         texte(cx + 44, cy + 148, "Intitule", 10, BODY, INK2),
         bloc(cx + 44, cy + 158, L - 88, 42, SURFACE_HAUT, r=10, cerne=INK, epaisseur=2),
         texte(cx + 60, cy + 185, "Le dernier a trinquer boit double", 12, BODY, INK),
         texte(cx + 44, cy + 224, "Mode concerne", 10, BODY, INK2),
         bloc(cx + 44, cy + 232, 128, 28, LIME, r=14, cerne=TILE_INK, epaisseur=2),
         texte(cx + 108, cy + 251, "Le Coupe-Gorge", 10, BODY, TILE_INK, gras=700, ancre="middle"),
         bloc(cx + 24, cy + 282, L - 48, 172, SURFACE_HAUT, r=14, cerne=NEON, epaisseur=3),
         bloc(cx + 40, cy + 296, 86, 24, NEON, r=12, cerne=TILE_INK, epaisseur=2),
         texte(cx + 83, cy + 313, "NOUVEAU", 10, DISPLAY, TILE_INK, ancre="middle"),
         # Case VIDE : jamais pre-cochee, regle anti dark-pattern.
         bloc(cx + 40, cy + 336, 28, 28, SURFACE, r=7, cerne=INK, epaisseur=3),
         texte(cx + 82, cy + 356, "Partager cette regle", 14, BODY, INK, gras=700),
         paragraphe(cx + 40, cy + 388, ["Decochee par defaut. Sans ton accord, la regle ne",
                                        "quitte jamais l'appareil - c'est le fonctionnement",
                                        "normal de l'application."]),
         texte(cx + 40, cy + 440, "Cochee, elle est envoyee pour nourrir les packs.", 11, BODY, ORANGE_INK, gras=700),
         texte(cx + 28, cy + 496, "MES REGLES ENREGISTREES", 14, DISPLAY, INK, espacement=1)]
    for i, (nom, mode, partagee) in enumerate([
            ("Le dernier a trinquer boit double", "Coupe-Gorge", False),
            ("Interdiction de dire un prenom", "Je n'ai jamais", True),
            ("Celui qui rit distribue", "Action ou verite", False)]):
        py = cy + 516 + i * 74
        b.append(bloc(cx + 24, py, L - 48, 62, SURFACE, r=12, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
        b.append(texte(cx + 44, py + 27, nom, 12, BODY, INK, gras=700))
        b.append(texte(cx + 44, py + 46, mode, 10, BODY, INK2))
        if partagee:
            b.append(bloc(cx + 296, py + 17, 84, 26, LIME, r=13, cerne=TILE_INK, epaisseur=2))
            b.append(texte(cx + 338, py + 35, "PARTAGEE", 9, DISPLAY, TILE_INK, ancre="middle"))
    b.append(bouton(cx + 24, cy + 780, L - 48, "AJOUTER UNE REGLE", True, 58, 17))
    ecran(s, "Mes regles et partage", cx, cy, "\n      ".join(b))


def reglages(s, cx, cy):
    b = [entete(cx, cy, "REGLAGES")]
    y = cy + 100
    for titre, lignes in [
        ("Apparence", [("Theme", "Sombre", True), ("Themes personnalises", "Premium", False)]),
        ("Jeu", [("Vibrations", "Actives", True), ("Penalites", "Gorgees", False)]),
        ("Confidentialite", [("Mesure d'audience", "Refusee", True), ("Mes donnees", "Exporter", False)]),
    ]:
        b.append(texte(cx + 28, y + 18, titre.upper(), 13, DISPLAY, INK, espacement=1))
        for j, (lab, val, interrupteur) in enumerate(lignes):
            py = y + 30 + j * 66
            b.append(bloc(cx + 24, py, L - 48, 56, SURFACE, r=12, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
            b.append(texte(cx + 44, py + 34, lab, 13, BODY, INK, gras=700))
            if interrupteur:
                b.append(bloc(cx + 322, py + 14, 60, 28, LIME, r=14, cerne=TILE_INK, epaisseur=2))
                b.append(f'<circle cx="{cx + 368}" cy="{py + 28}" r="10" fill="{CARD_FACE}" stroke="{TILE_INK}" stroke-width="2"/>')
            else:
                b.append(texte(cx + L - 44, py + 34, val, 12, BODY, ORANGE_INK, gras=700, ancre="end"))
        y += 30 + len(lignes) * 66 + 22
    b.append(bloc(cx + 24, cy + 640, L - 48, 82, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 44, cy + 672, "Bacchus 0.40.3", 13, BODY, INK, gras=700))
    b.append(texte(cx + 44, cy + 696, "Edite par BLF Lab's - Icones par Icons8", 10, BODY, INK2))
    b.append(bouton(cx + 24, cy + 752, L - 48, "MENTIONS LEGALES", False, 52, 15))
    b.append(bouton(cx + 24, cy + 820, L - 48, "REINITIALISER", False, 52, 15))
    ecran(s, "Reglages", cx, cy, "\n      ".join(b))


def regles_mode(s, cx, cy):
    b = [entete(cx, cy, "REGLES DU MODE"),
         bloc(cx + 24, cy + 100, L - 48, 96, NEON, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
         icone("spade", cx + 44, cy + 124, 36),
         texte(cx + 96, cy + 152, "LE COUPE-GORGE", 24, DISPLAY, TILE_INK),
         texte(cx + 96, cy + 174, "2 joueurs minimum", 11, BODY, TILE_INK, gras=700)]
    etapes = [
        ("1", "Le trefle arrive face cachee. Fais deviner sa valeur avant de retourner."),
        ("2", "Les autres enseignes sont revelees d'emblee et donnent leur regle."),
        ("3", "L'As vaut un cul sec, tout le reste se compte en gorgees."),
        ("4", "Conteste pour doubler la mise. Le perdant boit tout."),
    ]
    for i, (n, txt) in enumerate(etapes):
        py = cy + 226 + i * 104
        b.append(bloc(cx + 24, py, L - 48, 88, SURFACE, r=12, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
        b.append(bloc(cx + 44, py + 26, 34, 34, JAUNE, r=17, cerne=TILE_INK, epaisseur=2))
        b.append(texte(cx + 61, py + 49, n, 15, DISPLAY, TILE_INK, ancre="middle"))
        b.append(paragraphe(cx + 92, py + 36, [txt[:40], txt[40:]], 12, INK, 20))
    b.append(bouton(cx + 24, cy + 690, L - 48, "COMPRIS", True))
    ecran(s, "Regles d'un mode", cx, cy, "\n      ".join(b))


def paywall(s, cx, cy):
    b = [f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="34" fill="{TILE_INK}" opacity="0.78"/>',
         f'<circle cx="{cx + L / 2}" cy="{cy + 430}" r="168" fill="{DEPTH}" opacity="0.34"/>',
         bloc(cx + 30, cy + 200, L - 60, 476, SURFACE_HAUT, r=18, cerne=INK, epaisseur=3, ombre=6, ombre_couleur=INK),
         bloc(cx + L / 2 - 34, cy + 236, 68, 68, DEPTH, r=16, cerne=TILE_INK, epaisseur=3),
         texte(cx + L / 2, cy + 348, "BACCHUS PREMIUM", 26, DISPLAY, INK, ancre="middle"),
         texte(cx + L / 2, cy + 376, "Un seul paiement. A vie. Sans abonnement.", 11, BODY, INK2, ancre="middle")]
    for i, ligne in enumerate(["Tous les packs premium", "Mode aleatoire infini",
                               "Themes personnalises", "Nouveaux modes inclus"]):
        yy = cy + 412 + i * 38
        b.append(bloc(cx + 60, yy, 22, 22, LIME, r=6, cerne=TILE_INK, epaisseur=2))
        b.append(texte(cx + 96, yy + 17, ligne, 13, BODY, INK))
    b.append(bouton(cx + 60, cy + 580, L - 120, "DEBLOQUER - 14,99 EUR", True, 64, 19))
    b.append(texte(cx + L / 2, cy + 664, "Paiement via ton compte App Store ou Play Store", 10, BODY, INK2, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 712, "Restaurer un achat", 12, BODY, CARD_FACE, ancre="middle"))
    ecran(s, "Paywall premium", cx, cy, "\n      ".join(b))


def cookies(s, cx, cy):
    b = [texte(cx + L / 2, cy + 300, "BACCHUS", 46, DISPLAY, NEON, ancre="middle"),
         f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="34" fill="{TILE_INK}" opacity="0.55"/>',
         bloc(cx + 20, cy + 560, L - 40, 330, SURFACE_HAUT, r=18, cerne=INK, epaisseur=3, ombre=6, ombre_couleur=INK),
         texte(cx + 44, cy + 608, "COOKIES", 24, DISPLAY, INK),
         paragraphe(cx + 44, cy + 642, [
             "Bacchus utilise des traceurs pour mesurer",
             "l'audience et ameliorer l'experience de jeu.",
             "Vous pouvez accepter, refuser, ou personnaliser."], 12, INK2, 20),
         texte(cx + 44, cy + 712, "politique de confidentialite", 12, BODY, ORANGE_INK, gras=700),
         bouton(cx + 44, cy + 740, 160, "TOUT REFUSER", False, 50, 13),
         bouton(cx + 220, cy + 740, 166, "ACCEPTER", True, 50, 13),
         texte(cx + L / 2, cy + 828, "Personnaliser", 12, BODY, INK2, ancre="middle"),
         texte(cx + L / 2, cy + 862, "Le refus est aussi simple que l'acceptation.", 10, BODY, INK3, ancre="middle")]
    ecran(s, "Bandeau cookies", cx, cy, "\n      ".join(b))


def legal(s, cx, cy):
    b = [entete(cx, cy, "MENTIONS LEGALES")]
    sections = [
        ("Editeur", ["BLF Lab's - Adam Beloucif", "Micro-entreprise, France"]),
        ("Hebergeur", ["Vercel Inc.", "340 S Lemon Ave, Walnut, CA"]),
        ("Contact", ["contact@blflabs.com"]),
        ("Mediation", ["CM2C - 14 rue Saint Jean, Paris 17e"]),
        ("Credits", ["Icones par Icons8", "Polices Anton et Bricolage Grotesque"]),
    ]
    y = cy + 106
    for titre, lignes in sections:
        b.append(texte(cx + 28, y, titre, 15, BODY, INK, gras=700))
        b.append(paragraphe(cx + 28, y + 24, lignes, 12, INK2, 20))
        y += 34 + len(lignes) * 20 + 26
    b.append(bloc(cx + 24, y + 10, L - 48, 96, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 44, y + 44, "Donnees personnelles", 13, BODY, INK, gras=700))
    b.append(paragraphe(cx + 44, y + 68, ["Aucun compte. Les regles perso restent",
                                          "sur l'appareil sauf partage explicite."], 11, INK2, 17))
    b.append(bouton(cx + 24, cy + 800, L - 48, "CGU ET CGV", False, 52, 15))
    ecran(s, "Mentions legales", cx, cy, "\n      ".join(b))


ECRANS_B = [criee, gage, tu_preferes, roulette, pilori, mes_regles,
            reglages, regles_mode, paywall, cookies, legal]
