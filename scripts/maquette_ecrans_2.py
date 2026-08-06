# -*- coding: utf-8 -*-
"""Les douze modes de jeu. Copie et phases lues dans le code."""
from maquette_core import (BG, BG_HAUT, BLEU, BODY, CARD_FACE, CARD_RED, DANGER, DEPTH,
                           DISPLAY, H, INK, INK2, INK3, JAUNE, L, LIME, NEON, ORANGE_INK,
                           PREMIUM, ROSE, SUCCES, SURFACE, SURFACE_HAUT, TILE_INK,
                           T_CORPS, T_LABEL, T_MICRO, T_SOUS, T_TITRE,
                           bloc, bouton, ecran, entete, icone, paragraphe, puce, texte)

ROUE = ['#FF8A3D', '#FFD029', '#9BE94C', '#6E9BFF']


def _tete(cx, cy, titre, sous=None):
    out = [texte(cx + L / 2, cy + 96, titre, 26, DISPLAY, NEON, ancre="middle")]
    if sous:
        out.append(texte(cx + L / 2, cy + 122, sous, T_LABEL, BODY, INK2, ancre="middle"))
    return out


def quiz(s, cx, cy):
    b = _tete(cx, cy, "QUITTE OU DOUBLE", "C'est a Nawel de jouer")
    b += [puce(cx + 150, cy + 140, "CAGNOTTE : 6", JAUNE),
          bloc(cx + 26, cy + 196, L - 52, 288, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=7),
          puce(cx + 48, cy + 220, "CULTURE G", BLEU),
          puce(cx + 268, cy + 220, "3 POINTS", ROSE),
          paragraphe(cx + L / 2, cy + 316, ["Quelle est la capitale", "de l'Australie ?"],
                     21, TILE_INK, 32, "middle"),
          bloc(cx + 88, cy + 376, 254, 52, LIME, r=12, cerne=TILE_INK, epaisseur=3, ombre=4),
          texte(cx + 215, cy + 409, "VOIR LA REPONSE", T_LABEL, DISPLAY, TILE_INK, ancre="middle"),
          texte(cx + L / 2, cy + 462, "Canberra (et non Sydney)", T_CORPS, BODY, INK3, ancre="middle"),
          bloc(cx + 26, cy + 520, L - 52, 78, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2),
          texte(cx + 48, cy + 552, "Bien joue !", T_CORPS, BODY, INK, gras=700),
          paragraphe(cx + 48, cy + 574, ["Ta cagnotte monte a 6. Tu la laisses grossir…",
                                         "ou tu la distribues maintenant ?"], T_MICRO),
          bouton(cx + 26, cy + 640, 178, "RATE", False, 58, 17),
          bouton(cx + 226, cy + 640, 178, "BONNE REPONSE", True, 58, 15),
          bouton(cx + 26, cy + 724, L - 52, "JE DISTRIBUE MES 6 POINTS", False, 54, 15),
          bouton(cx + 26, cy + 792, L - 52, "JE CUMULE (QUITTE OU DOUBLE)", True, 54, 15)]
    ecran(s, "Quitte ou Double", cx, cy, "\n      ".join(b))


