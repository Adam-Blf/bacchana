"""Rapatrie les icones Icons8 utilisees par Bacchana, en local.

Pourquoi ce script existe :
  - Aucun CDN dans une app livree. Les icones vivent dans le depot, servies en
    chemin relatif, l'app doit fonctionner hors ligne.
  - Le style est `ios_filled` (iOS 27 Filled), arbitre sur planche comparative
    le 2026-08-06 contre `forma-bold-sharp` et `ios7`. Deux raisons mesurees :
    au rendu 20 px, le contour iOS perd 17 de ses 17 traits sous le seuil de
    2 px - la coche du bouton valider disparait purement - la ou le plein n'en
    perd que 12 et Forma 8 ; et le catalogue passe de 3 054 icones (Forma) a
    10 662, ce qui compte sur un produit a 13 modes qui grandit.
    Le plein survit au downscale parce qu'il porte des aplats, pas des filets.
  - Les icones sont monochromes et rendues en masque CSS, donc elles heritent
    de `currentColor` et suivent le theme clair/sombre exactement comme un SVG.

Format : SVG. Le plan payant Icons8 est actif depuis le 2026-08-06, ce qui
supprime la classe entiere des defauts de downscale : la mesure faite sur la
planche comparative comptait 12 icones sur 17 dont le trait le plus fin passait
sous 2 px au rendu 20 px. Un vecteur n'a pas ce probleme, et la regle
« vector-only assets » des standards d'UI mobile est enfin tenue.

Un masque CSS accepte l'un comme l'autre, donc le composant `Icon` n'a change
que d'extension.

L'endpoint SVG demande un jeton, lu dans ICONS8_API_KEY (shell, sinon .env, qui
est gitignore). Jamais passe en argument de ligne de commande : l'historique du
shell et la liste des processus le garderaient.

Effet de bord precieux : la reponse SVG porte le champ `platform` de l'icone.
Le script verifie donc que ce qu'il telecharge appartient REELLEMENT au style
courant, au lieu de croire l'etiquette ecrite a la main dans la table.

Usage :
    python scripts/vendor_icons8.py            verifie et complete ce qui manque
    python scripts/vendor_icons8.py --force    retelecharge tout
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST = os.path.join(RACINE, "public", "icons")
MANIFESTE = os.path.join(DEST, "manifest.json")

PLATFORM = "ios_filled"
FORMAT = "svg"
RECHERCHE = "https://search.icons8.com/api/iconsets/v5/search"
TELECHARGEMENT = "https://api-icons.icons8.com/publicApi/icons/icon"


def jeton():
    """ICONS8_API_KEY, depuis le shell d'abord, sinon .env (gitignore)."""
    valeur = os.environ.get("ICONS8_API_KEY")
    if valeur:
        return valeur.strip()
    chemin = os.path.join(RACINE, ".env")
    if os.path.exists(chemin):
        for ligne in open(chemin, encoding="utf-8"):
            if ligne.startswith("ICONS8_API_KEY="):
                valeur = ligne.split("=", 1)[1].strip()
                if valeur:
                    return valeur
    raise SystemExit(
        "ICONS8_API_KEY absente. Le format SVG demande le plan paye Icons8.\n"
        "Poser la cle dans l'environnement ou dans .env (voir .env.example).")

