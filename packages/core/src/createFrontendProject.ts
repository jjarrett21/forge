import { spawn } from "child_process";
import path from "path";

/**
 * Creates a frontend project using react-vite-kitchen-sink template
 * @param projectName - Name of the project to create
 * @param cwd - Current working directory (defaults to process.cwd())
 */
export async function createFrontendProject(
  projectName: string,
  cwd: string = process.cwd()
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Step 1: Create project using npm create
    console.log(`Creating project "${projectName}" with react-vite-kitchen-sink...`);
    
    const createProcess = spawn(
      "npm",
      ["create", "react-vite-kitchen-sink@latest", projectName],
      {
        cwd,
        stdio: "inherit",
        shell: true,
      }
    );

    createProcess.on("error", (error) => {
      reject(new Error(`Failed to create project: ${error.message}`));
    });

    createProcess.on("close", async (code) => {
      if (code !== 0) {
        reject(new Error(`Project creation failed with exit code ${code}`));
        return;
      }

      // Step 2: Install dependencies
      const projectPath = path.join(cwd, projectName);
      console.log(`\nInstalling dependencies in "${projectName}"...`);

      const installProcess = spawn("npm", ["install"], {
        cwd: projectPath,
        stdio: "inherit",
        shell: true,
      });

      installProcess.on("error", (error) => {
        reject(new Error(`Failed to install dependencies: ${error.message}`));
      });

      installProcess.on("close", (installCode) => {
        if (installCode !== 0) {
          reject(
            new Error(`Dependency installation failed with exit code ${installCode}`)
          );
          return;
        }

        console.log(`\n✅ Project "${projectName}" created successfully!`);
        resolve();
      });
    });
  });
}

