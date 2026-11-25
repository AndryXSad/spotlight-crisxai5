// Spotlight @crisxai5 — make.fun entry program (Node 22, standard library only).
//
// Design: the entry IS the X post. The grader only needs this program to hand
// it the post's address, so all this program does is carry POST.json from the
// repository root into the output directory, byte for byte. It never touches
// the network, never reads the clock, and never writes anything else, so two
// runs always produce identical bytes.
//
// Layout (outside the grader's container the two directories are env vars):
//   MAKEFUN_BOT_DIR     repository root (default /bot)
//   MAKEFUN_OUTPUT_DIR  output directory (default /output)
//
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// An X post address is the only shape the gate accepts. Refuse a malformed
// POST.json here, loudly, instead of handing the gate a file it must reject.
const postPath = join(botDir, "POST.json");
let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(postPath, "utf8"));
} catch (error) {
  console.error(`POST.json is not valid JSON: ${(error as Error).message}`);
  process.exit(1);
}
const url = (parsed as { url?: unknown } | null)?.url;
if (
  typeof url !== "string" ||
  !/^https?:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/\w+\/status\/\d+$/.test(url) &&
  !/^https?:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/i\/web\/status\/\d+$/.test(url)
) {
  console.error("POST.json must name one X post: {\"url\": \"https://x.com/<handle>/status/<id>\"}");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

try {
  copyFileSync(postPath, join(outputDir, "POST.json"));
} catch (error) {
  console.error(`could not copy POST.json out of ${botDir}: ${(error as Error).message}`);
  process.exit(1);
}
