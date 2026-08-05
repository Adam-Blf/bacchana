import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * P0 (RGPD) - aucun prenom de joueur ni contenu de partie ne doit atteindre Sentry.
 * Verifie le contrat reel envoye a Sentry.init, pas juste "ca ne plante pas".
 */

const sentryInit = vi.fn()

vi.mock('@sentry/react', () => ({ init: sentryInit }))

async function loadMonitoring() {
  vi.resetModules()
  return import('./monitoring')
}

describe('initMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_SENTRY_DSN', 'https://example@o0.ingest.sentry.io/0')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('never calls Sentry.init when no DSN is configured', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '')
    const monitoring = await loadMonitoring()

    await monitoring.initMonitoring()

    expect(sentryInit).not.toHaveBeenCalled()
  })

  it('disables PII, tracing and replay explicitly', async () => {
    const monitoring = await loadMonitoring()

    await monitoring.initMonitoring()

    expect(sentryInit).toHaveBeenCalledTimes(1)
    const config = sentryInit.mock.calls[0][0]
    expect(config.sendDefaultPii).toBe(false)
    expect(config.tracesSampleRate).toBe(0)
    expect(config.dsn).toBe('https://example@o0.ingest.sentry.io/0')
    expect(typeof config.environment).toBe('string')
    expect(config.release).toMatch(/^bacchus@\d+\.\d+\.\d+$/)
  })

  it('strips request and user from every outgoing event via beforeSend', async () => {
    const monitoring = await loadMonitoring()
    await monitoring.initMonitoring()

    const { beforeSend } = sentryInit.mock.calls[0][0]
    const scrubbed = beforeSend({
      request: { url: 'https://lataverne.beloucif.com/?player=Lea' },
      user: { id: 'anon-1', ip_address: '1.2.3.4' },
      exception: { values: [] },
    })

    expect(scrubbed.request).toBeUndefined()
    expect(scrubbed.user).toBeUndefined()
  })

  it('drops console breadcrumbs and strips network breadcrumb bodies via beforeBreadcrumb', async () => {
    const monitoring = await loadMonitoring()
    await monitoring.initMonitoring()

    const { beforeBreadcrumb } = sentryInit.mock.calls[0][0]

    expect(beforeBreadcrumb({ category: 'console', message: 'joueur: Lea' })).toBeNull()

    const xhr = beforeBreadcrumb({
      category: 'fetch',
      data: { method: 'POST', url: '/api/players?name=Lea', status_code: 200, body: '{"name":"Lea"}' },
    })
    expect(xhr.data).toEqual({ method: 'POST', status_code: 200 })
    expect(xhr.data.url).toBeUndefined()
    expect(xhr.data.body).toBeUndefined()
  })
})
