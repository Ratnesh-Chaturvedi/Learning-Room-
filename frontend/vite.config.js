import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

let tailwindcssPlugin = null
try {
  const tw = await import('@tailwindcss/vite')
  tailwindcssPlugin = tw.default
} catch (e) {
  // Optional until `npm install` finishes
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    fs: {
      strict: false,
      allow: ['..', 'C:/Users/chatu/.gemini'],
    },
  },
  plugins: [
    react(),
    ...(tailwindcssPlugin ? [tailwindcssPlugin()] : []),
  ],
})

