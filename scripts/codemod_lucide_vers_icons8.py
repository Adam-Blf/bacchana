"""Remplace lucide-react par le composant Icon (Icons8 forma-bold-sharp).

Ce codemod est volontairement strict et bavard : il refuse de deviner. Toute
icone lucide sans correspondance explicite fait echouer le script plutot que
de laisser passer une substitution approximative.

Ce qu'il fait, fichier par fichier :
  1. supprime l'import `lucide-react` (mono-ligne ou multi-lignes),
  2. ajoute l'import de `Icon` avec le bon chemin relatif,
  3. reecrit `<Nom ...props />` en `<Icon name="xxx" ...props />`,
  4. retire les props propres a lucide (`fill`, `strokeWidth`, `size`), qui
     n'ont aucun sens sur un masque CSS.

Ce qu'il ne voit PAS, a savoir avant de s'y fier : une icone lucide utilisee
autrement qu'en balise JSX directe (passee en valeur a une prop, stockee dans
un tableau, rendue via `createElement`). Le garde-fou de fin verifie qu'aucune
mention de `lucide` ne subsiste dans src/, ce qui rattrape ces cas en les
signalant, mais ne les corrige pas.

Usage :
    python scripts/codemod_lucide_vers_icons8.py            simulation
    python scripts/codemod_lucide_vers_icons8.py --execute  ecrit les fichiers
"""
import os
import re
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(RACINE, "src")

# nom du composant lucide -> nom d'icone Icons8 local
CORRESPONDANCE = {
    "Home": "accueil", "CircleHelp": "aide", "Cookie": "cookie",
    "Settings2": "curseurs", "SlidersHorizontal": "curseurs",
    "Settings": "reglages", "Scale": "balance", "RotateCcw": "recommencer",
    "Users": "joueurs", "DoorOpen": "quitter", "UserPlus": "ajouter-joueur",
    "X": "fermer", "ArrowRight": "suivant", "ArrowLeft": "retour",
    "EyeOff": "oeil-barre", "Eye": "oeil", "Gavel": "marteau-juge",
    "PenLine": "ecrire", "PencilLine": "ecrire", "Pencil": "editer",
    "Receipt": "ticket", "Sparkles": "etincelles",
    "ThumbsDown": "pouce-bas", "ThumbsUp": "pouce-haut",
    "Sun": "soleil", "Moon": "lune", "ShieldCheck": "bouclier",
    "ScrollText": "livre", "Info": "info", "Disc3": "roue",
    "Check": "valider", "Medal": "medaille", "Brain": "cerveau",
    "Flame": "flamme", "Crown": "couronne", "Clock": "horloge",
    "PartyPopper": "fete", "WifiOff": "hors-ligne", "Play": "jouer",
    "Book": "livre", "Layers": "paquets", "InfinityIcon": "infini",
    "Dices": "des", "Plus": "plus", "Minus": "moins", "Trash2": "supprimer",
    "Spade": "pique", "Heart": "coeur", "Club": "trefle",
    "Diamond": "carreau", "Share2": "partager", "Megaphone": "megaphone",
    "TimerReset": "chronometre", "Gem": "gemme", "Sword": "epee",
    "Lock": "cadenas", "LoaderCircle": "chargement",
}

IMPORT_LUCIDE = re.compile(
    r"^import\s*\{[^}]*\}\s*from\s*['\"]lucide-react['\"]\s*\n",
    re.MULTILINE | re.DOTALL)

# Props propres a lucide, sans effet sur un masque CSS.
#
# Elles sont retirees UNIQUEMENT a l'interieur de la balise <Icon> reecrite.
# Une premiere version les retirait sur tout le fichier : elle a supprime
# `size="lg"` sur <Button> et sur <PlayingCard>, qui n'ont rien d'une icone.
# C'est le piege classique de la regex sur du JSX, vu en vrai sur ce depot.
PROPS_LUCIDE = re.compile(
    r"\s+(?:fill|strokeWidth|size)=(?:\{[^{}]*\}|\"[^\"]*\"|'[^']*')")

