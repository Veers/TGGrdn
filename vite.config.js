import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Плагин: отдаёт tonconnect-manifest.json (dev + build для Tonkeeper и др. кошельков) */
function tonConnectManifestPlugin() {
  const manifestPath = join(__dirname, "public", "tonconnect-manifest.json");
  let fallbackManifest = '{"url":"","name":"Ферма","iconUrl":""}';
  try {
    fallbackManifest = readFileSync(manifestPath, "utf-8");
  } catch (_) {}

  return {
    name: "tonconnect-manifest",
    enforce: "pre",
    writeBundle(options) {
      const outDir = options.dir ?? join(__dirname, "dist");
      const outFile = join(outDir, "tonconnect-manifest.json");
      let content = fallbackManifest;
      try {
        content = readFileSync(manifestPath, "utf-8");
      } catch (_) {}
      const base = process.env.VITE_APP_URL || "";
      if (base) {
        const baseSlash = base.replace(/\/?$/, "/");
        content = content
          .replace(/"url"\s*:\s*"[^"]*"/, `"url":"${baseSlash}"`)
          .replace(
            /"iconUrl"\s*:\s*"[^"]*"/,
            `"iconUrl":"${baseSlash}vite.svg"`,
          );
      }
      writeFileSync(outFile, content, "utf-8");
    },
    configureServer(server) {
      const handler = (req, res, next) => {
        const path = (req.url || "").split("?")[0];
        if (
          path !== "/tonconnect-manifest.json" &&
          path !== "/tonconnect-manifest.json/"
        ) {
          return next();
        }
        try {
          const raw = readFileSync(manifestPath, "utf-8");
          const manifest = JSON.parse(raw);
          const host = req.headers.host || "localhost:5173";
          const proto = req.headers["x-forwarded-proto"] || "http";
          const base = `${proto}://${host}`;
          const body = JSON.stringify({
            url: manifest.url || base + "/",
            name: manifest.name || "Ферма",
            iconUrl: manifest.iconUrl || base + "/vite.svg",
          });
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "no-cache");
          res.statusCode = 200;
          res.end(body);
        } catch (_) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(fallbackManifest);
        }
      };
      server.middlewares.stack.unshift({ route: "", handle: handler });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tonConnectManifestPlugin(), react()],
});
