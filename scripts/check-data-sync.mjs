import { createHash } from "crypto";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = join(scriptDir, "..");
const sourcePath = join(rootDir, "src", "data", "2026-draft-database.json");
const serverPath = join(rootDir, "server", "data", "2026-draft-database.json");
const requiredFields = ["id", "name", "position", "team", "attributes", "embedding"];

const sourceBuffer = readFileSync(sourcePath);
const serverBuffer = readFileSync(serverPath);
const source = JSON.parse(sourceBuffer.toString("utf8"));

if (!sourceBuffer.equals(serverBuffer)) {
  const hash = value => createHash("sha256").update(value).digest("hex").slice(0, 12);
  throw new Error(`Draft databases differ (src=${hash(sourceBuffer)}, server=${hash(serverBuffer)}). Run npm run sync:data.`);
}

if (!Array.isArray(source) || source.length === 0) {
  throw new Error("Draft database must be a non-empty array.");
}

const ids = new Set();
const names = new Set();
for (const [index, player] of source.entries()) {
  for (const field of requiredFields) {
    if (player[field] === undefined || player[field] === null) {
      throw new Error(`Player at index ${index} is missing required field: ${field}`);
    }
  }
  if (ids.has(player.id)) throw new Error(`Duplicate player id: ${player.id}`);
  if (names.has(player.name)) throw new Error(`Duplicate player name: ${player.name}`);
  if (!Array.isArray(player.embedding) || player.embedding.length < 10) {
    throw new Error(`Player ${player.name} has an invalid embedding.`);
  }
  ids.add(player.id);
  names.add(player.name);
}

console.log(`Data check passed: ${source.length} players, database copies match.`);
