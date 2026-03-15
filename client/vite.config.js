import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig(({ mode }) => {

  return {
    plugins: [react()],
    define: {
      'process.env': {
        DOMAIN_URL: process.env.VITE_API_URL
      }
    }
  }
})