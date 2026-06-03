import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'PinkFit - Couple Fitness & Nutrition Tracker',
        short_name: 'PinkFit',
        description: 'Track workouts and meals with a cute pastel UI, shared with your partner!',
        theme_color: '#FFF0F3',
        background_color: '#FFFDF9',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    allowedHosts: true,
    proxy: {
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/running': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/nutrition': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/social': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
