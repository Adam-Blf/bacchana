/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Bacchus',
        short_name: 'Bacchus',
        description: 'Bacchus - Les meilleurs jeux de soirée, réunis dans une seule app',
        // theme_color colore le chrome OS (barre de statut Android, carte du
        // multitâche) une fois l'app lancée : doit matcher l'interface réelle
        // (crème), pas le logo. background_color peint le splash Android au
        // premier lancement, DERRIÈRE l'icône : reste pourpre pour se fondre
        // avec le fond plein-pourpre de icon.svg (couture invisible). Les deux
        // valeurs divergent volontairement - voir CHANGELOG 0.37.0.
        theme_color: '#fff9f0',
        background_color: '#5B2C87',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-48x48.png', sizes: '48x48', type: 'image/png' },
          { src: 'pwa-72x72.png', sizes: '72x72', type: 'image/png' },
          { src: 'pwa-96x96.png', sizes: '96x96', type: 'image/png' },
          { src: 'pwa-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-256x256.png', sizes: '256x256', type: 'image/png' },
          { src: 'pwa-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          // Padded variants (glyph at ~66% of the canvas) so Android's circle
          // mask never crops the logo.
          { src: 'pwa-192x192-maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-512x512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Facturation et analytics sont charges a la demande : les precacher imposait
        // 1 Mo de telechargement a tout visiteur, y compris celui qui refuse les
        // cookies et n'ouvre jamais le paywall.
        globIgnores: ['**/vendor-billing-*.js', '**/vendor-analytics-*.js'],
        // Fonts are self-hosted (no-CDN rule) - precache covers them via globPatterns.
        runtimeCaching: [],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('zustand')) return 'vendor-state'
            if (id.includes('posthog-js')) return 'vendor-analytics'
            if (id.includes('@revenuecat')) return 'vendor-billing'
            return 'vendor'
          }
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
