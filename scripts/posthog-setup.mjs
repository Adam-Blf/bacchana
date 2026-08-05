#!/usr/bin/env node
/**
 * Cree ou met a jour le dashboard PostHog "Produit - activation et conversion premium"
 * et ses insights depuis docs/posthog/insights.json (source de verite unique, alignee sur
 * les evenements reellement emis par src/lib/analytics.ts).
 *
 * Format des insights : `query` (InsightVizNode), pas `filters`. PostHog refuse desormais
 * toute creation/mise a jour d'insight au format `filters` herite (403 permission_denied,
 * "Creating or updating insights with legacy filters is not available for this user.") -
 * verifie en conditions reelles le 2026-08-05. Si un insight existant est encore au format
 * legacy, on ne peut pas le PATCHer : `ensureInsight` le supprime puis le recree au format
 * `query`.
 *
 * Idempotent (regle CLAUDE.md 17.8) : relançable sans doublon, matche par nom exact dans
 * le projet PostHog. Gated par env - sans cle, affiche la marche a suivre et sort en 0
 * (jamais d'echec de build pour un outil d'exploitation manuel).
 *
 * Cle : `POSTHOG_PERSONAL_API_KEY`, lue depuis l'environnement du shell en priorite, sinon
 * depuis `.env.local` (gitignore) en repli - jamais loggee, meme tronquee.
 *
 * Usage : POSTHOG_PERSONAL_API_KEY=phx_xxx node scripts/posthog-setup.mjs
 * ou, avec .env.local rempli : node scripts/posthog-setup.mjs
 * La cle est un Personal API Key PostHog (scope minimal : insight:read, insight:write,
 * dashboard:read, dashboard:write sur le projet 238190), jamais commitee - voir .env.example.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPEC_PATH = join(__dirname, '..', 'docs', 'posthog', 'insights.json')
const ENV_LOCAL_PATH = join(__dirname, '..', '.env.local')

/**
 * Repli .env.local minimal (pas de dependance `dotenv`) : ne lit que ce qui manque encore
 * dans `process.env`, ne logge jamais une valeur - seulement le nom des cles trouvees.
 */
function loadEnvLocalFallback() {
  let raw
  try {
    raw = readFileSync(ENV_LOCAL_PATH, 'utf-8')
  } catch {
    return // Pas de .env.local - rien a faire, process.env reste la seule source.
  }

  const found = []
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue // L'environnement du shell prime toujours sur le fichier.
    const value = rawValue.trim().replace(/^['"]|['"]$/g, '')
    if (!value) continue
    process.env[key] = value
    found.push(key)
  }
  if (found.length > 0) {
    console.log(`.env.local : ${found.length} variable(s) chargee(s) en repli (${found.join(', ')}).`)
  }
}

loadEnvLocalFallback()

const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY

if (!API_KEY) {
  console.log(
    [
      'POSTHOG_PERSONAL_API_KEY absente (ni env, ni .env.local) : rien a faire (mode gated,',
      'voir docs/OBSERVABILITE.md).',
      '',
      'Pour lancer la synchronisation :',
      '  1. PostHog > Settings > Personal API Keys > New (scopes insight:read/write,',
      '     dashboard:read/write, projet EU 238190 uniquement).',
      '  2. Coller la cle dans .env.local (POSTHOG_PERSONAL_API_KEY=phx_xxx), ou',
      '     POSTHOG_PERSONAL_API_KEY=phx_xxx node scripts/posthog-setup.mjs',
      '  3. Revoquer la cle une fois la synchronisation terminee (usage ponctuel, pas un',
      '     secret qui doit vivre en permanence dans un .env).',
    ].join('\n')
  )
  process.exit(0)
}

const spec = JSON.parse(readFileSync(SPEC_PATH, 'utf-8'))
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID ?? spec.project_id
const HOST = spec.host
const BASE = `${HOST}/api/projects/${PROJECT_ID}`

class ApiError extends Error {
  constructor(method, path, status, statusText, body) {
    super(`${method} ${path} -> ${status} ${statusText} : ${typeof body === 'string' ? body : JSON.stringify(body)}`)
    this.status = status
    this.body = body
  }
}

/** True for the exact rejection PostHog returns on legacy-`filters` insight writes. */
function isLegacyFiltersRejection(err) {
  return err instanceof ApiError && err.status === 403 && err.body?.code === 'permission_denied'
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let parsed = text
    try {
      parsed = JSON.parse(text)
    } catch {
      // Reponse non-JSON (rare, ex. erreur proxy) - on garde le texte brut.
    }
    throw new ApiError(method, path, res.status, res.statusText, parsed)
  }
  return res.status === 204 ? null : res.json()
}

async function findByExactName(path, name) {
  const page = await api('GET', `${path}?search=${encodeURIComponent(name)}`)
  return page.results.find((item) => item.name === name) ?? null
}

async function ensureDashboard() {
  const { name, known_id: knownId, description } = spec.dashboard

  if (knownId) {
    try {
      const existing = await api('GET', `/dashboards/${knownId}/`)
      console.log(`Dashboard existant reutilise : "${existing.name}" (id ${existing.id})`)
      return existing.id
    } catch {
      // L'id documente n'existe pas (autre projet, jamais cree) - on retombe sur la
      // recherche par nom puis la creation.
    }
  }

  const byName = await findByExactName('/dashboards/', name)
  if (byName) {
    console.log(`Dashboard existant reutilise (par nom) : "${byName.name}" (id ${byName.id})`)
    return byName.id
  }

  const created = await api('POST', '/dashboards/', { name, description })
  console.log(`Dashboard cree : "${created.name}" (id ${created.id})`)
  return created.id
}

async function ensureInsight(dashboardId, insight) {
  const existing = await findByExactName('/insights/', insight.name)
  const payload = {
    name: insight.name,
    query: insight.posthog_query,
    dashboards: [dashboardId],
  }

  if (!existing) {
    const created = await api('POST', '/insights/', payload)
    console.log(`  - cree : ${insight.name} (id ${created.id})`)
    return
  }

  try {
    const updated = await api('PATCH', `/insights/${existing.id}/`, payload)
    console.log(`  - mis a jour : ${insight.name} (id ${updated.id})`)
  } catch (err) {
    if (!isLegacyFiltersRejection(err)) throw err
    // L'insight existant est encore au format `filters` herite : PostHog refuse le PATCH
    // vers `query` sur cette meme ressource. On le remplace proprement (supprime puis recree)
    // plutot que d'echouer - le nom et le rattachement au dashboard sont preserves.
    await api('DELETE', `/insights/${existing.id}/`)
    const created = await api('POST', '/insights/', payload)
    console.log(`  - remplace (ancien format filters -> query) : ${insight.name} (id ${created.id})`)
  }
}

async function main() {
  console.log(`PostHog EU, projet ${PROJECT_ID} - synchronisation depuis ${SPEC_PATH}\n`)
  const dashboardId = await ensureDashboard()
  console.log('\nInsights :')
  for (const insight of spec.insights) {
    await ensureInsight(dashboardId, insight)
  }
  console.log(`\nTermine. Dashboard : ${HOST}/project/${PROJECT_ID}/dashboard/${dashboardId}`)
}

main().catch((err) => {
  console.error(`Echec de la synchronisation PostHog : ${err.message}`)
  process.exit(1)
})
