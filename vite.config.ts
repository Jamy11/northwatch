import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

// MapLibre resolves its worker script at runtime as a URL relative to
// import.meta.url of whatever file it ends up bundled into, rather than a
// static `new Worker(new URL(...))` call bundlers can auto-detect and split
// into its own chunk. So neither the worker file nor the module it imports
// (maplibre-gl-shared.mjs) ever get emitted on their own; copy both into the
// same output directory MapLibre will look for them in.
function copyMaplibreWorker(): Plugin {
  const files = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']
  return {
    name: 'copy-maplibre-worker',
    apply: 'build',
    closeBundle() {
      const destDir = resolve(rootDir, 'dist/assets')
      mkdirSync(destDir, { recursive: true })
      for (const file of files) {
        copyFileSync(
          resolve(rootDir, 'node_modules/maplibre-gl/dist', file),
          resolve(destDir, file),
        )
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/northwatch/',
  plugins: [react(), copyMaplibreWorker()],
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
