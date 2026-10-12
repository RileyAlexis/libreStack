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
    visualizer({ open: false }),
    legacy({
      targets: ["defaults", "not IE 11", "safari >= 12"],
      modernPolyfills: ["es.object.from-entries"],
    }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["libreStack.svg", "apple-touch-icon.png"],
      workbox: {
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/swagger/, /^\/api/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // ! Remove for production!!!!
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      },
      manifest: {
        name: "Librestack",
        short_name: "Librestack",
        description: "Self-hosted epub library",
        background_color: "#faf1e298",
        theme_color: "#faf1e298",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
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
  build: {
    // ! Remove for production!!!
    minify: false,
    sourcemap: true,
  },
});
