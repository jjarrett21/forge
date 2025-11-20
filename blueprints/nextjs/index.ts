import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  dependencies: {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
  },
  devDependencies: {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4",
  },
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint",
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
      console.log(`Creating Next.js project: ${projectName}...`);

      // Create Next.js app with TypeScript
      await execa("npx", ["create-next-app@latest", tempName, "--typescript", "--tailwind", "--eslint", "--app", "--no-src-dir", "--import-alias", "@/*", "--yes"], {
        stdio: "inherit",
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

