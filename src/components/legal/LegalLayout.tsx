import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Button, Icon } from '@/components/ui'
import { useAppStore } from '@/stores'

interface LegalLayoutProps {
  title: string
  version: string
  children: ReactNode
}

/**
 * Shared shell for the three legal pages (mentions legales, confidentialite, CGU/CGV).
 * Content only, no markdown dependency - see docs/legal source in bacchana-content.
 */
export function LegalLayout({ title, version, children }: LegalLayoutProps) {
  const { goToHub } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="min-h-screen bg-bg"
    >
      <header className="sticky top-0 pt-safe z-30 bg-bg border-b border-border">
        <div className="max-w-prose mx-auto px-4 py-4 flex items-center">
          <Button variant="ghost" onClick={goToHub} className="mr-3" aria-label="Retour au hub">
            <Icon name="retour" className="w-5 h-5" aria-hidden="true" />
          </Button>
          <h1 className="font-display text-xl uppercase tracking-tight text-ink">{title}</h1>
        </div>
      </header>

      <main className="max-w-prose mx-auto px-5 py-8 pb-safe">
        <p className="text-ink-muted font-mono text-xs uppercase tracking-widest mb-8">{version}</p>
        <div className="space-y-8">{children}</div>
      </main>
    </motion.div>
  )
}

interface LegalSectionProps {
  title: string
  children: ReactNode
}

/** One numbered section (h2) of a legal page, with its paragraphs/lists as children. */
export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="font-display text-lg uppercase tracking-tight text-ink mb-3">{title}</h2>
      <div className="text-ink-secondary font-sans leading-relaxed space-y-3 [&_strong]:text-ink [&_strong]:font-semibold [&_a]:text-orange-ink [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </section>
  )
}

interface LegalTableProps {
  headers: string[]
  rows: ReactNode[][]
}

/** Small responsive data table for sub-processor / retention lists. */
export function LegalTable({ headers, rows }: LegalTableProps) {
  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-mono text-[10px] uppercase tracking-widest text-ink-muted px-3 py-2 border-b border-border"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-bg-raised even:bg-transparent">
              {row.map((cell, j) => (
                <td key={j} className="align-top px-3 py-2 border-b border-border text-ink-secondary">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Amber review callout for points still pending a legal/ops sign-off (SIRET, mediateur...). */
export function LegalReviewNote({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-mono text-premium bg-premium/10 border border-premium/30 rounded-control px-3 py-2">
      {children}
    </p>
  )
}
