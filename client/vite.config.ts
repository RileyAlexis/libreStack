import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    visualizer({ open: true }),
    legacy({
      targets: ["safari >= 12"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      workbox: {
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/swagger/, /^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      manifest: {
        name: "Librestack",
        short_name: "Librestack",
        description: "Self-hosted epub library",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        // icons: [
        //   {
        //     src: "pwa-192x192.png",
        //     sizes: "192x192",
        //     type: "image/png",
        //   },
        //   {
        //     src: "pwa-512x512.png",
        //     sizes: "512x512",
        //     type: "image/png",
        //   },
        // ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // build: {
  //   outDir: "../server/wwwroot",
  //   emptyOutDir: true,
  // },
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:5238",
        changeOrigin: true,
      },
    },
  },
});
