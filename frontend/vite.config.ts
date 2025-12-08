import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from parent directory
  let envDir = ".";

  // Pokud neexistuje .env v aktuální složce, zkusit rodičovskou (dev)
  if (!fs.existsSync(path.resolve(__dirname, ".env"))) {
    envDir = "../";
  }

  const env = loadEnv(mode, envDir, "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: Number(env.FRONTEND_PORT) || 3000,
      host: "0.0.0.0",
      /* proxy: {
        "/api": {
          target: "https://api.studydash.app",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },*/
      allowedHosts: ["localhost", "studydash.app"],
    },
    preview: {
      port: Number(env.FRONTEND_PORT) || 3000,
      host: "0.0.0.0",
      allowedHosts: ["localhost", "studydash.app"],
    },
    // Configure Vite to load .env from parent directory
    envDir,
  };
});
