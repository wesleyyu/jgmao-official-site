import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { applyGeoShellToHtml, homeGeoShell } from "./shared-geo-shell.mts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const indexPath = path.join(rootDir, "index.html");

async function main() {
  const html = await readFile(indexPath, "utf8");
  const nextHtml = applyGeoShellToHtml(html, homeGeoShell);

  if (html !== nextHtml) {
    await writeFile(indexPath, nextHtml, "utf8");
    console.log("Synced homepage GEO shell.");
    return;
  }

  console.log("Homepage GEO shell already up to date.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
