import fs from "fs-extra";
import path from "path";
import os from "os";

/**
 * Creates a temporary directory for testing
 */
export async function createTempDir(prefix = "forge-test"): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  await fs.ensureDir(tempDir);
  return tempDir;
}

/**
 * Cleans up a temporary directory
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  if (await fs.pathExists(dir)) {
    await fs.remove(dir).catch(() => {
      // Ignore cleanup errors
    });
  }
}

/**
 * Waits for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

