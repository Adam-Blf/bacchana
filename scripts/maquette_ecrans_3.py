# -*- coding: utf-8 -*-
"""Achat, reglages, regles, systeme et surfaces legales."""
from maquette_core import (BG, BG_HAUT, BLEU, BODY, CARD_FACE, CARD_RED, DANGER, DEPTH,
                           DISPLAY, H, INK, INK2, INK3, JAUNE, L, LIME, NEON, ORANGE_INK,
                           PREMIUM, ROSE, SUCCES, SURFACE, SURFACE_HAUT, TILE_INK,
                           T_CORPS, T_LABEL, T_MICRO, T_SOUS, T_TITRE,
                           bloc, bouton, ecran, entete, icone, paragraphe, puce, texte)


def paywall(s, cx, cy):
    b = [f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="{TILE_INK}" opacity="0.78"/>',
         f'<circle cx="{cx + L / 2}" cy="{cy + 420}" r="170" fill="{DEPTH}" opacity="0.32"/>',
         bloc(cx + 24, cy + 108, L - 48, 736, SURFACE_HAUT, r=18, cerne=PREMIUM, epaisseur=3, ombre=7, ombre_couleur=INK),
         bloc(cx + L / 2 - 32, cy + 140, 64, 64, DEPTH, r=16, cerne=TILE_INK, epaisseur=3),
         texte(cx + L / 2, cy + 250, "BACCHANA PREMIUM", 28, DISPLAY, ORANGE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 280, ["Debloque tous les packs premium de la",
                                           "collection, directement dans l'app."], T_LABEL, INK2, 19, "middle")]
    for i, (nom, n) in enumerate([("Picolo - Chaud devant", "60 cartes"),
                                  ("Action ou Verite - Piquant", "80 cartes"),
                                  ("Je n'ai jamais - Aveux", "70 cartes")]):
        yy = cy + 322 + i * 54
        b.append(bloc(cx + 46, yy, L - 92, 46, BG_HAUT, r=10, cerne=INK, epaisseur=2))
        b.append(texte(cx + 66, yy + 29, nom, T_LABEL, BODY, INK, gras=700))
        b.append(texte(cx + L - 66, yy + 29, n, T_MICRO, BODY, INK3, ancre="end"))
    b.append(bloc(cx + 46, cy + 494, L - 92, 74, BG_HAUT, r=12, cerne=PREMIUM, epaisseur=3, ombre=4, ombre_couleur=INK))
    b.append(texte(cx + 68, cy + 526, "A vie", 20, DISPLAY, INK))
    b.append(texte(cx + 68, cy + 550, "Paiement unique, acces perpetuel", T_MICRO, BODY, INK2))
    b.append(puce(cx + 288, cy + 512, "SEULE OFFRE", PREMIUM, CARD_FACE, T_MICRO - 1, 26))
    # Les DEUX cases sont VIDES : jamais pre-cochees, remises a zero a chaque ouverture.
    for i, lignes in enumerate([
            ["Je demande l'execution immediate du contenu",
             "numerique des la confirmation du paiement, avant",
             "la fin du delai de retractation de 14 jours."],
            ["Je reconnais qu'en acceptant cette execution",
             "immediate, je perds mon droit de retractation."]]):
        yy = cy + 588 + i * 82
        b.append(bloc(cx + 46, yy, 26, 26, SURFACE, r=6, cerne=INK, epaisseur=3))
        b.append(paragraphe(cx + 84, yy + 12, lignes, T_MICRO, INK2, 16))
    b.append(texte(cx + L / 2, cy + 758, "Coche les deux cases ci-dessus pour activer le paiement.",
                   T_MICRO, BODY, DANGER, ancre="middle"))
    b.append(bloc(cx + 46, cy + 776, L - 92, 60, SURFACE, r=12, cerne=INK, epaisseur=3, opacite=0.45))
    b.append(texte(cx + L / 2, cy + 813, "DEBLOQUER - 14,99 EUR", 18, DISPLAY, INK3, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 878, "Plus tard", T_LABEL, BODY, CARD_FACE, ancre="middle"))
    ecran(s, "Achat premium", cx, cy, "\n      ".join(b))


