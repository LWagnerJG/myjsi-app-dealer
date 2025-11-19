import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        strictPort: true
    },
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'framer': ['framer-motion'],
                    'icons': ['lucide-react']
                }
            }
        },
        minify: 'esbuild',
        target: 'es2015'
    },
    esbuild: {
        jsxInject: `import React from 'react'`
    }
})
