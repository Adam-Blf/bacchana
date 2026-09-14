/**
 * Preuve que `check_transitions` refuse ce qu'elle dit refuser.
 *
 * CLAUDE.md 17.5bis : une garde qu'on n'a jamais vue rouge ne garde rien. Les
 * regressions ci-dessous sont jouees dans une COPIE jetable de l'arborescence,
 * jamais dans le depot : `RACINE_TRANSITIONS` n'existe que pour ca.
 *
 * Les quatre premieres doivent la faire echouer. La derniere - un `exit` sur
 * un panneau interne - doit la laisser verte : une garde qui accuse ce qui va
 * bien finit desactivee, et cette application vit de ses animations internes.
 */
import { cpSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const GARDE = join(process.cwd(), 'scripts/gardes/check_transitions.mjs')

const CAS = [
  {
    nom: 'exit rendu a la racine du palmares',
    rouge: true,
    appliquer: (racine) => {
      const f = join(racine, 'src/components/screens/PalmaresScreen.tsx')
      const s = readFileSync(f, 'utf8')
      writeFileSync(
        f,
        s.replace(
          "      transition={{ duration: 0.18 }}\n      className=\"h-dvh flex flex-col bg-bg\"",
          "      exit={{ opacity: 0, x: 50 }}\n      transition={{ type: 'spring', damping: 25, stiffness: 200 }}\n      className=\"h-dvh flex flex-col bg-bg\""
        )
      )
    },
  },
  {
    nom: 'exit rendu a la racine d une page legale',
    rouge: true,
    appliquer: (racine) => {
      const f = join(racine, 'src/components/legal/LegalLayout.tsx')
      const s = readFileSync(f, 'utf8')
      writeFileSync(f, s.replace('      transition={{ duration: 0.18 }}', '      exit={{ opacity: 0 }}'))
    },
  },
  {
    nom: 'exit ecrit APRES la classe, sur plusieurs lignes',
    rouge: true,
    appliquer: (racine) => {
      const f = join(racine, 'src/components/screens/CatalogueScreen.tsx')
      const s = readFileSync(f, 'utf8')
      writeFileSync(
        f,
        s.replace(
          '      className="h-dvh flex flex-col bg-bg"',
          '      className="h-dvh flex flex-col bg-bg"\n      exit={{\n        opacity: 0,\n      }}'
        )
      )
    },
  },
  {
    nom: 'un ecran du menu redeclare en lazy() dans App.tsx',
    rouge: true,
    appliquer: (racine) => {
      const f = join(racine, 'src/App.tsx')
      const s = readFileSync(f, 'utf8')
      writeFileSync(
        f,
        s.replace(
          'function App() {',
          "const PalmaresScreen = lazy(() =>\n  import('@/components/screens/PalmaresScreen').then((m) => ({ default: m.PalmaresScreen }))\n)\n\nfunction App() {"
        )
      )
    },
  },
  {
    nom: 'exit sur un panneau INTERNE (doit rester vert)',
    rouge: false,
    appliquer: (racine) => {
      const f = join(racine, 'src/components/screens/CatalogueScreen.tsx')
      const s = readFileSync(f, 'utf8')
      writeFileSync(
        f,
        s.replace(
          '      className="h-dvh flex flex-col bg-bg"\n    >',
          '      className="h-dvh flex flex-col bg-bg"\n    >\n      <motion.div exit={{ opacity: 0, y: 20 }} className="p-4" />'
        )
      )
    },
  },
]

let echecs = 0
for (const cas of CAS) {
  const racine = mkdtempSync(join(tmpdir(), 'garde-transitions-'))
  cpSync('src', join(racine, 'src'), { recursive: true })
  cas.appliquer(racine)
  let verte = true
  try {
    execFileSync('node', [GARDE], { env: { ...process.env, RACINE_TRANSITIONS: racine }, stdio: 'pipe' })
  } catch {
    verte = false
  }
  rmSync(racine, { recursive: true, force: true })
  const attendu = cas.rouge ? !verte : verte
  console.log(`  ${attendu ? 'ok  ' : 'RATE'}  ${cas.nom} ${cas.rouge ? '(doit echouer)' : '(doit passer)'}`)
  if (!attendu) echecs++
}

if (echecs) {
  console.error(`\n${echecs} regression(s) que check_transitions ne juge pas comme annonce.\n`)
  process.exit(1)
}
console.log(`\nPreuve : check_transitions juge correctement les ${CAS.length} cas.`)
