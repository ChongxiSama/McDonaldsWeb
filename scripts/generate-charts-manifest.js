/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const chartsDir = path.join(__dirname, "..", "public", "charts");
const outFile = path.join(__dirname, "..", "public", "charts-manifest.json");

let ids;
try {
  ids = fs.readdirSync(chartsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith("music"))
    .map(d => d.name.replace("music", ""));
} catch {
  console.warn("charts directory not found, skipping manifest");
  process.exit(0);
}

fs.writeFileSync(outFile, JSON.stringify(ids));
console.log(`charts-manifest.json generated: ${ids.length} entries`);
