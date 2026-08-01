import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './Button'
import { useBackClose } from '@/hooks/useBackClose'
import { useKeyboard } from '@/hooks/useKeyboard'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  /** Unique overlay id for back-button handling. */
  id: string
  onConfirm: () => void
  onClose: () => void
}

/**
 * Small confirmation modal for destructive actions (quit mid-game, reset).
 * Closes on backdrop tap, Escape, and the hardware back button.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Annuler',
  id,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useBackClose(open, onClose, id)
  useKeyboard({ Escape: onClose }, open)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-black/70 flex items-center justify-center px-6"
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xs rounded-card bg-surface-elevated border border-border-strong p-6"
          >
            <h3 className="font-display text-xl uppercase tracking-tight text-ink text-center">
              {title}
            </h3>
            <p className="text-ink-secondary font-sans text-sm mt-2 text-center leading-relaxed">
              {message}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Button variant="primary" className="w-full" onClick={onConfirm}>
                {confirmLabel}
              </Button>
              <Button variant="ghost" className="w-full" onClick={onClose}>
                {cancelLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
