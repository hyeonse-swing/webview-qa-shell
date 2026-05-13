import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const qaPort = Number(process.env.QA_PORT ?? 8090);

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: qaPort,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: qaPort,
    strictPort: true,
  },
});
