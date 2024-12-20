// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import pagefind from "astro-pagefind";

// https://astro.build/config
export default defineConfig({
  site: "https://levilainpetit.dev/",
  base: "",
  output: "static",
  integrations: [mdx(), sitemap(), tailwind(), icon(), pagefind()],
  vite: {
    build: {
      modulePreload: {
        polyfill: true,
        resolveDependencies: (filename, deps) => {
          console.log(filename, deps);
          return deps.filter((dep) => !dep.includes("node_modules"));
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            utils: ["lodash", "date-fns"],
            home: ["./src/pages/index.astro"],
            articles: ["./src/content/articles/*.astro"],
            books: ["./src/content/books/*.astro"],
            tags: ["./src/content/tags/*.astro"],
            about: ["./src/pages/about.astro"],
          },
          entryFileNames: "entries/[name]-[hash].js",
          chunkFileNames: "chunks/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
    optimizeDeps: {
      include: ["react", "react-dom"],
      exclude: ["@astrojs/image"],
    },
  },
});
