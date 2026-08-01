// PWA icon generator - renders public/icon.svg to every required PNG.
// Reproducible asset script (documentation rule): node scripts/generate-icons.js
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const src = join(pub, 'icon.svg')

const BRAND_BG = '#FFF9F0'

// Android / PWA ladder + iOS apple-touch sizes. Every file the manifest or
// index.html references is produced here - never hand-edited.
const targets = [
  // Android / PWA
  { file: 'pwa-48x48.png', size: 48 },
  { file: 'pwa-72x72.png', size: 72 },
  { file: 'pwa-96x96.png', size: 96 },
  { file: 'pwa-144x144.png', size: 144 },
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-256x256.png', size: 256 },
  { file: 'pwa-384x384.png', size: 384 },
  { file: 'pwa-512x512.png', size: 512 },
  // iOS home screen
  { file: 'apple-touch-icon-120x120.png', size: 120 },
  { file: 'apple-touch-icon-152x152.png', size: 152 },
  { file: 'apple-touch-icon-167x167.png', size: 167 },
  { file: 'apple-touch-icon.png', size: 180 },
  // Favicon fallback
  { file: 'favicon.png', size: 48 },
]

for (const { file, size } of targets) {
  await sharp(src, { density: 300 }).resize(size, size).png().toFile(join(pub, file))
  console.log(`ok ${file}`)
}

// Maskable icons: glyph at ~66% of the canvas on the brand background, so Android's
// circle mask never crops the logo (PWA maskable safe zone).
for (const size of [192, 512]) {
  const glyphSize = Math.round(size * 0.66)
  const offset = Math.round((size - glyphSize) / 2)
  const glyph = await sharp(src, { density: 300 }).resize(glyphSize, glyphSize).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: BRAND_BG },
  })
    .composite([{ input: glyph, left: offset, top: offset }])
    .png()
    .toFile(join(pub, `pwa-${size}x${size}-maskable.png`))
  console.log(`ok pwa-${size}x${size}-maskable.png`)
}

// iPhone splash screen: icon centered on brand background.
const splashW = 1242
const splashH = 2688
const icon = await sharp(src, { density: 300 }).resize(620, 620).png().toBuffer()
await sharp({
  create: { width: splashW, height: splashH, channels: 4, background: BRAND_BG },
})
  .composite([{ input: icon, left: Math.round((splashW - 620) / 2), top: Math.round((splashH - 620) / 2) }])
  .png()
  .toFile(join(pub, 'apple-splash.png'))
console.log('ok apple-splash.png')
