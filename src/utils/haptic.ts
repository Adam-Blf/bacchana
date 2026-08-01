// Haptic feedback wrapper - silently no-ops on unsupported platforms
export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error'

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 30,
  heavy: 50,
  success: [30, 50, 30],
  warning: [50, 100, 50],
  error: [80, 40, 80, 40, 80],
}

export function haptic(pattern: HapticPattern = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return
  try {
    navigator.vibrate(PATTERNS[pattern])
  } catch {
    /* ignore */
  }
}
