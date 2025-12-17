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
        // Increase warning threshold since we're optimizing progressively
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                // Optimize chunking for performance
                manualChunks: (id) => {
                    // React core - smallest possible vendor chunk
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
                        return 'react-vendor';
                    }
                    // Framer Motion - loaded on demand for animations
                    if (id.includes('framer-motion')) {
                        return 'framer';
                    }
                    // Lucide icons - tree-shaken but still sizable
                    if (id.includes('lucide-react')) {
                        return 'icons';
                    }
                    // Date/time utilities
                    if (id.includes('date-fns') || id.includes('dayjs') || id.includes('moment')) {
                        return 'date-utils';
                    }
                },
                // Cleaner chunk names
                chunkFileNames: 'assets/[name]-[hash:8].js',
                entryFileNames: 'assets/[name]-[hash:8].js',
                assetFileNames: 'assets/[name]-[hash:8].[ext]',
            }
        },
        minify: 'esbuild',
        target: 'es2015',
        // Enable CSS code splitting
        cssCodeSplit: true,
    },
    // Optimize dependency pre-bundling
    optimizeDeps: {
        include: ['react', 'react-dom', 'framer-motion', 'lucide-react'],
        exclude: [],
    }
})
