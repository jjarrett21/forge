#!/usr/bin/env node

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find tsx in node_modules
const tsxPath = join(__dirname, "..", "node_modules", ".bin", "tsx");
const tsx = existsSync(tsxPath) ? tsxPath : "tsx";
const scriptPath = join(__dirname, "..", "src", "index.ts");

const proc = spawn(tsx, [scriptPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: false,
});

proc.on("error", (error) => {
  console.error(`Error running forge: ${error.message}`);
  process.exit(1);
});

proc.on("close", (code) => {
  process.exit(code ?? 0);
});

