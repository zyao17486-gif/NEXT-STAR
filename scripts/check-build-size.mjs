import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(resolve(root, "dist", "index.html"), "utf8");
const entryMatch = html.match(/<script[^>]+src="([^"]+\.js)"/);

if (!entryMatch) {
  throw new Error("Unable to find the JavaScript entry in dist/index.html");
}

const entryPath = resolve(root, "dist", entryMatch[1].replace(/^\//, ""));
const source = readFileSync(entryPath);
const rawBytes = statSync(entryPath).size;
const gzipBytes = gzipSync(source).length;
const gzipLimitBytes = 185 * 1024;

if (gzipBytes > gzipLimitBytes) {
  throw new Error(
    `Entry bundle exceeds budget: ${(gzipBytes / 1024).toFixed(2)} KiB gzip > 185 KiB`,
  );
}

console.log(
  `Build size check passed: ${(rawBytes / 1024).toFixed(2)} KiB raw, ${(gzipBytes / 1024).toFixed(2)} KiB gzip (limit 185 KiB).`,
);
