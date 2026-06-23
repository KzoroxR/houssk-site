import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const defaultSource = path.resolve(projectRoot, "..", "houssk", "dist-web");
const sourceDir = path.resolve(process.argv[2] || process.env.HOUSSK_WEB_DIST || defaultSource);
const targetDir = path.join(projectRoot, "static", "app");

const textExtensions = new Set([".html", ".js", ".css"]);
const ignoredRouteFiles = new Set(["index.html", "+not-found.html", "_sitemap.html"]);

async function pathExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function rewriteAssetPaths(content) {
  return content
    .replaceAll('"/_expo/', '"/app/_expo/')
    .replaceAll("'/_expo/", "'/app/_expo/")
    .replaceAll("(/_expo/", "(/app/_expo/")
    .replaceAll('"/assets/', '"/app/assets/')
    .replaceAll("'/assets/", "'/app/assets/")
    .replaceAll("(/assets/", "(/app/assets/")
    .replaceAll('"/favicon.ico"', '"/app/favicon.ico"')
    .replaceAll("'/favicon.ico'", "'/app/favicon.ico'")
    .replaceAll("/app/app/_expo/", "/app/_expo/")
    .replaceAll("/app/app/assets/", "/app/assets/");
}

function rewriteRootRoutes(content, routeNames) {
  let rewritten = content
    .replaceAll('href="/"', 'href="/app/"')
    .replaceAll("href='/'", "href='/app/'");

  for (const routeName of routeNames) {
    rewritten = rewritten
      .replaceAll(`href="/${routeName}"`, `href="/app/${routeName}"`)
      .replaceAll(`href="/${routeName}/"`, `href="/app/${routeName}"`)
      .replaceAll(`href='/${routeName}'`, `href='/app/${routeName}'`)
      .replaceAll(`href='/${routeName}/'`, `href='/app/${routeName}'`);
  }

  return rewritten;
}