# nom utilise dans le code  ->  terme de recherche Icons8, ou "#ID" epingle.
#
# Le nom de gauche est celui que le composant Icon recevra. Il est en
# kebab-case et decrit l'INTENTION, pas le dessin : `quitter` et non `porte`.
#
# Un "#ID@style" epingle une icone precise. On epingle des qu'un choix a ete
# arbitre a la main, parce que la recherche par terme derive : `no wifi`
# renvoyait "No Image", `heart` renvoyait "Two Hearts" au lieu de l'enseigne de
# carte, et `spade` renvoyait une beche de jardin sous le nom "Spade".
# Ce qui reste en terme libre est un cas ou le premier resultat etait le bon.
#
# Le suffixe "@style" n'est pas decoratif. Un identifiant Icons8 appartient a UN
# SEUL style, et l'URL de telechargement ne prend QUE l'identifiant : une
# epingle posee sous un ancien style continue donc de livrer l'ancien dessin
# apres une bascule, silencieusement, au milieu d'un jeu par ailleurs coherent.
# C'est arrive lors du passage de `forma-bold-sharp` a `ios_filled` : six
# epingles ont ramene des filets fins dans un jeu plein. La garde
# `verifier_epingles` refuse desormais toute epingle dont le style ne
# correspond pas a PLATFORM, ce qui force un re-choix a la main a chaque
# bascule - le seul moment ou un humain peut valider le dessin.
ICONES = {
    # navigation et actions de base
    "accueil": "home",
    "retour": "#40217@ios_filled",   # Back, chevron gras
    "suivant": "#7849@ios_filled",   # Forward, le chevron symetrique de retour
    "fermer": "close",
    "valider": "checkmark",
    "plus": "plus",
    "moins": "minus",
    "supprimer": "trash",
    "editer": "pencil",
    "ecrire": "edit",
    "reglages": "settings",
    "curseurs": "sliders",
    "aide": "help",
    "info": "info",
    "chargement": "loading",
    "partager": "share",
    "quitter": "#8119@ios_filled",   # Logout
    "recommencer": "restart",
    "chronometre": "timer",
    "horloge": "clock",
    # theme
    "soleil": "sun",
    "lune": "moon",
    # joueurs
    "joueurs": "group",
    # « Je n'ai jamais » : on leve la main. Epinglee parce que les termes
    # `raise hand` et `raised hand` rendent un salut militaire ou un homme
    # entier, pas la main ouverte du jeu.
    "main-levee": "#10272@ios_filled",  # Hand
    "ajouter-joueur": "add user",
    "couronne": "crown",
    "medaille": "medal",
    # jeu
    "jouer": "play",
    "regles": "scroll",
    "livre": "book",
    "paquets": "layers",
    "infini": "infinity",
    "des": "dice",
    # Choix d'Adam le 2026-08-06, apres avoir vu la roue a rayons a l'ecran :
    # elle se lisait comme une barre de bateau. On prend donc l'icone Icons8
    # "Roulette", qui nomme le jeu sans ambiguite.
    # Reserve signalee et assumee : c'est un jeton a croix centrale, une forme
    # proche de `fermer` et de `quitter`. A surveiller si les trois se
    # retrouvent un jour sur le meme ecran.
    "roue": "#30220@ios_filled",     # Roulette
    "balance": "scales",
    "marteau-juge": "gavel",
    "ticket": "receipt",
    "megaphone": "megaphone",
    "cerveau": "brain",
    "flamme": "fire",
    "fete": "party",
    "etincelles": "sparkling",
    "pouce-haut": "thumbs up",
    "pouce-bas": "thumbs down",
    "oeil": "eye",
    "oeil-barre": "invisible",
    "epee": "sword",
    "gemme": "diamond",
    # Enseignes de cartes. TOUTES epinglees, et la garde ENSEIGNES ci-dessous
    # refuse qu'une seule d'entre elles repasse en terme libre.
    #
    # Motif, mesure le 2026-08-06 : `spade` rendait une icone Icons8 nommee
    # "Spade" qui dessine une BECHE DE JARDIN. Le nom correspondait, le dessin
    # non, et la tuile du Borderland - le mode carte principal - a livre une
    # pelle en production. Le meme piege avait deja ete rencontre sur `coeur`
    # (`heart` rendait "Two Hearts") et epingle a la main, sans que les trois
    # autres enseignes soient reverifiees.
    #
    # Un identifiant Icons8 appartient a UN style. Chaque bascule de style
    # rejoue donc la resolution par terme, et ramenerait la derive : d'ou la
    # garde, qui survit aux bascules, plutot que la seule correction du cas.
    "pique": "#10304@ios_filled",    # Spades, l'enseigne (et NON #11478 "Spade", la beche)
    "coeur": "#10287@ios_filled",    # Favorite, coeur simple (les termes `heart*` ne rendent que des paires)
    "trefle": "#10301@ios_filled",   # Clubs
    "carreau": "#10276@ios_filled",  # Diamonds
    # systeme, premium, legal
    "cadenas": "lock",
    "bouclier": "#10498@ios_filled",  # Shield
    "cookie": "cookie",
    # PAS "No Connection" : ce dessin est un histogramme de barres de signal,
    # donc il montre la PRESENCE de reseau. Un wifi barre dit l'absence.
    "hors-ligne": "#53449@ios_filled",  # Wi-Fi off
}


