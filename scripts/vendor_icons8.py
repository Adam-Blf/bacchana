"""Rapatrie les icones Icons8 utilisees par Bacchus, en local.

Pourquoi ce script existe :
  - Aucun CDN dans une app livree. Les icones vivent dans le depot, servies en
    chemin relatif, l'app doit fonctionner hors ligne.
  - Le style est `forma-bold-sharp` : traits gras et angles vifs, choisi pour
    coller au neobrutalisme (bordures 2px, Anton, ombres dures). Les jeux
    d'icones arrondis generiques trahissent l'identite de la marque.
  - Les icones sont monochromes et rendues en masque CSS, donc elles heritent
    de `currentColor` et suivent le theme clair/sombre exactement comme un SVG.

Format : PNG 256 px. Le SVG d'Icons8 demande un plan payant ; l'API repond 403
sans lui. Le script est ecrit pour basculer sans douleur : passer FORMAT a
"svg" quand le plan est actif, tout le reste suit (le composant Icon gere les
deux, un masque CSS accepte l'un comme l'autre).

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

PLATFORM = "forma-bold-sharp"
FORMAT = "png"
TAILLE = 256
RECHERCHE = "https://search.icons8.com/api/iconsets/v5/search"
TELECHARGEMENT = "https://img.icons8.com/"

# nom utilise dans le code  ->  terme de recherche Icons8, ou "#ID" epingle.
#
# Le nom de gauche est celui que le composant Icon recevra. Il est en
# kebab-case et decrit l'INTENTION, pas le dessin : `quitter` et non `porte`.
#
# Un "#ID" epingle une icone precise. On epingle des qu'un choix a ete arbitre
# a la main, parce que la recherche par terme derive : `no wifi` renvoyait
# "No Image", `heart` renvoyait "Two Hearts" au lieu de l'enseigne de carte.
# Ce qui reste en terme libre est un cas ou le premier resultat etait le bon.
ICONES = {
    # navigation et actions de base
    "accueil": "home",
    "retour": "#PzGCi9ZEILQQ",       # Back
    "suivant": "#8291cSibswnB",      # Right Arrow
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
    "quitter": "#oXJj9HtPujRV",      # Open Door
    "recommencer": "restart",
    "chronometre": "timer",
    "horloge": "clock",
    # theme
    "soleil": "sun",
    "lune": "moon",
    # joueurs
    "joueurs": "group",
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
    "roue": "#QTjEXHuvPed5",         # Roulette
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
    # enseignes de cartes
    "pique": "spade",
    "coeur": "#nyw9Ne2SI4Q7",        # Heart, enseigne de carte
    "trefle": "clubs",
    "carreau": "diamonds",
    # systeme, premium, legal
    "cadenas": "lock",
    "bouclier": "#iwaKdaMJh7fX",     # Shield
    "cookie": "cookie",
    "hors-ligne": "#tWXcYDC7hOgs",   # No Connection
}


def http(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {
        "User-Agent": "bacchus-vendor-icons/1.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def resoudre(terme):
    """Retourne (id, nom). Un terme prefixe de '#' est un ID deja arbitre."""
    if terme.startswith("#"):
        return terme[1:], "(epingle)"
    q = urllib.parse.urlencode({
        "term": terme, "platform": PLATFORM, "amount": 1,
        "offset": 0, "language": "en"})
    data = json.loads(http(f"{RECHERCHE}?{q}"))
    icons = data.get("icons") or []
    if not icons:
        return None, None
    return icons[0]["id"], icons[0]["name"]


def telecharger(icon_id, chemin):
    q = urllib.parse.urlencode({"id": icon_id, "format": FORMAT,
                                "size": TAILLE})
    contenu = http(f"{TELECHARGEMENT}?{q}")
    if len(contenu) < 200:
        raise ValueError(f"reponse trop courte ({len(contenu)} octets)")
    with open(chemin, "wb") as fh:
        fh.write(contenu)
    return len(contenu)


def main():
    force = "--force" in sys.argv
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
            taille = telecharger(icon_id, fichier)
            manifeste[nom] = {"id": icon_id, "terme": terme, "titre": titre,
                              "platform": PLATFORM, "format": FORMAT,
                              "octets": taille}
            print(f"  OK          {nom:<16} {titre:<22} {taille:>6} o")
            ok += 1
            time.sleep(0.15)
        except (urllib.error.URLError, ValueError, KeyError) as e:
            print(f"  ECHEC       {nom:<16} {e}")
            echec += 1

    with open(MANIFESTE, "w", encoding="utf-8") as fh:
        json.dump({
            "source": "Icons8",
            "platform": PLATFORM,
            "format": FORMAT,
            "taille": TAILLE,
            "licence": "Icons8 - attribution requise sur le plan gratuit, "
                       "voir https://icons8.com/license",
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
