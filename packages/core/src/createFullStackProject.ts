import path from "path";
import fs from "fs-extra";
import { createFrontendProject } from "./createFrontendProject.js";
import { createBackendProject } from "./createBackendProject.js";
import type { ProjectConfig } from "./interpretNaturalLanguage.js";

/**
 * Creates a full-stack project with frontend and backend
 * @param projectName - Name of the project to create
 * @param frontendType - Type of frontend to create
 * @param backendType - Type of backend to create
 * @param cwd - Current working directory (defaults to process.cwd())
 */
export async function createFullStackProject(
  projectName: string,
  frontendType: ProjectConfig["frontend"],
  backendType: ProjectConfig["backend"],
  cwd: string = process.cwd()
): Promise<void> {
  const projectPath = path.join(cwd, projectName);
  
  // Create the main project directory
  await fs.ensureDir(projectPath);

  // Step 1: Create frontend in frontend/ subdirectory
  // Use a temp name first, then move it
  const tempFrontendName = `${projectName}-frontend-temp-${Date.now()}`;
  await createFrontendProject(tempFrontendName, frontendType, cwd);
  
  // Move the created frontend to frontend/ subdirectory
  const tempFrontendPath = path.join(cwd, tempFrontendName);
  const frontendPath = path.join(projectPath, "frontend");
  
  if (await fs.pathExists(tempFrontendPath)) {
    await fs.move(tempFrontendPath, frontendPath);
  }

  // Step 2: Create backend in backend/ subdirectory
  await createBackendProject(projectName, backendType, cwd);
}

