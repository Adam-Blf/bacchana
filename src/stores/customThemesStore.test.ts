import { beforeEach, describe, expect, it } from 'vitest'
import { CUSTOM_THEME_MAX_LENGTH, useCustomThemesStore } from './customThemesStore'

describe('customThemesStore', () => {
  beforeEach(() => {
    useCustomThemesStore.setState({ themes: [] })
  })

  it('adds a trimmed theme, enabled by default', () => {
    const ok = useCustomThemesStore.getState().add('  Des ponts de Paris  ')
    expect(ok).toBe(true)
    const [theme] = useCustomThemesStore.getState().themes
    expect(theme.text).toBe('Des ponts de Paris')
    expect(theme.enabled).toBe(true)
  })

  it('rejects empty or whitespace-only input', () => {
    expect(useCustomThemesStore.getState().add('   ')).toBe(false)
    expect(useCustomThemesStore.getState().themes).toHaveLength(0)
  })

  it('clamps text to the max length', () => {
    useCustomThemesStore.getState().add('x'.repeat(500))
    expect(useCustomThemesStore.getState().themes[0].text).toHaveLength(CUSTOM_THEME_MAX_LENGTH)
  })

  it('removes and toggles themes', () => {
    const { add } = useCustomThemesStore.getState()
    add('Des fromages qui puent')
    add('Des excuses de retard')
    const [a, b] = useCustomThemesStore.getState().themes

    useCustomThemesStore.getState().toggle(a.id)
    expect(useCustomThemesStore.getState().themes.find((t) => t.id === a.id)?.enabled).toBe(false)

    useCustomThemesStore.getState().remove(b.id)
    expect(useCustomThemesStore.getState().themes).toHaveLength(1)
  })

  it('exposes only enabled themes as auction themes, with a custom- id prefix', () => {
    const { add } = useCustomThemesStore.getState()
    add('Des personnages de jeux vidéo')
    add('Des desserts de grand-mère')
    const [a] = useCustomThemesStore.getState().themes
    useCustomThemesStore.getState().toggle(a.id)

    const pool = useCustomThemesStore.getState().getAuctionThemes()
    expect(pool).toHaveLength(1)
    expect(pool[0].id.startsWith('custom-')).toBe(true)
    expect(pool[0].text).toBe('Des desserts de grand-mère')
  })
})
