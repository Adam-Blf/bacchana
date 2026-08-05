#!/usr/bin/env node
/**
 * Cree ou met a jour le dashboard PostHog "Produit - activation et conversion premium"
 * et ses insights depuis docs/posthog/insights.json (source de verite unique, alignee sur
 * les evenements reellement emis par src/lib/analytics.ts).
 *
 * Idempotent (regle CLAUDE.md 17.8) : relançable sans doublon, matche par nom exact dans
 * le projet PostHog. Gated par env - sans POSTHOG_PERSONAL_API_KEY, affiche la marche a
 * suivre et sort en 0 (jamais d'echec de build pour un outil d'exploitation manuel).
 *
 * Usage : POSTHOG_PERSONAL_API_KEY=phx_xxx node scripts/posthog-setup.mjs
 * La cle est un Personal API Key PostHog (scope minimal : insight:read, insight:write,
 * dashboard:read, dashboard:write sur le projet 238190), jamais commitee - voir .env.example.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SPEC_PATH = join(__dirname, '..', 'docs', 'posthog', 'insights.json')

const API_KEY = process.env.POSTHOG_PERSONAL_API_KEY

if (!API_KEY) {
  console.log(
    [
      'POSTHOG_PERSONAL_API_KEY absente : rien a faire (mode gated, voir docs/OBSERVABILITE.md).',
      '',
      'Pour lancer la synchronisation :',
      '  1. PostHog > Settings > Personal API Keys > New (scopes insight:read/write,',
      '     dashboard:read/write, projet EU 238190 uniquement).',
      '  2. POSTHOG_PERSONAL_API_KEY=phx_xxx node scripts/posthog-setup.mjs',
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
    const detail = await res.text().catch(() => '')
    throw new Error(`${method} ${path} -> ${res.status} ${res.statusText} : ${detail}`)
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
    filters: insight.posthog_filters,
    dashboards: [dashboardId],
  }

  if (existing) {
    await api('PATCH', `/insights/${existing.id}/`, payload)
    console.log(`  - mis a jour : ${insight.name}`)
    return
  }

  await api('POST', '/insights/', payload)
  console.log(`  - cree : ${insight.name}`)
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
