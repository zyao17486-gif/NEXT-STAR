import { copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const source = join(scriptDir, "..", "src", "data", "2026-draft-database.json");
const target = join(scriptDir, "..", "server", "data", "2026-draft-database.json");

if (!existsSync(source)) {
  throw new Error(`Canonical draft database not found: ${source}`);
}

copyFileSync(source, target);
console.log("Synced canonical draft database to server/data.");
