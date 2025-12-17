import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: false
    },
    build: {
        sourcemap: true,
        chunkSizeWarningLimit: 1000,
        minify: 'esbuild',
        target: 'es2015',
        cssCodeSplit: true,
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
        include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
        exclude: [],
    }
})
