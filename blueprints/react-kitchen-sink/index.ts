import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  // Dependencies will be installed by react-vite-kitchen-sink
  scripts: {
    dev: "vite",
    build: "tsc && vite build",
    preview: "vite preview",
    test: "vitest",
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
      console.log(`Creating Kitchen Sink project: ${projectName}...`);

      // Call react-vite-kitchen-sink with inputs
      // First prompt: project name, Second prompt: additional packages (empty)
      const proc = execa("npx", ["-y", "react-vite-kitchen-sink"], {
        input: `${tempName}\n\n`,
        stdio: ["pipe", "inherit", "inherit"],
      });

      await proc;

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
