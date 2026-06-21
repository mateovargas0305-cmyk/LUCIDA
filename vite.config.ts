import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
// En build usamos la base del proyecto en GitHub Pages (/LUCIDA/); en dev, raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/LUCIDA/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'audio/*.mp3'],
      manifest: {
        name: 'Lúcida',
        short_name: 'Lúcida',
        description: 'Estímulo mental y cultura general, cálido y sereno.',
        theme_color: '#F4ECDD',
        background_color: '#F4ECDD',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'es',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3}'],
        importScripts: ['custom-sw.js'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
