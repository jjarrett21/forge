import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import type { Blueprint } from "../../src/compose.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const blueprint: Blueprint = {
  // FastAPI doesn't use npm dependencies, but we'll add a script to run it
  scripts: {
    "dev:api": "cd backend && python -m uvicorn main:app --reload --port 8000",
  },
  async setup(target: string) {
    const filesDir = path.join(__dirname, "files");
    const backendDir = path.join(target, "backend");
    await fs.copy(filesDir, backendDir, { overwrite: true });
  },
};

