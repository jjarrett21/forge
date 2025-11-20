import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  dependencies: {
    "svelte": "^4.2.8",
  },
  devDependencies: {
    "@sveltejs/vite-plugin-svelte": "^3.0.1",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "svelte-check": "^3.6.2",
    "tslib": "^2.6.2",
  },
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview",
    check: "svelte-check --tsconfig ./tsconfig.json",
  },
  async setup(target: string) {
    const projectName = path.basename(target);
    const parentDir = path.dirname(target);

    // The package creates a directory, so we'll use a temp name first
    const tempName = `${projectName}-temp-${Date.now()}`;
    const tempPath = path.join(parentDir, tempName);

    // Change to parent directory to run the command
    const originalCwd = process.cwd();
    process.chdir(parentDir);

    try {
      console.log(`Creating Svelte project: ${projectName}...`);

      // Create Svelte app with Vite and TypeScript
      await execa("npm", ["create", "svelte@latest", tempName], {
        input: "skeleton\n\nyes\nyes\nyes\nyes\n", // Select skeleton template, TypeScript, ESLint, Prettier, Playwright
        stdio: ["pipe", "inherit", "inherit"],
      });

      // Move the generated directory to our target
      if (await fs.pathExists(tempPath)) {
        // Remove target if it exists (compose creates it)
        if (await fs.pathExists(target)) {
          await fs.remove(target);
        }
        await fs.move(tempPath, target);
      } else {
        throw new Error(`Failed to create project at ${tempPath}`);
      }
    } finally {
      process.chdir(originalCwd);
    }
  },
};

