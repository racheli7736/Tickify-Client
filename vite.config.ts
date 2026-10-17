import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Tickify API allows CORS only from http://localhost:5173 (see Cors:AllowedOrigins in the API),
// so the dev server must use exactly this port and fail instead of silently picking another one.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
