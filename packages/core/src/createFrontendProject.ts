import { execa } from "execa";
import path from "path";
import fs from "fs-extra";

/**
 * Creates a frontend project using react-vite-kitchen-sink template
 * @param projectName - Name of the project to create
 * @param cwd - Current working directory (defaults to process.cwd())
 */
export async function createFrontendProject(
  projectName: string,
  cwd: string = process.cwd()
): Promise<void> {
  // The package creates a directory, so we'll use a temp name first
  const tempName = `${projectName}-temp-${Date.now()}`;
  const tempPath = path.join(cwd, tempName);
  const targetPath = path.join(cwd, projectName);

  try {
    // Step 1: Create project using npx react-vite-kitchen-sink
    console.log(`Creating project "${projectName}" with react-vite-kitchen-sink...`);

    // Call react-vite-kitchen-sink with inputs
    // First prompt: project name, Second prompt: additional packages (empty)
    await execa("npx", ["-y", "react-vite-kitchen-sink"], {
      input: `${tempName}\n\n`,
      stdio: ["pipe", "inherit", "inherit"],
      cwd,
    });

    // Move the generated directory to our target
    if (await fs.pathExists(tempPath)) {
      // Remove target if it exists
      if (await fs.pathExists(targetPath)) {
        await fs.remove(targetPath);
      }
      await fs.move(tempPath, targetPath);
    } else {
      throw new Error(`Failed to create project at ${tempPath}`);
    }

    // Step 2: Install dependencies (if not already installed by the package)
    const projectPath = path.join(cwd, projectName);
    const packageJsonPath = path.join(projectPath, "package.json");

    if (await fs.pathExists(packageJsonPath)) {
      console.log(`\nInstalling dependencies in "${projectName}"...`);
      await execa("npm", ["install"], {
        cwd: projectPath,
        stdio: "inherit",
      });
    }

    console.log(`\n✅ Project "${projectName}" created successfully!`);
  } catch (error) {
    // Clean up temp directory on error
    if (await fs.pathExists(tempPath)) {
      await fs.remove(tempPath).catch(() => {
        // Ignore cleanup errors
      });
    }
    throw error;
  }
}

