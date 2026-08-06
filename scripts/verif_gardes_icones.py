"""Prouve que les deux gardes d'icones echouent quand elles le doivent.

Regle du chantier : une garde jamais vue rouge ne garde rien (CLAUDE.md 17.5bis,
gravee apres trois defauts successifs de `check_tile_ink.mjs`, tous trouves par
regression volontaire et aucun par relecture).

Ce script reintroduit, une par une, les regressions que les gardes pretendent
attraper, et exige l'echec a chaque fois. Les regressions ne sont pas
theoriques, elles ont toutes eu lieu sur ce depot :

  - `spade` en terme libre a livre une BECHE DE JARDIN pour l'enseigne pique,
    sous un nom Icons8 qui disait pourtant "Spade" ;
  - six epingles heritees de `forma-bold-sharp` ont ramene des filets fins au
    milieu du jeu `ios_filled`, sans aucune erreur, parce qu'un identifiant
    Icons8 appartient a un seul style et que l'URL de telechargement ne prend
    que l'identifiant ;
  - la migration lucide a laisse des imports morts qui cassaient le typecheck.

Usage :
    python scripts/verif_gardes_icones.py

Les modifications sont faites sur le disque puis restaurees, y compris si une
garde plante : chaque cas est encadre par un try/finally.
"""
import json
import os
import shutil
import subprocess
import sys
import tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
echecs = []


def _garde_js():
    r = subprocess.run(["npm", "run", "--silent", "check:icons"], cwd=RACINE,
                       capture_output=True, text=True, shell=True)
    return r.returncode, (r.stdout + r.stderr).strip()


def _attendre_rouge(libelle, casser, reparer, lancer):
    casser()
    try:
        code, sortie = lancer()
        if code == 0:
            echecs.append(libelle)
            print(f"  ROUGE ATTENDU, VERT OBTENU : {libelle}")
        else:
            motif = next((l.strip(" -") for l in sortie.splitlines()
                          if l.strip().startswith("-")), sortie.splitlines()[-1])
            print(f"  rouge obtenu : {libelle}\n      motif : {motif}")
    finally:
        reparer()


def garde_epingles():
    """Garde python : enseignes epinglees, et epingles au style courant."""
    import importlib.util

    chemin = os.path.join(RACINE, "scripts", "vendor_icons8.py")
    spec = importlib.util.spec_from_file_location("vendor_icons8", chemin)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)

    def essai(nom, valeur, libelle):
        sauve = mod.ICONES[nom]
        mod.ICONES[nom] = valeur
        try:
            mod.verifier_epingles()
            echecs.append(libelle)
            print(f"  ROUGE ATTENDU, VERT OBTENU : {libelle}")
        except SystemExit:
            print(f"  rouge obtenu : {libelle}")
        finally:
            mod.ICONES[nom] = sauve

    print("Garde `verifier_epingles`")
    for nom, terme in (("pique", "spade"), ("coeur", "heart"),
                       ("trefle", "clubs"), ("carreau", "diamonds")):
        essai(nom, terme, f"enseigne {nom} revenue en terme libre")
    essai("retour", "#40217", "epingle sans style annonce")
    essai("retour", "#PzGCi9ZEILQQ@forma-bold-sharp", "epingle sous l'ancien style")
    essai("roue", "#9357@ios7", "epingle sous un style voisin")

    try:
        mod.verifier_epingles()
        print("  vert sur l'etat reel")
    except SystemExit as e:
        echecs.append("verifier_epingles echoue sur l'etat reel")
        print("  VERT ATTENDU, ROUGE OBTENU :", e)


def garde_icons():
    """Garde JS : fichiers presents, zero lucide, un seul style."""
    print("\nGarde `check:icons`")
    tmp = tempfile.mkdtemp()

    png = os.path.join(RACINE, "public", "icons", "couronne.png")
    sauve = os.path.join(tmp, "couronne.png")
    _attendre_rouge("un PNG declare mais absent",
                    lambda: shutil.move(png, sauve),
                    lambda: shutil.move(sauve, png), _garde_js)

    cible = os.path.join(RACINE, "src", "components", "ui", "Icon.tsx")
    original = open(cible, encoding="utf-8").read()
    _attendre_rouge(
        "un import lucide-react reintroduit",
        lambda: open(cible, "w", encoding="utf-8").write(
            "import { Crown } from 'lucide-react'\n" + original),
        lambda: open(cible, "w", encoding="utf-8").write(original), _garde_js)

    man = os.path.join(RACINE, "public", "icons", "manifest.json")
    avant = open(man, encoding="utf-8").read()

    def ecrire(mutation):
        d = json.loads(avant)
        mutation(d)
        open(man, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False))

    def restaurer():
        open(man, "w", encoding="utf-8").write(avant)

    _attendre_rouge("un manifeste dont le style ne suit plus le script",
                    lambda: ecrire(lambda d: d.update(platform="forma-bold-sharp")),
                    restaurer, _garde_js)
    _attendre_rouge("deux styles melanges dans le manifeste",
                    lambda: ecrire(lambda d: d["icones"]["couronne"].update(
                        platform="forma-bold-sharp")),
                    restaurer, _garde_js)

    shutil.rmtree(tmp, ignore_errors=True)
    code, sortie = _garde_js()
    if code:
        echecs.append("check:icons echoue sur l'etat reel apres restauration")
        print("  VERT ATTENDU, ROUGE OBTENU :", sortie)
    else:
        print("  vert sur l'etat reel :", sortie.splitlines()[-1])


if __name__ == "__main__":
    garde_epingles()
    garde_icons()
    print()
    if echecs:
        for e in echecs:
            print("DEFAUT DE GARDE, non attrape :", e)
        sys.exit(1)
    print("Les deux gardes sont validees : 11 regressions attrapees, etat reel vert.")
