import path from "path";
import fs from "fs-extra";
import { execa } from "execa";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  dependencies: {
    "@sveltejs/kit": "^2.0.0",
    "svelte": "^4.2.8",
  },
  devDependencies: {
    "@sveltejs/adapter-auto": "^3.0.0",
    "@sveltejs/vite-plugin-svelte": "^3.0.1",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "svelte-check": "^3.6.2",
    "tslib": "^2.6.2",
  },
  scripts: {
    dev: "vite dev",
    build: "vite build",
    preview: "vite preview",
    check: "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
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
      console.log(`Creating SvelteKit project: ${projectName}...`);

      // Create SvelteKit app
      await execa("npm", ["create", "svelte@latest", tempName], {
        input: "skeleton\n\nyes\nyes\nyes\nyes\n", // Select skeleton template, TypeScript, ESLint, Prettier, Playwright
        stdio: ["pipe", "inherit", "inherit"],
      });

      // Check if it's SvelteKit (it should be by default with create-svelte)
      // Move the generated directory to our target
      if (await fs.pathExists(tempPath)) {
        // Verify it's SvelteKit by checking for svelte.config.js
        const packageJsonPath = path.join(tempPath, "package.json");
        
        if (await fs.pathExists(packageJsonPath)) {
          const pkg = await fs.readJSON(packageJsonPath);
          // Ensure @sveltejs/kit is in dependencies
          if (!pkg.dependencies || !pkg.dependencies["@sveltejs/kit"]) {
            // Add SvelteKit if not present
            if (!pkg.dependencies) pkg.dependencies = {};
            pkg.dependencies["@sveltejs/kit"] = "^2.0.0";
            await fs.writeJSON(packageJsonPath, pkg, { spaces: 2 });
          }
        }

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