# Les enseignes de cartes portent un sens que le nom Icons8 ne garantit pas :
# elles DOIVENT rester epinglees. Voir le commentaire au-dessus de "pique".
ENSEIGNES = ("pique", "coeur", "trefle", "carreau")


def verifier_epingles():
    """Deux refus, tous deux constates en vrai sur ce depot.

    1. Une enseigne de carte revenue en terme libre. `spade` a livre une beche
       de jardin sous un nom Icons8 qui disait pourtant "Spade".
    2. Une epingle dont le style ne suit pas PLATFORM. L'URL de telechargement
       ne prend que l'identifiant : une epingle posee sous l'ancien style
       ramene l'ancien dessin apres une bascule, sans aucune erreur.

    Ce que cette garde NE VOIT PAS : elle verifie qu'un identifiant est epingle
    et qu'il annonce le bon style, PAS qu'il dessine la bonne chose. Un mauvais
    identifiant correctement etiquete passe. Le controle du DESSIN se fait a
    l'oeil, une fois, au moment ou on epingle. Elle ne voit pas non plus les
    entrees en terme libre, qui restent a la merci de la derive de recherche
    pour tout ce qui n'est pas une enseigne.
    """
    libres = [n for n in ENSEIGNES if not ICONES[n].startswith("#")]
    if libres:
        raise SystemExit(
            "ENSEIGNES NON EPINGLEES : " + ", ".join(libres) + "\n"
            "Une enseigne resolue par terme libre a deja livre une beche de "
            "jardin pour `pique`. Epingler un identifiant verifie a l'oeil.")

    mauvais = []
    for nom, terme in ICONES.items():
        if not terme.startswith("#"):
            continue
        if "@" not in terme:
            mauvais.append(f"{nom} (aucun style annonce)")
        elif terme.split("@", 1)[1] != PLATFORM:
            mauvais.append(f"{nom} (epinglee sous {terme.split('@', 1)[1]})")
    if mauvais:
        raise SystemExit(
            f"EPINGLES ETRANGERES A {PLATFORM} : " + ", ".join(mauvais) + "\n"
            "Un identifiant Icons8 appartient a un seul style. Re-choisir ces "
            "icones dans le style courant, a l'oeil, puis reecrire l'epingle "
            f"sous la forme #ID@{PLATFORM}.")


