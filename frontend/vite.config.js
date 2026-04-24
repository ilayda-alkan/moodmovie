import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/auth": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
      "/analyze-mood": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
      "/me": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
      "/db-test": {
        target: "http://backend:8000",
        changeOrigin: true,
      },
    },
  },
});