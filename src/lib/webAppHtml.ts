import { readFile } from "node:fs/promises";
import path from "node:path";

const appDir = path.join(process.cwd(), "static", "app");

export function appHtmlPath(routePath = "") {
  const normalizedRoute = routePath.replace(/^\/+|\/+$/g, "");

  if (normalizedRoute.includes("..")) {
    throw new Error("Invalid app route");
  }

  return path.join(appDir, normalizedRoute ? `${normalizedRoute}.html` : "index.html");
}

export async function appHtmlResponse(routePath = "") {
  const html = await readFile(appHtmlPath(routePath), "utf8");

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
