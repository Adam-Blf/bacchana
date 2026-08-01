// PWA icon generator - renders public/icon.svg to every required PNG.
// Reproducible asset script (documentation rule): node scripts/generate-icons.js
import sharp from 'sharp'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const pub = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
const src = join(pub, 'icon.svg')

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'favicon.png', size: 48 },
]

for (const { file, size } of targets) {
  await sharp(src, { density: 300 }).resize(size, size).png().toFile(join(pub, file))
  console.log(`ok ${file}`)
}

// iPhone splash screen: icon centered on brand background.
const splashW = 1242
const splashH = 2688
const icon = await sharp(src, { density: 300 }).resize(620, 620).png().toBuffer()
await sharp({
  create: { width: splashW, height: splashH, channels: 4, background: '#09090B' },
})
  .composite([{ input: icon, left: Math.round((splashW - 620) / 2), top: Math.round((splashH - 620) / 2) }])
  .png()
  .toFile(join(pub, 'apple-splash.png'))
console.log('ok apple-splash.png')