def packs(s, cx, cy):
    b = [entete(cx, cy, "PACKS DE CARTES"),
         texte(cx + 28, cy + 150, "Choisis le pack de la manche", T_LABEL, BODY, INK2)]
    packs_ = [("Classique", "Gratuit", 40, LIME, False),
              ("Chaud devant", "2,99 EUR", 60, PREMIUM, True),
              ("Entre potes", "Gratuit", 35, LIME, False),
              ("Sans filtre", "2,99 EUR", 70, PREMIUM, True),
              ("Couples", "2,99 EUR", 55, PREMIUM, True)]
    for i, (nom, prix, n, couleur, verrou) in enumerate(packs_):
        py = cy + 180 + i * 106
        b.append(bloc(cx + 24, py, L - 48, 92, SURFACE, r=14, cerne=INK, epaisseur=3, ombre=4, ombre_couleur=INK))
        b.append(bloc(cx + 44, py + 22, 48, 48, couleur, r=10, cerne=TILE_INK, epaisseur=2))
        b.append(texte(cx + 108, py + 40, nom, 18, DISPLAY, INK))
        b.append(texte(cx + 108, py + 62, f"{n} cartes", T_MICRO, BODY, INK2))
        if verrou:
            b.append(puce(cx + 280, py + 30, prix, PREMIUM, CARD_FACE, T_MICRO, 30))
        else:
            b.append(puce(cx + 296, py + 30, prix, LIME, TILE_INK, T_MICRO, 30))
    b.append(bloc(cx + 24, cy + 726, L - 48, 84, SURFACE_HAUT, r=12, cerne=PREMIUM, epaisseur=2))
    b.append(texte(cx + 46, cy + 758, "Tout debloquer a vie", T_CORPS, BODY, INK, gras=700))
    b.append(texte(cx + 46, cy + 782, "14,99 EUR au lieu de 2,99 EUR le pack", T_MICRO, BODY, INK2))
    b.append(bouton(cx + 24, cy + 826, L - 48, "VOIR PREMIUM", True, 54, 16))
    ecran(s, "Packs de cartes", cx, cy, "\n      ".join(b))


