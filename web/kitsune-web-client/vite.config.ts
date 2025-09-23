import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Allow external connections (required for Docker)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Required for file watching in Docker containers
    },
  },
});
