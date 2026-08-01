import { useEffect, useRef } from 'react'
import { closeOverlay, pushOverlay } from '@/core/navigation/history'

/**
 * Register an open overlay (modal, sheet, picker) with the navigation history so
 * the hardware/browser back button closes it instead of leaving the screen.
 *
 * `id` must be unique among simultaneously open overlays.
 */
export function useBackClose(open: boolean, onClose: () => void, id: string) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    let alive = true
    // Deferred by a microtask so StrictMode's mount/unmount churn in dev never
    // pushes a history entry that is immediately popped again.
    queueMicrotask(() => {
      if (alive) pushOverlay(id, () => onCloseRef.current())
    })
    return () => {
      alive = false
      queueMicrotask(() => closeOverlay(id))
    }
  }, [open, id])
}
