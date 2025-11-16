import path from "path";
import fs from "fs-extra";
import { composeBlueprints } from "../../../src/compose.js";
import type { ProjectConfig } from "./interpretNaturalLanguage.js";

/**
 * Creates a frontend project based on the frontend type
 * @param projectName - Name of the project to create
 * @param frontendType - Type of frontend to create
 * @param cwd - Current working directory (defaults to process.cwd())
 */
export async function createFrontendProject(
  projectName: string,
  frontendType: ProjectConfig["frontend"],
  cwd: string = process.cwd()
): Promise<void> {
  const frontendDir = path.join(cwd, projectName);
  await fs.ensureDir(frontendDir);

  // Map frontend types to blueprint imports
  const blueprintMap: Record<string, () => Promise<{ blueprint: any }>> = {
    react: () => import("../../../blueprints/react-kitchen-sink/index.js"),
    next: () => import("../../../blueprints/nextjs/index.js"),
    svelte: () => import("../../../blueprints/svelte/index.js"),
    sveltekit: () => import("../../../blueprints/sveltekit/index.js"),
  };

  const blueprintImport = blueprintMap[frontendType];
  if (!blueprintImport) {
    throw new Error(`Unsupported frontend type: ${frontendType}`);
  }

  const { blueprint } = await blueprintImport();
  await composeBlueprints(frontendDir, [blueprint]);
}

