import { readdir } from "node:fs/promises";
import path from "node:path";
import type { APIRoute, GetStaticPaths } from "astro";
import { appHtmlResponse } from "../../lib/webAppHtml";

const ignoredRouteFiles = new Set(["index.html", "+not-found.html", "_sitemap.html"]);

export const prerender = true;

export const getStaticPaths: GetStaticPaths = async () => {
  const appDir = path.join(process.cwd(), "static", "app");
  const entries = await readdir(appDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !ignoredRouteFiles.has(entry.name))
    .map((entry) => ({
      params: {
        path: path.basename(entry.name, ".html"),
      },
    }));
};

export const GET: APIRoute = async ({ params }) => appHtmlResponse(params.path);
