import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsCConfigPaths from "vite-tsconfig-paths";
import path from "node:path";
import { vercel } from "@tanstack/react-start/adapters/vercel";

export default defineConfig({
  plugins: [
    tsCConfigPaths(),
    tailwindcss(),
    tanstackStart({ adapter: vercel() }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-start"],
  },
  server: {
    host: "::",
    port: 8080,
  },
});