def reglages(s, cx, cy):
    b = [entete(cx, cy, "REGLAGES")]
    y = cy + 152
    for titre, lignes in [
            ("APPARENCE", [("Theme sombre", "Changer", False)]),
            ("PREMIUM", [("Statut", "Invite", False), ("Restaurer mes achats", None, False)]),
            ("CONFIDENTIALITE", [("Mesure d'audience", None, True), ("Gerer les cookies", None, False)]),
            ("CONTENU", [("Mes regles", None, False)])]:
        b.append(texte(cx + 28, y, titre, T_LABEL, DISPLAY, INK3, espacement=1.2))
        for j, (lab, val, inter) in enumerate(lignes):
            py = y + 14 + j * 66
            b.append(bloc(cx + 24, py, L - 48, 56, SURFACE, r=12, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
            b.append(texte(cx + 46, py + 34, lab, T_LABEL, BODY, INK, gras=700))
            if inter:
                b.append(bloc(cx + 322, py + 12, 60, 32, SURFACE_HAUT, r=16, cerne=INK, epaisseur=2))
                b.append(f'<circle cx="{cx + 338}" cy="{py + 28}" r="11" fill="{CARD_FACE}" stroke="{INK}" stroke-width="2"/>')
            elif val:
                b.append(texte(cx + L - 46, py + 34, val, T_LABEL, BODY, ORANGE_INK, gras=700, ancre="end"))
        y += 14 + len(lignes) * 66 + 22
    b.append(bloc(cx + 24, cy + 660, L - 48, 88, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 46, cy + 694, "Bacchana", 20, DISPLAY, INK))
    b.append(texte(cx + 46, cy + 716, "Version 0.41.0", T_MICRO, BODY, INK2))
    b.append(texte(cx + 46, cy + 734, "Editeur : Adam Beloucif, nom commercial BLF Lab's", T_MICRO - 1, BODY, INK3))
    b.append(bloc(cx + 24, cy + 768, L - 48, 58, SURFACE, r=12, cerne=DANGER, epaisseur=2))
    b.append(texte(cx + L / 2, cy + 804, "REINITIALISER LA TABLEE", 16, DISPLAY, DANGER, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 860, "Le statut premium n'est jamais touche.", T_MICRO, BODY, INK3, ancre="middle"))
    ecran(s, "Reglages", cx, cy, "\n      ".join(b))


def regles_borderland(s, cx, cy):
    b = [entete(cx, cy, "REGLES DU BORDERLAND"),
         paragraphe(cx + 28, cy + 156, ["Le trefle arrive face cachee : fais deviner sa valeur",
                                        "avant de la retourner. Chaque couleur a ensuite sa",
                                        "propre regle."], T_LABEL, INK2)]
    regles = [("♣", "Le Guess", "Fais deviner la valeur exacte avant de retourner."),
              ("♦", "L'Action", "Donne une action au joueur de ton choix."),
              ("♥", "La Question", "Pose une question au joueur de ton choix."),
              ("♠", "La Contrainte", "Donne une contrainte a accomplir.")]
    for i, (sym, titre, desc) in enumerate(regles):
        py = cy + 226 + i * 112
        rouge = sym in ("♦", "♥")
        b.append(bloc(cx + 24, py, L - 48, 98, SURFACE, r=14, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
        b.append(texte(cx + L - 60, py + 76, sym, 68, BODY, INK, opacite=0.06, ancre="middle"))
        b.append(bloc(cx + 44, py + 22, 44, 44, BG_HAUT, r=10, cerne=INK, epaisseur=2))
        b.append(texte(cx + 66, py + 52, sym, 22, BODY, DANGER if rouge else INK, ancre="middle"))
        b.append(texte(cx + 104, py + 42, titre.upper(), 19, DISPLAY, INK))
        b.append(texte(cx + 104, py + 66, desc[:42], T_MICRO, BODY, INK2))
    b.append(bloc(cx + 24, cy + 682, L - 48, 74, SURFACE_HAUT, r=14, cerne=NEON, epaisseur=2))
    b.append(texte(cx + 46, cy + 714, "LES AS VALENT UNE PENALITE MAJEURE.", 15, DISPLAY, ORANGE_INK))
    b.append(bloc(cx + 24, cy + 772, L - 48, 100, SURFACE_HAUT, r=14, cerne=NEON, epaisseur=2))
    b.append(texte(cx + 46, cy + 804, "LE CONTEST", 19, DISPLAY, INK))
    b.append(paragraphe(cx + 46, cy + 828, ["Conteste une carte pour doubler la mise. Le suivant",
                                            "peut accepter ou escalader (x2, puis x4). Celui qui",
                                            "accepte prend tout. Courage ou folie ?"], T_MICRO))
    ecran(s, "Regles du Coupe-Gorge", cx, cy, "\n      ".join(b))


def regles_mode(s, cx, cy):
    b = [entete(cx, cy, "REGLES - LA CRIEE"),
         icone("megaphone", cx + L / 2 - 24, cy + 156, 48)]
    etapes = ["La table choisit un theme, ou en tire un au hasard.",
              "Chacun annonce combien il peut en citer en une minute.",
              "Surencherissez, ou criez « tu mens ! » pour lancer le chrono.",
              "Le pari tenu, la table boit. Rate, l'enchereur boit."]
    for i, txt in enumerate(etapes):
        py = cy + 232 + i * 108
        b.append(bloc(cx + 24, py, L - 48, 92, SURFACE, r=14, cerne=INK, epaisseur=2, ombre=3, ombre_couleur=INK))
        b.append(bloc(cx + 44, py + 28, 34, 34, BG_HAUT, r=17, cerne=INK, epaisseur=2))
        b.append(texte(cx + 61, py + 51, str(i + 1), T_LABEL, BODY, INK, gras=700, ancre="middle"))
        b.append(paragraphe(cx + 92, py + 40, [txt[:36], txt[36:]], T_LABEL, INK, 19))
    b.append(texte(cx + L / 2, cy + 700, "Ecran generique : il sert les douze modes,", T_MICRO, BODY, INK3, ancre="middle"))
    b.append(texte(cx + L / 2, cy + 718, "le Coupe-Gorge gardant son ecran dedie.", T_MICRO, BODY, INK3, ancre="middle"))
    b.append(bouton(cx + 24, cy + 792, L - 48, "COMPRIS", True))
    ecran(s, "Regles d'un mode", cx, cy, "\n      ".join(b))


def mes_regles(s, cx, cy):
    b = [entete(cx, cy, "MES REGLES"),
         paragraphe(cx + 28, cy + 154, ["Cree tes propres regles : elles se glissent dans les",
                                        "jeux de cartes ou s'ajoutent a la roulette, et restent",
                                        "enregistrees sur ton telephone."], T_LABEL, INK2)]
    for i, (txt, tag, actif, partagee) in enumerate([
            ("Le dernier a trinquer boit double", "Tous les jeux de cartes", True, False),
            ("Interdiction de dire un prenom", "Roulette", True, True),
            ("Celui qui rit distribue", "Tous les jeux de cartes", False, False)]):
        py = cy + 232 + i * 108
        b.append(bloc(cx + 24, py, L - 48, 92, SURFACE, r=14, cerne=INK, epaisseur=2, ombre=3,
                      ombre_couleur=INK, opacite=None if actif else 0.5))
        b.append(bloc(cx + 44, py + 30, 28, 28, LIME if actif else SURFACE, r=7,
                      cerne=TILE_INK if actif else INK, epaisseur=3))
        b.append(paragraphe(cx + 86, py + 36, [txt[:30], txt[30:]], T_LABEL, INK, 18, gras=700))
        b.append(texte(cx + 86, py + 74, tag, T_MICRO - 1, BODY, INK3))
        if partagee:
            b.append(puce(cx + 292, py + 28, "PARTAGEE", LIME, TILE_INK, T_MICRO - 1, 26))
    b.append(bloc(cx + 24, cy + 566, L - 48, 168, SURFACE_HAUT, r=14, cerne=NEON, epaisseur=3))
    b.append(puce(cx + 44, cy + 582, "NOUVEAU", NEON))
    b.append(bloc(cx + 44, cy + 626, 28, 28, SURFACE, r=7, cerne=INK, epaisseur=3))
    b.append(texte(cx + 86, cy + 647, "Partager mes regles", T_CORPS, BODY, INK, gras=700))
    b.append(paragraphe(cx + 44, cy + 682, ["Decoche par defaut. Sans ton accord, rien ne quitte",
                                            "l'appareil - c'est le fonctionnement normal."], T_MICRO))
    b.append(texte(cx + 44, cy + 722, "Cochee, la regle nourrit les packs a venir.", T_MICRO, BODY, ORANGE_INK, gras=700))
    b.append(bouton(cx + 24, cy + 792, L - 48, "NOUVELLE REGLE", True))
    ecran(s, "Mes regles", cx, cy, "\n      ".join(b))


def editeur_regle(s, cx, cy):
    b = [f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="{TILE_INK}" opacity="0.6"/>',
         bloc(cx, cy + 180, L, H - 180, BG, r=24, cerne=INK, epaisseur=3),
         f'<rect x="{cx + L / 2 - 30}" y="{cy + 198}" width="60" height="6" rx="3" fill="{INK3}"/>',
         texte(cx + 28, cy + 246, "NOUVELLE REGLE", T_SOUS, DISPLAY, INK),
         texte(cx + 28, cy + 286, "Type", T_LABEL, BODY, INK, gras=700)]
    for i, (lab, actif) in enumerate([("Carte de jeu", True), ("Roulette", False)]):
        px = cx + 28 + i * 188
        b.append(bloc(px, cy + 298, 176, 46, JAUNE if actif else SURFACE, r=10,
                      cerne=TILE_INK if actif else INK, epaisseur=2, ombre=3 if actif else 0))
        b.append(texte(px + 88, cy + 327, lab, T_LABEL, BODY, TILE_INK if actif else INK, gras=700, ancre="middle"))
    b.append(texte(cx + 28, cy + 384, "Texte de la regle", T_LABEL, BODY, INK, gras=700))
    b.append(bloc(cx + 28, cy + 396, L - 56, 108, BG_HAUT, r=10, cerne=INK, epaisseur=2))
    b.append(paragraphe(cx + 46, cy + 426, ["Ex. : {player} imite un animal choisi par",
                                            "{player2}, sinon 2 penalites."], T_LABEL, INK3, 20))
    b.append(puce(cx + 28, cy + 516, "{player}", BLEU))
    b.append(puce(cx + 132, cy + 516, "{player2}", BLEU))
    b.append(texte(cx + 28, cy + 586, "Penalites en cas d'echec", T_LABEL, BODY, INK, gras=700))
    b.append(bloc(cx + 28, cy + 600, 52, 48, SURFACE, r=10, cerne=INK, epaisseur=3))
    b.append(texte(cx + 54, cy + 632, "-", 22, DISPLAY, INK, ancre="middle"))
    b.append(texte(cx + 124, cy + 634, "2", 30, DISPLAY, INK, ancre="middle"))
    b.append(bloc(cx + 148, cy + 600, 52, 48, SURFACE, r=10, cerne=INK, epaisseur=3))
    b.append(texte(cx + 174, cy + 632, "+", 22, DISPLAY, INK, ancre="middle"))
    b.append(bloc(cx + 28, cy + 674, L - 56, 74, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 46, cy + 702, "Apercu :", T_MICRO, BODY, INK3))
    b.append(texte(cx + 46, cy + 726, "Adam imite un animal choisi par Nawel.", T_LABEL, BODY, INK, gras=700))
    b.append(bouton(cx + 28, cy + 780, 176, "ANNULER", False, 54, 16))
    b.append(bouton(cx + 216, cy + 780, 176, "ENREGISTRER", True, 54, 16))
    ecran(s, "Editeur de regle", cx, cy, "\n      ".join(b))


def cookies(s, cx, cy):
    b = [texte(cx + L / 2, cy + 300, "BACCHANA", 50, DISPLAY, NEON, ancre="middle"),
         f'<rect x="{cx}" y="{cy}" width="{L}" height="{H}" rx="38" fill="{TILE_INK}" opacity="0.5"/>',
         bloc(cx + 18, cy + 524, L - 36, 368, SURFACE_HAUT, r=18, cerne=INK, epaisseur=3, ombre=7, ombre_couleur=INK),
         texte(cx + 44, cy + 574, "COOKIES", 26, DISPLAY, INK),
         paragraphe(cx + 44, cy + 610, ["Bacchana utilise des traceurs pour mesurer",
                                        "l'audience et ameliorer l'experience de jeu.",
                                        "Vous pouvez accepter, refuser, ou personnaliser."], T_LABEL),
         texte(cx + 44, cy + 678, "En savoir plus : politique de confidentialite.", T_LABEL, BODY, ORANGE_INK, gras=700),
         bouton(cx + 44, cy + 706, 168, "TOUT REFUSER", False, 54, 14),
         bouton(cx + 226, cy + 706, 168, "ACCEPTER", True, 54, 14),
         texte(cx + L / 2, cy + 800, "Personnaliser", T_LABEL, BODY, INK2, ancre="middle"),
         paragraphe(cx + L / 2, cy + 840, ["Refus et acceptation ont strictement le meme poids",
                                           "visuel : conforme CNIL, anti dark-pattern."], T_MICRO, INK3, 16, "middle")]
    ecran(s, "Bandeau cookies", cx, cy, "\n      ".join(b))


def erreur(s, cx, cy):
    b = [texte(cx + L / 2, cy + 380, "NOUVELLE VERSION", 28, DISPLAY, INK, ancre="middle"),
         texte(cx + L / 2, cy + 416, "L'application se met a jour, un instant.", T_CORPS, BODY, INK2, ancre="middle"),
         f'<line x1="{cx + 60}" y1="{cy + 480}" x2="{cx + L - 60}" y2="{cy + 480}" stroke="{INK}" stroke-width="2" stroke-dasharray="8 8"/>',
         texte(cx + L / 2, cy + 552, "OUPS, LA PARTIE A PLANTE.", 24, DISPLAY, INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 590, ["Une erreur inattendue est survenue. Relance",
                                           "l'application pour reprendre la soiree - il",
                                           "faudra ressaisir la tablee."], T_LABEL, INK2, 20, "middle"),
         bloc(cx + 110, cy + 664, 210, 52, NEON, r=26, cerne=TILE_INK, epaisseur=2),
         texte(cx + 215, cy + 697, "RELANCER L'APPLICATION", 13, DISPLAY, TILE_INK, ancre="middle"),
         paragraphe(cx + L / 2, cy + 776, ["Deux etats distincts : un fichier perime apres",
                                           "deploiement recharge tout seul, une fois. Un vrai",
                                           "plantage garde l'ecran d'erreur et son bouton."],
                    T_MICRO, INK3, 16, "middle")]
    ecran(s, "Etats d'erreur", cx, cy, "\n      ".join(b))


def mentions(s, cx, cy):
    b = [entete(cx, cy, "MENTIONS LEGALES"),
         texte(cx + 28, cy + 150, "VERSION APPLICABLE AU 4 AOUT 2026", T_MICRO - 1, BODY, INK3, espacement=1.5)]
    sections = [("Editeur", ["Adam Beloucif, exercant sous le nom", "commercial BLF Lab's",
                             "SIREN : 108386855", "6 impasse Edouard Vaillant, 94550", "Chevilly-Larue, France"]),
                ("Hebergeur", ["Vercel Inc.", "340 S Lemon Ave, Walnut, CA"]),
                ("Mediation", ["CM2C - 14 rue Saint Jean, Paris 17e"]),
                ("Credits", ["Icones par Icons8", "Polices Anton et Bricolage Grotesque"]),
                ("Contact", ["adambeloucif@gmail.com"])]
    y = cy + 186
    for titre, lignes in sections:
        b.append(texte(cx + 28, y, titre.upper(), T_LABEL, DISPLAY, INK, espacement=1))
        b.append(paragraphe(cx + 28, y + 24, lignes, T_LABEL, INK2, 19))
        y += 34 + len(lignes) * 19 + 24
    b.append(bloc(cx + 24, y + 8, L - 48, 92, SURFACE_HAUT, r=12, cerne=INK, epaisseur=2))
    b.append(texte(cx + 46, y + 40, "Donnees personnelles", T_LABEL, BODY, INK, gras=700))
    b.append(paragraphe(cx + 46, y + 64, ["Aucun compte. Les regles perso restent sur",
                                          "l'appareil sauf partage explicite."], T_MICRO))
    b.append(bouton(cx + 24, cy + 830, L - 48, "CGU / CGV", False, 52, 15))
    ecran(s, "Mentions legales", cx, cy, "\n      ".join(b))


def cgv(s, cx, cy):
    b = [entete(cx, cy, "CGU / CGV"),
         texte(cx + 28, cy + 150, "PARTIE 2 - CGV", T_MICRO - 1, BODY, INK3, espacement=1.5)]
    sections = [("Offre", ["Acces premium a vie : 14,99 euros,", "paiement unique.",
                           "Pack de contenu a la carte : 2,99 euros."]),
                ("Renouvellement", ["Aucun renouvellement automatique, aucun",
                                    "abonnement, aucun prelevement recurrent."]),
                ("Retractation", ["Delai de 14 jours (art. L221-18), sauf",
                                  "execution immediate demandee (L221-28 13°)."]),
                ("Age", ["Reserve aux personnes majeures, 18 ans ou plus."]),
                ("Mediation", ["CM2C, en cas de litige non resolu."])]
    y = cy + 186
    for titre, lignes in sections:
        b.append(texte(cx + 28, y, titre.upper(), T_LABEL, DISPLAY, INK, espacement=1))
        b.append(paragraphe(cx + 28, y + 24, lignes, T_LABEL, INK2, 19))
        y += 34 + len(lignes) * 19 + 26
    b.append(bloc(cx + 24, y + 10, L - 48, 96, SURFACE_HAUT, r=12, cerne=PREMIUM, epaisseur=2))
    b.append(texte(cx + 46, y + 42, "Version unique", T_LABEL, BODY, INK, gras=700))
    b.append(paragraphe(cx + 46, y + 66, ["CGU_VERSION est la source unique reutilisee par",
                                          "le paywall pour horodater le consentement."], T_MICRO))
    ecran(s, "CGU / CGV", cx, cy, "\n      ".join(b))


def confidentialite(s, cx, cy):
    b = [entete(cx, cy, "CONFIDENTIALITE"),
         texte(cx + 28, cy + 150, "VERSION APPLICABLE AU 4 AOUT 2026", T_MICRO - 1, BODY, INK3, espacement=1.5)]
    sections = [("Principe", ["Bacchana fonctionne sans creation de compte.",
                              "Aucune donnee n'est vendue a des tiers."]),
                ("Non collecte", ["Aucune donnee de sante, biometrique,", "ou de localisation."]),
                ("Mesure d'audience", ["PostHog, instance UE, 13 mois maximum,", "soumis a consentement."]),
                ("Vos droits", ["Acces, rectification, effacement,", "opposition. Reclamation : www.cnil.fr"]),
                ("Public", ["Reserve aux personnes de 18 ans ou plus."])]
    y = cy + 186
    for titre, lignes in sections:
        b.append(texte(cx + 28, y, titre.upper(), T_LABEL, DISPLAY, INK, espacement=1))
        b.append(paragraphe(cx + 28, y + 24, lignes, T_LABEL, INK2, 19))
        y += 34 + len(lignes) * 19 + 26
    b.append(bloc(cx + 24, y + 10, L - 48, 100, SURFACE_HAUT, r=12, cerne=PREMIUM, epaisseur=2))
    b.append(texte(cx + 46, y + 42, "A ARCHIVER AVANT PRODUCTION", T_LABEL, DISPLAY, ORANGE_INK))
    b.append(paragraphe(cx + 46, y + 66, ["Les accords de sous-traitance Stripe,",
                                          "RevenueCat, PostHog et Vercel restent a archiver."], T_MICRO))
    ecran(s, "Politique de confidentialite", cx, cy, "\n      ".join(b))


ECRANS_3 = [paywall, packs, reglages, regles_borderland, regles_mode,
            mes_regles, editeur_regle, cookies, erreur, mentions, cgv, confidentialite]