function rewriteExpoRouterBasePath(content) {
  return content
    .replaceAll(
      "appendBaseUrl=function(t,n=\"\"){if(n)return`/${n.replace(/^\\/+/, '').replace(/\\/$/, '')}${t}`;return t}",
      "appendBaseUrl=function(t,n=\"/app\"){if(n){const r=String(t);if(r===\"/\")return\"/app\";if(r===\"/app\"||r.startsWith(\"/app/\"))return r;return`/${n.replace(/^\\/+/,'').replace(/\\/$/,'')}${r}`}return t}",
    )
    .replaceAll(
      "appendBaseUrl=function(t,n=\"\"){if(n)return`/${n.replace(/^\\/+/,'').replace(/\\/$/,'')}${t}`;return t}",
      "appendBaseUrl=function(t,n=\"/app\"){if(n){const r=String(t);if(r===\"/\")return\"/app\";if(r===\"/app\"||r.startsWith(\"/app/\"))return r;return`/${n.replace(/^\\/+/,'').replace(/\\/$/,'')}${r}`}return t}",
    )
    .replace(
      /([A-Za-z_$][\w$]*)\.appendBaseUrl=function\(t,n=""\)\{if\(n\)return`\/\$\{n\.replace\(\/\^\\\/\+\/,''\)\.replace\(\/\\\/\$\/,''\)\}\$\{t\}`;return t\};/g,
      (_match, namespace) =>
        `${namespace}.appendBaseUrl=function(t,n="/app"){if(n){const r=String(t);if(r==="/")return"/app";if(r==="/app"||r.startsWith("/app/"))return r;return\`/\${n.replace(/^\\/+/,'').replace(/\\/$/,'')}\${r}\`}return t};`,
    )
    .replaceAll(
      "if('web'===c.Platform.OS&&window.location?.href)return window.location.href;",
      "if('web'===c.Platform.OS&&window.location?.href){const _h=new URL(window.location.href);_h.pathname=_h.pathname.replace(/^\\/app(?=\\/|$)/,'')||'/';return _h.href;}",
    )
    .replaceAll(
      "_e.getInitialURLWithTimeout=function(){return'undefined'==typeof window?'':window.location.href};",
      "_e.getInitialURLWithTimeout=function(){if('undefined'==typeof window)return'';const _h=new URL(window.location.href);_h.pathname=_h.pathname.replace(/^\\/app(?=\\/|$)/,'')||'/';return _h.href};",
    )
    .replaceAll(
      "const t=P?.location??('undefined'!=typeof window?window.location:void 0),r=t?t.pathname+t.search:void 0;",
      "const t=P?.location??('undefined'!=typeof window?window.location:void 0),r=t?((t.pathname+t.search).replace(/^\\/app(?=\\/|$)/,'')||'/'):void 0;",
    )
    .replaceAll(
      "const{location:n}=window,o=n.pathname+n.search,s=v.index",
      "const{location:n}=window,o=((n.pathname+n.search).replace(/^\\/app(?=\\/|$)/,'')||'/'),s=v.index",
    )
    .replaceAll(
      "const t=j?.location??('undefined'!=typeof window?window.location:void 0),r=t?t.pathname+t.search:void 0;",
      "const t=j?.location??('undefined'!=typeof window?window.location:void 0),r=t?((t.pathname+t.search).replace(/^\\/app(?=\\/|$)/,'')||'/'):void 0;",
    )
    .replaceAll(
      "const{location:n}=window,o=n.pathname+n.search+n.hash,s=w.index",
      "const{location:n}=window,o=((n.pathname+n.search+n.hash).replace(/^\\/app(?=\\/|$)/,'')||'/'),s=w.index",
    )
    .replaceAll(
      "if(o instanceof URL)t={location:{pathname:o.pathname+o.hash,search:o.search}};else if('string'==typeof o){const n=new URL(o,'http://placeholder.base');t={location:{pathname:n.pathname,search:n.search}}}",
      "if(o instanceof URL)t={location:{pathname:(o.pathname.replace(/^\\/app(?=\\/|$)/,'')||'/')+o.hash,search:o.search}};else if('string'==typeof o){const n=new URL(o,'http://placeholder.base');t={location:{pathname:(n.pathname.replace(/^\\/app(?=\\/|$)/,'')||'/'),search:n.search}}}",
    );
}

function markEntryBundleAsModule(content) {
  return content.replace(
    /<script src="(\/app\/_expo\/static\/js\/web\/entry-[^"]+\.js)" defer><\/script>/g,
    '<script type="module" src="$1" defer></script>',
  );
}

async function getRouteNames() {
  const entries = await readdir(sourceDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && !ignoredRouteFiles.has(entry.name))
    .map((entry) => path.basename(entry.name, ".html"))
    .sort();
}

async function rewriteCopiedFiles(routeNames) {
  const files = await walkFiles(targetDir);

  for (const file of files) {
    if (!textExtensions.has(path.extname(file))) {
      continue;
    }

    const original = await readFile(file, "utf8");
    let rewritten = rewriteAssetPaths(original);

    if (path.extname(file) === ".html") {
      rewritten = markEntryBundleAsModule(rewriteRootRoutes(rewritten, routeNames));
    }

    if (path.extname(file) === ".js") {
      rewritten = rewriteExpoRouterBasePath(rewritten);
    }

    if (rewritten !== original) {
      await writeFile(file, rewritten, "utf8");
    }
  }
}

async function main() {
  if (!(await pathExists(path.join(sourceDir, "index.html")))) {
    throw new Error(`Build web introuvable ou incomplet: ${sourceDir}`);
  }

  const routeNames = await getRouteNames();

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(targetDir), { recursive: true });
  await cp(sourceDir, targetDir, { recursive: true });
  await rewriteCopiedFiles(routeNames);

  console.log(`App web synchronisee depuis ${sourceDir}`);
  console.log(`Destination: ${targetDir}`);
  console.log(`Routes statiques: /app/, ${routeNames.map((name) => `/app/${name}`).join(", ")}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
