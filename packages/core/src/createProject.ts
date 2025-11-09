import path from "path";
import type { ProjectConfig } from "./interpretNaturalLanguage.js";
import { createFrontendProject } from "./createFrontendProject.js";
import { createBackendProject } from "./createBackendProject.js";
import { createFullStackProject } from "./createFullStackProject.js";

/**
 * Creates a project based on structured configuration
 * @param config - Project configuration from natural language interpretation
 * @param cwd - Current working directory (defaults to process.cwd())
 */
export async function createProject(
  config: ProjectConfig,
  cwd: string = process.cwd()
): Promise<void> {
  const { projectName, frontend, backend } = config;

  // Determine project type based on config
  if (frontend !== "none" && backend !== "none") {
    // Full stack project
    await createFullStackProject(projectName, cwd);
  } else if (frontend !== "none") {
    // Frontend only
    await createFrontendProject(projectName, cwd);
  } else if (backend !== "none") {
    // Backend only
    await createBackendProject(projectName, cwd);
  } else {
    throw new Error("At least one of frontend or backend must be specified");
  }
}

