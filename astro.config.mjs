// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import vercelStatic from '@astrojs/vercel/static';

// https://astro.build/config
export default defineConfig({
  site: "https://kdelfour.github.io",
  base: "",
  output: "static",
  build: { format: "file" },
  integrations: [mdx(), sitemap(), tailwind(), icon(), pagefind()],
  adapter: vercelStatic(),
});
