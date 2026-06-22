import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://houssk.fr",
  output: "static",
  publicDir: "./static",
  server: {
    host: true,
    port: 4321,
  },
  vite: {
    server: {
      host: true,
    },
  },
});
