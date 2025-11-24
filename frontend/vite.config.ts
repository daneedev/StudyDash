import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from parent directory
  const env = loadEnv(mode, "../", "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.FRONTEND_PORT) || 3000,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "https://api.studydash.app",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    preview: {
      port: Number(env.FRONTEND_PORT) || 3000,
      host: "0.0.0.0",
      allowedHosts: ["localhost", "studydash.app"],
    },
    // Configure Vite to load .env from parent directory
    envDir: "../",
  };
});
