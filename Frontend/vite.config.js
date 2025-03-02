import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from "path"

export default defineConfig({
  plugins: [react()],
  server: {
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.jsx', '.json'], // Add other extensions if needed

  },
});