import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from parent directory
  const env = loadEnv(mode, "../", "");
  
  return {
    plugins: [react()],
    server: {
      port: Number(env.FRONTEND_PORT) || 3000,
    },
    // Configure Vite to load .env from parent directory
    envDir: "../",
  };
});