def classement_juge(s, cx, cy):
    b = _tete(cx, cy, "LE TABLEAU D'HONNEUR", "manche 2")
    b += [bloc(cx + 26, cy + 160, L - 52, 116, BLEU, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
          texte(cx + L / 2, cy + 204, "QUESTION SECRETE - CHUT !", 18, DISPLAY, TILE_INK, ancre="middle"),
          paragraphe(cx + L / 2, cy + 234, ["Du plus susceptible de devenir",
                                            "celebre au moins susceptible"], T_CORPS, TILE_INK, 22, "middle"),
          texte(cx + 28, cy + 320, "Tape tes potes dans l'ordre, du haut", T_LABEL, BODY, INK2),
          texte(cx + 28, cy + 340, "du podium vers le bas :", T_LABEL, BODY, INK2)]
    for i, (nom, pos) in enumerate([("Nawel", "1"), ("Adam", "2"), ("Emilien", None), ("Amina", None)]):
        py = cy + 366 + i * 74
        pris = pos is not None
        b.append(bloc(cx + 26, py, L - 52, 60, JAUNE if pris else SURFACE, r=12,
                      cerne=TILE_INK if pris else INK, epaisseur=3, ombre=4,
                      ombre_couleur=TILE_INK if pris else INK))
        b.append(bloc(cx + 46, py + 14, 32, 32, TILE_INK if pris else BG_HAUT, r=16,
                      cerne=TILE_INK if pris else INK, epaisseur=2))
        if pris:
            b.append(texte(cx + 62, py + 36, pos, T_LABEL, DISPLAY, JAUNE, ancre="middle"))
        b.append(texte(cx + 92, py + 38, nom, 17, BODY, TILE_INK if pris else INK, gras=700))
    b.append(bouton(cx + 26, cy + 792, L - 52, "VALIDER MON PODIUM", True, 58, 17))
    ecran(s, "Classement - le juge", cx, cy, "\n      ".join(b))


def classement_devine(s, cx, cy):
    b = _tete(cx, cy, "LE TABLEAU D'HONNEUR", "Le podium de Nawel")
    b += [bloc(cx + 26, cy + 156, L - 52, 176, SURFACE, r=14, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK)]
    for i, nom in enumerate(["Nawel", "Adam", "Emilien", "Amina"]):
        yy = cy + 190 + i * 36
        b.append(icone("medal", cx + 46, yy - 16, 22))
        b.append(texte(cx + 80, yy, f"{i + 1}. {nom}", T_CORPS, BODY, INK, gras=700 if i == 0 else None))
    b.append(paragraphe(cx + 28, cy + 366, ["Quelle question secrete a produit ce",
                                            "classement ? Mettez-vous d'accord :"], T_LABEL, INK2))
    for i, (q, bon) in enumerate([
            ("Du plus susceptible de devenir celebre", True),
            ("Du plus gros dormeur au plus matinal", False),
            ("Du plus bavard au plus discret", False),
            ("Du plus radin au plus genereux", False)]):
        py = cy + 410 + i * 82
        b.append(bloc(cx + 26, py, L - 52, 68, LIME if bon else SURFACE, r=12,
                      cerne=TILE_INK if bon else INK, epaisseur=3, ombre=4,
                      ombre_couleur=TILE_INK if bon else INK))
        b.append(paragraphe(cx + 46, py + 28, [q[:34], q[34:]] if len(q) > 34 else [q],
                            T_LABEL, TILE_INK if bon else INK, 18, gras=700))
    b.append(bloc(cx + 26, cy + 744, L - 52, 62, LIME, r=12, cerne=TILE_INK, epaisseur=3, ombre=4))
    b.append(texte(cx + L / 2, cy + 782, "TROUVE ! NAWEL PREND 3 PENALITES.", T_LABEL, DISPLAY, TILE_INK, ancre="middle"))
    b.append(bouton(cx + 26, cy + 822, L - 52, "MANCHE SUIVANTE", True, 54, 16))
    ecran(s, "Classement - on devine", cx, cy, "\n      ".join(b))


def criee(s, cx, cy):
    b = _tete(cx, cy, "LA CRIEE", "Thème de la tablee")
    b += [bloc(cx + 26, cy + 152, L - 52, 156, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
          icone("megaphone", cx + L / 2 - 20, cy + 176, 40),
          texte(cx + L / 2, cy + 250, "Des choses qu'on crie au comptoir…", 17, BODY, TILE_INK, gras=700, ancre="middle"),
          paragraphe(cx + L / 2, cy + 278, ["Annoncez a voix haute combien vous pouvez",
                                            "en citer en 1 minute."], T_MICRO, "#6b6357", 16, "middle"),
          bloc(cx + 26, cy + 336, L - 52, 132, LIME, r=14, cerne=TILE_INK, epaisseur=3, ombre=6),
          bloc(cx + 52, cy + 376, 56, 56, CARD_FACE, r=12, cerne=TILE_INK, epaisseur=3),
          texte(cx + 80, cy + 414, "-", 26, DISPLAY, TILE_INK, ancre="middle"),
          texte(cx + L / 2, cy + 424, "7", 62, DISPLAY, TILE_INK, ancre="middle"),
          bloc(cx + 322, cy + 376, 56, 56, CARD_FACE, r=12, cerne=TILE_INK, epaisseur=3),
          texte(cx + 350, cy + 414, "+", 26, DISPLAY, TILE_INK, ancre="middle"),
          texte(cx + L / 2, cy + 456, "enchere de Nawel", T_MICRO, BODY, TILE_INK, ancre="middle"),
          bouton(cx + 26, cy + 502, L - 52, "« TU MENS ! » - LANCER LE CHRONO", True, 64, 16),
          bouton(cx + 26, cy + 586, 178, "CHANGER DE THEME", False, 52, 13),
          bouton(cx + 226, cy + 586, 178, "MES THEMES", False, 52, 13),
          paragraphe(cx + L / 2, cy + 684, ["Surencherissez… ou criez « tu mens ! ».",
                                            "Si Nawel tient son pari, vous buvez."], T_LABEL, INK2, 20, "middle")]
    ecran(s, "La Criee - encheres", cx, cy, "\n      ".join(b))


def criee_chrono(s, cx, cy):
    b = _tete(cx, cy, "LA CRIEE", "Cite-les ! La table valide.")
    b += [texte(cx + L / 2, cy + 340, "0:08", 96, DISPLAY, DANGER, ancre="middle"),
          texte(cx + L / 2, cy + 384, "IL RESTE", T_LABEL, DISPLAY, INK2, ancre="middle", espacement=2),
          bloc(cx + 60, cy + 430, 130, 108, JAUNE, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
          texte(cx + 125, cy + 494, "5", 48, DISPLAY, TILE_INK, ancre="middle"),
          texte(cx + 125, cy + 518, "cites", T_MICRO, BODY, TILE_INK, ancre="middle"),
          bloc(cx + 240, cy + 430, 130, 108, SURFACE, r=14, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK),
          texte(cx + 305, cy + 494, "7", 48, DISPLAY, INK, ancre="middle"),
          texte(cx + 305, cy + 518, "enchere", T_MICRO, BODY, INK2, ancre="middle"),
          bouton(cx + 26, cy + 588, L - 52, "ARRETER LE DEFI", True, 60, 18),
          texte(cx + L / 2, cy + 700, "Le chrono passe en rouge sous 10 secondes.", T_MICRO, BODY, INK3, ancre="middle")]
    ecran(s, "La Criee - le defi", cx, cy, "\n      ".join(b))


def gage(s, cx, cy):
    b = _tete(cx, cy, "JE N'AI JAMAIS", "C'est a Amina de jouer")
    b += [bloc(cx + 30, cy + 148, 296, 8, SURFACE, r=4, cerne=INK, epaisseur=1),
          bloc(cx + 336, cy + 138, 74, 30, SURFACE, r=15, cerne=INK, epaisseur=2),
          texte(cx + 373, cy + 158, "8 / 30", T_MICRO, BODY, INK, gras=700, ancre="middle"),
          bloc(cx + 26, cy + 214, L - 52, 296, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=7),
          icone("handmetal", cx + 50, cy + 240, 34),
          paragraphe(cx + L / 2, cy + 356, ["Je n'ai jamais stalke", "un ex sur les reseaux"],
                     23, TILE_INK, 34, "middle"),
          texte(cx + L / 2, cy + 460, "Ceux qui l'ont fait prennent 2 penalites", T_LABEL, BODY, "#6b6357", ancre="middle"),
          puce(cx + 26, cy + 542, "PACK CLASSIQUE", BG_HAUT, INK),
          puce(cx + 200, cy + 542, "REGLE PERSO ACTIVE", NEON),
          bouton(cx + 26, cy + 620, 178, "PENALITE", False, 58, 16),
          bouton(cx + 226, cy + 620, 178, "FAIT", True, 58, 18),
          texte(cx + L / 2, cy + 730, "Ecran generique : il sert Picolo, Action ou Verite,", T_MICRO, BODY, INK3, ancre="middle"),
          texte(cx + L / 2, cy + 748, "Je n'ai jamais, Qui de nous, C'est un 10 mais,", T_MICRO, BODY, INK3, ancre="middle"),
          texte(cx + L / 2, cy + 766, "et 7 Secondes.", T_MICRO, BODY, INK3, ancre="middle")]
    ecran(s, "Jeux de gages (6 modes)", cx, cy, "\n      ".join(b))


def tu_preferes(s, cx, cy):
    b = _tete(cx, cy, "TU PREFERES", "manche 3/10  -  4 votes")
    b += [texte(cx + L / 2, cy + 160, "Au tour d'Adam : passe le telephone,", T_LABEL, BODY, INK2, ancre="middle"),
          texte(cx + L / 2, cy + 180, "choisis ton camp en secret.", T_LABEL, BODY, INK2, ancre="middle"),
          bloc(cx + 26, cy + 210, L - 52, 236, BLEU, r=16, cerne=TILE_INK, epaisseur=3, ombre=7),
          puce(cx + 48, cy + 234, "OPTION A", CARD_FACE, TILE_INK),
          paragraphe(cx + 48, cy + 320, ["Ne plus jamais", "revoir de series"], 25, TILE_INK, 34),
          texte(cx + L / 2, cy + 474, "ou", T_CORPS, BODY, INK3, ancre="middle"),
          bloc(cx + 26, cy + 496, L - 52, 236, ROSE, r=16, cerne=TILE_INK, epaisseur=3, ombre=7),
          puce(cx + 48, cy + 520, "OPTION B", CARD_FACE, TILE_INK),
          paragraphe(cx + 48, cy + 606, ["Ne plus jamais", "ecouter de musique"], 25, TILE_INK, 34),
          bouton(cx + 26, cy + 766, L - 52, "REVELER LE VERDICT", True, 58, 17),
          texte(cx + L / 2, cy + 852, "Terminer la partie", T_LABEL, BODY, INK3, ancre="middle")]
    ecran(s, "Tu preferes - le vote", cx, cy, "\n      ".join(b))


def tu_preferes_verdict(s, cx, cy):
    b = _tete(cx, cy, "TU PREFERES", "Le verdict de la table")
    b += [bloc(cx + 26, cy + 156, L - 52, 300, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=7)]
    for i, (lettre, n, couleur, min_) in enumerate([("A", "3", BLEU, False), ("B", "1", CARD_RED, True)]):
        px = cx + 46 + i * 176
        b.append(bloc(px, cy + 186, 162, 122, couleur, r=12, cerne=TILE_INK, epaisseur=3,
                      opacite=0.35 if min_ else None))
        b.append(texte(px + 81, cy + 254, n, 48, DISPLAY, TILE_INK, ancre="middle"))
        b.append(texte(px + 81, cy + 282, f"Option {lettre}", T_MICRO, BODY, TILE_INK, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 344, "LE CAMP MINORITAIRE PREND", 16, DISPLAY, TILE_INK, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 366, "LA PENALITE !", 16, DISPLAY, TILE_INK, ancre="middle"))
    b.append(puce(cx + 140, cy + 388, "ADAM  -  2 PENALITES", CARD_RED, CARD_FACE))
    b.append(texte(cx + L / 2, cy + 500, "Le texte du verdict reste en card-ink :", T_MICRO, BODY, INK3, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 518, "les aplats pop sont clairs dans les deux themes.", T_MICRO, BODY, INK3, ancre="middle"))
    b.append(bouton(cx + 26, cy + 766, L - 52, "DILEMME SUIVANT", True, 58, 17))
    ecran(s, "Tu preferes - verdict", cx, cy, "\n      ".join(b))


def roulette(s, cx, cy):
    import math
    cxr, cyr, r = cx + L / 2, cy + 336, 148
    b = _tete(cx, cy, "LA ROUE DU DESTIN", "Fais-la tourner, assume le sort")
    for i in range(8):
        a0, a1 = math.radians(i * 45 - 90), math.radians((i + 1) * 45 - 90)
        x0, y0 = cxr + r * math.cos(a0), cyr + r * math.sin(a0)
        x1, y1 = cxr + r * math.cos(a1), cyr + r * math.sin(a1)
        b.append(f'<path d="M{cxr} {cyr} L{x0:.1f} {y0:.1f} A{r} {r} 0 0 1 {x1:.1f} {y1:.1f} Z" '
                 f'fill="{ROUE[i % 4]}" stroke="{TILE_INK}" stroke-width="3"/>')
    b.append(f'<circle cx="{cxr}" cy="{cyr}" r="{r}" fill="none" stroke="{TILE_INK}" stroke-width="6"/>')
    b.append(f'<circle cx="{cxr}" cy="{cyr}" r="30" fill="{CARD_FACE}" stroke="{TILE_INK}" stroke-width="4"/>')
    b.append(icone("disc3", cxr - 13, cyr - 13, 26))
    b.append(f'<path d="M{cxr - 15} {cyr - r - 24} L{cxr + 15} {cyr - r - 24} L{cxr} {cyr - r + 6} Z" fill="{INK}"/>')
    b.append(paragraphe(cx + L / 2, cy + 524, ["Les secteurs ne portent plus de libelle : a huit parts,",
                                               "les textes debordaient sur leurs voisins."],
                        T_MICRO, INK3, 16, "middle"))
    b.append(bloc(cx + 34, cy + 562, 362, 122, CARD_FACE, r=14, cerne=TILE_INK, epaisseur=3, ombre=6))
    b.append(texte(cx + L / 2, cy + 616, "CUL SEC", 32, DISPLAY, CARD_RED, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 648, "Adam vide son verre. Sans discuter.", T_LABEL, BODY, "#6b6357", ancre="middle"))
    b.append(bouton(cx + 34, cy + 714, 362, "LANCER LA ROUE", True, 62, 19))
    b.append(texte(cx + L / 2, cy + 830, "Terminer la partie", T_LABEL, BODY, INK3, ancre="middle"))
    ecran(s, "La Roue du Destin", cx, cy, "\n      ".join(b))


def pilori_intro(s, cx, cy):
    b = _tete(cx, cy, "LE PILORI", "La cour est ouverte")
    b += [bloc(cx + 26, cy + 168, L - 52, 156, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=6),
          icone("gavel", cx + L / 2 - 22, cy + 194, 44),
          paragraphe(cx + L / 2, cy + 274, ["Chacun ecrit une accusation secrete contre la",
                                            "table… ou vous laissez l'app fournir les chefs",
                                            "d'accusation."], T_LABEL, "#6b6357", 19, "middle"),
          bloc(cx + 26, cy + 366, L - 52, 96, ROSE, r=14, cerne=TILE_INK, epaisseur=3, ombre=5),
          texte(cx + L / 2, cy + 422, "ON ECRIT NOS ACCUSATIONS", 19, DISPLAY, TILE_INK, ancre="middle"),
          bloc(cx + 26, cy + 486, L - 52, 96, SURFACE, r=14, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK),
          texte(cx + L / 2, cy + 542, "ACCUSATIONS DE L'APP", 19, DISPLAY, INK, ancre="middle"),
          texte(cx + L / 2, cy + 646, "Cinq phases : ouverture, passage du telephone,", T_MICRO, BODY, INK3, ancre="middle"),
          texte(cx + L / 2, cy + 664, "ecriture, defense, vote.", T_MICRO, BODY, INK3, ancre="middle")]
    ecran(s, "Le Pilori - ouverture", cx, cy, "\n      ".join(b))


def pilori_verdict(s, cx, cy):
    b = _tete(cx, cy, "LE PILORI", "Adam comparait devant la cour")
    b += [bloc(cx + 26, cy + 156, L - 52, 196, CARD_FACE, r=16, cerne=TILE_INK, epaisseur=3, ombre=7),
          paragraphe(cx + L / 2, cy + 232, ["Accuse d'avoir regarde son",
                                            "telephone pendant trois tours."], 19, TILE_INK, 30, "middle"),
          texte(cx + L / 2, cy + 320, "ACCUSATION ANONYME DE LA TABLE", T_MICRO - 1, BODY, "#6b6357",
                ancre="middle", espacement=1.5)]
    for i, (lab, n) in enumerate([("COUPABLE", "3"), ("NON COUPABLE", "1")]):
        px = cx + 26 + i * 192
        b.append(bloc(px, cy + 382, 180, 92, SURFACE, r=12, cerne=INK, epaisseur=3, ombre=5, ombre_couleur=INK))
        b.append(texte(px + 90, cy + 430, n, 30, DISPLAY, INK, ancre="middle"))
        b.append(texte(px + 90, cy + 456, lab, T_MICRO, BODY, INK2, ancre="middle", espacement=1))
    b.append(bloc(cx + 34, cy + 506, 362, 106, SURFACE_HAUT, r=14, cerne=INK, epaisseur=3, ombre=6, ombre_couleur=INK))
    b.append(icone("gavel", cx + 84, cy + 536, 36))
    b.append(texte(cx + 246, cy + 570, "COUPABLE", 30, DISPLAY, NEON, ancre="middle"))
    b.append(texte(cx + 215, cy + 596, "1 penalite", T_LABEL, BODY, INK2, ancre="middle"))
    b.append(paragraphe(cx + L / 2, cy + 654, ["Le verdict est double par la FORME : orange contre",
                                               "vert est le couple que la protanopie confond le plus."],
                        T_MICRO, INK3, 16, "middle"))
    b.append(bouton(cx + 34, cy + 700, 362, "TERMINER ET VOIR L'ADDITION", True, 60, 16))
    ecran(s, "Le Pilori - verdict", cx, cy, "\n      ".join(b))


ECRANS_2 = [quiz, classement_juge, classement_devine, criee, criee_chrono, gage,
            tu_preferes, tu_preferes_verdict, roulette, pilori_intro, pilori_verdict]