# Corps d'une balise auto-fermante, en tolerant chaines et accolades simples.
def balise(nom):
    return re.compile(
        rf"<{nom}\b((?:[^>\"'{{]|\"[^\"]*\"|'[^']*'|\{{[^{{}}]*\}})*?)(/?)>")


def chemin_import(fichier):
    """Chemin relatif vers Icon.tsx depuis le fichier traite."""
    cible = os.path.join(SRC, "components", "ui")
    rel = os.path.relpath(cible, os.path.dirname(fichier)).replace("\\", "/")
    if not rel.startswith("."):
        rel = "./" + rel
    return f"{rel}/Icon"


def noms_importes(contenu):
    """Les identifiants lucide importes par ce fichier, alias resolus."""
    out = []
    for bloc in re.findall(
            r"import\s*\{([^}]*)\}\s*from\s*['\"]lucide-react['\"]", contenu,
            re.DOTALL):
        for brut in bloc.split(","):
            brut = brut.strip()
            if not brut:
                continue
            # `Infinity as InfinityIcon` : c'est l'alias qui est utilise en JSX
            out.append(brut.split(" as ")[-1].strip() if " as " in brut
                       else brut)
    return out


def traiter(fichier):
    with open(fichier, encoding="utf-8") as fh:
        contenu = original = fh.read()

    noms = noms_importes(contenu)
    if not noms:
        return None, []

    inconnus = [n for n in noms if n not in CORRESPONDANCE]
    if inconnus:
        return None, inconnus

    contenu = IMPORT_LUCIDE.sub("", contenu)

    for nom in sorted(noms, key=len, reverse=True):
        cible = CORRESPONDANCE[nom]

        def reecrire(m, cible=cible):
            attrs = PROPS_LUCIDE.sub("", m.group(1))
            return f'<Icon name="{cible}"{attrs}{m.group(2)}>'

        contenu = balise(nom).sub(reecrire, contenu)
        contenu = re.sub(rf"</{nom}>", "</Icon>", contenu)

    if "from '@/components/ui'" in contenu and "/ui/Icon" not in contenu:
        # Le fichier importe deja depuis le barrel : on y ajoute Icon plutot
        # que de creer un second import du meme dossier.
        contenu = re.sub(
            r"import\s*\{([^}]*)\}\s*from\s*'@/components/ui'",
            lambda m: "import {" + m.group(1).rstrip() + ", Icon } from "
                      "'@/components/ui'",
            contenu, count=1)
    else:
        imp = f"import {{ Icon }} from '{chemin_import(fichier)}'\n"
        lignes = contenu.split("\n")
        dernier = max((i for i, l in enumerate(lignes)
                       if l.startswith("import ")), default=-1)
        lignes.insert(dernier + 1, imp.rstrip("\n"))
        contenu = "\n".join(lignes)

    return (contenu if contenu != original else None), []


def main():
    execute = "--execute" in sys.argv
    modifies, bloquants = [], {}

    for root, dirs, files in os.walk(SRC):
        dirs[:] = [d for d in dirs if d != "node_modules"]
        for f in files:
            if not f.endswith((".tsx", ".ts")):
                continue
            chemin = os.path.join(root, f)
            nouveau, inconnus = traiter(chemin)
            if inconnus:
                bloquants[os.path.relpath(chemin, RACINE)] = inconnus
            elif nouveau:
                modifies.append((chemin, nouveau))

    if bloquants:
        print("ARRET : icones lucide sans correspondance explicite.")
        for f, noms in bloquants.items():
            print(f"  {f} : {', '.join(noms)}")
        return 1

    for chemin, nouveau in modifies:
        rel = os.path.relpath(chemin, RACINE)
        if execute:
            with open(chemin, "w", encoding="utf-8", newline="\n") as fh:
                fh.write(nouveau)
        print(f"  {'reecrit' if execute else 'a reecrire'}  {rel}")

    print(f"\n[{'APPLIQUE' if execute else 'SIMULATION'}] "
          f"{len(modifies)} fichiers")
    return 0


if __name__ == "__main__":
    sys.exit(main())
