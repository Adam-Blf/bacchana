import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  bindNavigation,
  navPush,
  navReplace,
  navBack,
  navHome,
  pushOverlay,
  closeOverlay,
  setBackGuard,
  __resetNavigationForTests,
} from './history'
import type { AppScreen } from '@/types'

// jsdom queues history traversal as a task; a 0 ms tick can race it.
// 25 ms was still losing that race on a loaded machine (two failures observed
// on 2026-08-02, both on assertions right after a traversal), so the margin is
// widened. The suite stays under 3 s.
const tick = () => new Promise((r) => setTimeout(r, 100))

describe('navigation history layer', () => {
  let screen: AppScreen
  let applied: AppScreen[]
  let toasts: boolean[]

  beforeEach(() => {
    __resetNavigationForTests()
    screen = 'hub'
    applied = []
    toasts = []
    bindNavigation({
      applyScreen: (s) => {
        screen = s
        applied.push(s)
      },
      getScreen: () => screen,
      onExitToast: (v) => toasts.push(v),
    })
  })

  afterEach(() => {
    __resetNavigationForTests()
    vi.useRealTimers()
  })

  it('pushes screens and applies them', () => {
    navPush('rules')
    expect(screen).toBe('rules')
  })

  it('does not stack duplicate consecutive screens', () => {
    navPush('rules')
    navPush('rules')
    expect(applied).toEqual(['rules'])
  })

  it('hardware back returns to the previous screen', async () => {
    navPush('rules')
    window.history.back()
    await tick()
    expect(screen).toBe('hub')
  })

  it('replace does not add a history entry', async () => {
    navPush('game')
    navReplace('welcome')
    expect(screen).toBe('welcome')
    window.history.back()
    await tick()
    expect(screen).toBe('hub')
  })

  it('navBack goes one step back like the hardware button', async () => {
    navPush('rules')
    navBack()
    await tick()
    expect(screen).toBe('hub')
  })

  it('back closes an open overlay before leaving the screen', async () => {
    navPush('game')
    const onClose = vi.fn()
    pushOverlay('modal-a', onClose)
    window.history.back()
    await tick()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen).toBe('game')
    window.history.back()
    await tick()
    expect(screen).toBe('hub')
  })

  it('UI-initiated overlay close pops its entry without re-firing onClose', async () => {
    navPush('game')
    const onClose = vi.fn()
    pushOverlay('modal-a', onClose)
    closeOverlay('modal-a')
    await tick()
    expect(onClose).not.toHaveBeenCalled()
    expect(screen).toBe('game')
    window.history.back()
    await tick()
    expect(screen).toBe('hub')
  })

  it('navHome unwinds screens and overlays back to the root', async () => {
    navPush('game')
    const onClose = vi.fn()
    pushOverlay('modal-a', onClose)
    navHome()
    await tick()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen).toBe('hub')
  })

  it('a back guard can consume the gesture', async () => {
    navPush('game')
    const guard = vi.fn(() => true)
    setBackGuard(guard)
    window.history.back()
    await tick()
    expect(guard).toHaveBeenCalledTimes(1)
    expect(screen).toBe('game')
    setBackGuard(null)
    window.history.back()
    await tick()
    expect(screen).toBe('hub')
  })

  it('navHome bypasses the back guard', async () => {
    navPush('game')
    setBackGuard(() => true)
    navHome()
    await tick()
    expect(screen).toBe('hub')
  })

  it('backing past the root shows the exit toast and restores the root', async () => {
    window.history.back()
    await tick()
    expect(toasts[0]).toBe(true)
    expect(screen).toBe('hub')
    // The root entry was re-pushed: another back within the window would exit.
    navPush('rules')
    expect(screen).toBe('rules')
  })
})
