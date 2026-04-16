import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join, resolve, extname } from 'path'

const SKIP_EXTENSIONS = new Set(['.pdf'])

function copyPublicFiltered() {
  return {
    name: 'copy-public-filtered',
    closeBundle() {
      const publicDir = resolve(__dirname, 'public')
      const outDir = resolve(__dirname, 'dist')

      function copyRecursive(src, dest) {
        const stat = statSync(src)
        if (stat.isDirectory()) {
          mkdirSync(dest, { recursive: true })
          for (const entry of readdirSync(src)) {
            copyRecursive(join(src, entry), join(dest, entry))
          }
        } else if (!SKIP_EXTENSIONS.has(extname(src).toLowerCase())) {
          copyFileSync(src, dest)
        }
      }

      copyRecursive(publicDir, outDir)
    },
  }
}

export default defineConfig({
  plugins: [react(), copyPublicFiltered()],
  publicDir: false,
})
