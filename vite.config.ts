import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  root: "app",
  base: process.env.GITHUB_PAGES === "true" ? "/troop-rush/" : "/",
  plugins: [react()],
  publicDir: "../data",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./app/src", import.meta.url)),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  define: {
    "import.meta.env.VITE_BUILD_VERSION": JSON.stringify(
      process.env.npm_package_version || "0.1.0"
    ),
  },
});
