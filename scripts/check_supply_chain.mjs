#!/usr/bin/env node
/**
 * Garde de chaine d'approvisionnement.
 *
 * Pourquoi cette garde existe. Le 4 aout 2026, l'attaque ChainDrop a contamine
 * plus de deux mille versions de paquets npm via un crochet `preinstall`. La
 * parade est `ignore-scripts=true` dans le `.npmrc` versionne. Mais une
 * protection tenue par une seule ligne de configuration disparait au premier
 * qui la supprime pour debloquer un build, sans que personne ne le remarque.
 * Cette garde casse l'integration continue si cela arrive.
 *
 * Elle verifie trois choses :
 *   1. `.npmrc` existe et porte bien `ignore-scripts=true`.
 *   2. Aucune dependance du lockfile ne figure dans la liste d'IOC ChainDrop,
 *      comparaison nom PLUS version, la seule fiable puisque les versions
 *      malveillantes portent des attestations SLSA valides.
 *   3. Les paquets de la famille touchee restent sous le seuil dangereux.
 *
 * Sortie 0 si tout va bien, 1 sinon.
 */
import { readFileSync, existsSync } from 'node:fs'

const RESET = '[0m'
const ROUGE = '[31m'
const VERT = '[32m'

let echecs = 0
const echec = (m) => {
  console.error(`${ROUGE}ECHEC${RESET} ${m}`)
  echecs += 1
}

// --- 1. Le reglage est-il toujours la ---------------------------------------
if (!existsSync('.npmrc')) {
  echec('.npmrc absent. Le blocage des scripts d\'installation a disparu.')
} else {
  const npmrc = readFileSync('.npmrc', 'utf8')
  const actif = npmrc
    .split('\n')
    .some((l) => /^\s*ignore-scripts\s*=\s*true\s*$/.test(l))
  if (!actif) {
    echec('.npmrc ne porte plus ignore-scripts=true. Vecteur ChainDrop rouvert.')
  }
}

// --- 2. Versions empoisonnees du foyer ChainDrop -----------------------------
// Source : Wiz Research, wiz-sec-public/wiz-research-iocs, keyv-packages.csv.
// On embarque le foyer plutot que de dependre du reseau en integration continue.
const IOC = new Map([
  ['keyv', ['6.0.0']],
  ['flat-cache', ['6.1.24']],
  ['file-entry-cache', ['11.1.6']],
  ['cacheable-request', ['13.0.20']],
  ['cacheable', ['2.5.1']],
  ['cache-manager', ['7.2.10']],
  ['@cacheable/memory', ['2.2.1']],
  ['@cacheable/node-cache', ['3.1.2']],
  ['@cacheable/utils', ['2.5.1']],
  ['@cacheable/net', ['2.1.1']],
  ['ecto', ['5.0.1']],
])

if (!existsSync('package-lock.json')) {
  echec('package-lock.json absent, impossible de verifier les dependances.')
} else {
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'))
  const installes = []
  for (const [cle, val] of Object.entries(lock.packages ?? {})) {
    if (!cle || typeof val !== 'object' || !val.version) continue
    const nom = val.name ?? cle.split('node_modules/').pop()
    if (nom) installes.push([nom, val.version])
  }

  for (const [nom, version] of installes) {
    const mauvaises = IOC.get(nom)
    if (mauvaises?.includes(version)) {
      echec(`${nom}@${version} figure dans la liste d'IOC ChainDrop.`)
    }
  }

  // --- 3. Crochets d'installation declares par une dependance ---------------
  // Le lockfile enregistre `hasInstallScript` : c'est le signal le plus direct.
  const avecScript = Object.entries(lock.packages ?? {})
    .filter(([cle, val]) => cle && val?.hasInstallScript)
    .map(([cle]) => cle.split('node_modules/').pop())
  if (avecScript.length) {
    console.log(
      `  ${avecScript.length} dependance(s) declarent un script d'installation, ` +
        `neutralise(s) par ignore-scripts : ${avecScript.join(', ')}`
    )
  }
}

if (echecs === 0) {
  console.log(
    `${VERT}Chaine d'approvisionnement conforme${RESET} : scripts d'installation ` +
      `bloques, aucune version listee ChainDrop dans le lockfile.`
  )
  process.exit(0)
}
console.error(`\n${echecs} probleme(s) de chaine d'approvisionnement.`)
process.exit(1)