def http(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {
        "User-Agent": "bacchana-vendor-icons/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def resoudre(terme):
    """Retourne (id, nom). '#ID@style' est un ID deja arbitre a la main."""
    if terme.startswith("#"):
        return terme[1:].split("@", 1)[0], "(epingle)"
    q = urllib.parse.urlencode({
        "term": terme, "platform": PLATFORM, "amount": 1,
        "offset": 0, "language": "en"})
    data = json.loads(http(f"{RECHERCHE}?{q}"))
    icons = data.get("icons") or []
    if not icons:
        return None, None
    return icons[0]["id"], icons[0]["name"]


def telecharger(icon_id, chemin, jeton_api):
    """Ecrit le SVG et retourne (octets, style reel, nom reel, sous-categorie).

    Le style est celui que l'API declare pour cette icone, pas celui qu'on
    croyait : c'est le seul controle qui attrape une epingle posee sous un autre
    style, puisque l'URL de telechargement ne prend que l'identifiant.
    """
    q = urllib.parse.urlencode({"id": icon_id, "token": jeton_api})
    data = json.loads(http(f"{TELECHARGEMENT}?{q}"))
    icone = data.get("icon") or {}
    svg = icone.get("svg") or ""
    if len(svg) < 80:
        raise ValueError(f"SVG absent ou trop court ({len(svg)} caracteres)")
    reel = icone.get("platform")
    if reel != PLATFORM:
        raise ValueError(f"style reel '{reel}' au lieu de '{PLATFORM}'")
    with open(chemin, "w", encoding="utf-8") as fh:
        fh.write(svg)
    return len(svg), reel, icone.get("name") or "", icone.get("subcategory") or ""


def main():
    force = "--force" in sys.argv
    verifier_epingles()
    jeton_api = jeton()
    os.makedirs(DEST, exist_ok=True)
    manifeste = {}
    if os.path.exists(MANIFESTE) and not force:
        with open(MANIFESTE, encoding="utf-8") as fh:
            manifeste = json.load(fh).get("icones", {})

    ok = saute = echec = 0
    for nom, terme in sorted(ICONES.items()):
        fichier = os.path.join(DEST, f"{nom}.{FORMAT}")
        if not force and nom in manifeste and os.path.exists(fichier):
            saute += 1
            continue
        try:
            icon_id, titre = resoudre(terme)
            if not icon_id:
                print(f"  INTROUVABLE {nom:<16} (terme '{terme}')")
                echec += 1
                continue
            taille, reel, nom_reel, sous_cat = telecharger(icon_id, fichier, jeton_api)
            manifeste[nom] = {"id": icon_id, "terme": terme,
                              "titre": nom_reel or titre,
                              "platform": reel, "format": FORMAT,
                              "sous_categorie": sous_cat, "octets": taille}
            print(f"  OK          {nom:<16} {(nom_reel or titre):<22} {taille:>6} o")
            ok += 1
            time.sleep(0.15)
        except (urllib.error.URLError, ValueError, KeyError) as e:
            print(f"  ECHEC       {nom:<16} {e}")
            echec += 1

    # Le seul controle qui porte sur le DESSIN et non sur l'etiquette. Icons8
    # range ses enseignes de cartes dans `card-suits` ; la beche de jardin qui
    # se faisait passer pour un pique vivait dans une categorie d'outils. C'est
    # devenu possible le jour ou l'API SVG a expose la sous-categorie.
    hors_sujet = [n for n in ENSEIGNES
                  if manifeste.get(n, {}).get("sous_categorie") not in (None, "card-suits")]
    if hors_sujet:
        raise SystemExit(
            "ENSEIGNES HORS DE `card-suits` : " + ", ".join(
                f"{n} -> {manifeste[n]['sous_categorie']}" for n in hors_sujet) + "\n"
            "Une enseigne de carte qui vit ailleurs dessine autre chose. "
            "C'est exactement le cas de la beche vendue sous le nom 'Spade'.")

    with open(MANIFESTE, "w", encoding="utf-8") as fh:
        json.dump({
            "source": "Icons8",
            "platform": PLATFORM,
            "format": FORMAT,
            "licence": "Icons8 - plan paye actif, voir https://icons8.com/license",
            "icones": manifeste,
        }, fh, indent=2, ensure_ascii=False)

    ecrire_types(sorted(manifeste))

    print(f"\ntelechargees={ok} deja presentes={saute} echecs={echec} "
          f"total={len(manifeste)}/{len(ICONES)}")
    return 1 if echec else 0


def ecrire_types(noms):
    """Emet l'union TypeScript des noms d'icones.

    Sans ce fichier, une faute de frappe dans `<Icon name="acceuil" />` passe
    le build et ne se voit qu'a l'ecran, sous la forme d'une icone absente.
    Avec, tsc la refuse. Le fichier est genere, jamais edite a la main.
    """
    chemin = os.path.join(RACINE, "src", "components", "ui", "icon-names.ts")
    lignes = [
        "// Genere par scripts/vendor_icons8.py. Ne pas editer a la main.",
        "// Relancer : python scripts/vendor_icons8.py",
        "",
        "export const ICON_NAMES = [",
        *[f"  '{n}'," for n in noms],
        "] as const",
        "",
        "export type IconName = (typeof ICON_NAMES)[number]",
        "",
    ]
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lignes))
    print(f"  types       {os.path.relpath(chemin, RACINE)} ({len(noms)} noms)")


if __name__ == "__main__":
    sys.exit(main())
