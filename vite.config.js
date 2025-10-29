import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import disableHostCheck from './vite-plugin-disable-host-check.js';

export default defineConfig({
  plugins: [
    react(),
    disableHostCheck(), // Disable host check for tunnels
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0', // Listen on all network interfaces
    strictPort: false,
    hmr: {
      clientPort: 5173,
    },
    // Disable host check for tunnels
    allowedHosts: [
      '.trycloudflare.com',
      '.ngrok.io', 
      '.ngrok-free.app',
      '.localhost.run',
      '.serveo.net',
      'localhost',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 5173,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
