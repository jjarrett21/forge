import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createProject } from "../createProject.js";
import { createBackendProject } from "../createBackendProject.js";
import { createFrontendProject } from "../createFrontendProject.js";
import { createFullStackProject } from "../createFullStackProject.js";
import type { ProjectConfig } from "../interpretNaturalLanguage.js";
import fs from "fs-extra";
import path from "path";
import os from "os";

// Mock the dependencies
vi.mock("../createBackendProject.js");
vi.mock("../createFrontendProject.js");
vi.mock("../createFullStackProject.js");
vi.mock("fs-extra");

describe("createProject", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(os.tmpdir(), `forge-test-${Date.now()}`);
    vi.clearAllMocks();
  });

  afterEach(async () => {
    if (await fs.pathExists(tempDir)) {
      await fs.remove(tempDir).catch(() => {});
    }
  });

  it("should create full stack project when both frontend and backend are specified", async () => {
    const config: ProjectConfig = {
      projectName: "test-project",
      frontend: "react",
      backend: "fastapi",
      database: "postgres",
      useDocker: true,
    };

    await createProject(config, tempDir);

    expect(createFullStackProject).toHaveBeenCalledWith(
      "test-project",
      "react",
      "fastapi",
      tempDir
    );
    expect(createFrontendProject).not.toHaveBeenCalled();
    expect(createBackendProject).not.toHaveBeenCalled();
  });

  it("should create frontend-only project when backend is none", async () => {
    const config: ProjectConfig = {
      projectName: "test-project",
      frontend: "next",
      backend: "none",
      database: "none",
      useDocker: false,
    };

    await createProject(config, tempDir);

    expect(createFrontendProject).toHaveBeenCalledWith(
      "test-project",
      "next",
      tempDir
    );
    expect(createFullStackProject).not.toHaveBeenCalled();
    expect(createBackendProject).not.toHaveBeenCalled();
  });

  it("should create backend-only project when frontend is none", async () => {
    const config: ProjectConfig = {
      projectName: "test-project",
      frontend: "none",
      backend: "typescript-prisma",
      database: "postgres",
      useDocker: false,
    };

    await createProject(config, tempDir);

    expect(createBackendProject).toHaveBeenCalledWith(
      "test-project",
      "typescript-prisma",
      tempDir
    );
    expect(createFullStackProject).not.toHaveBeenCalled();
    expect(createFrontendProject).not.toHaveBeenCalled();
  });

  it("should throw error when both frontend and backend are none", async () => {
    const config: ProjectConfig = {
      projectName: "test-project",
      frontend: "none",
      backend: "none",
      database: "none",
      useDocker: false,
    };

    await expect(createProject(config, tempDir)).rejects.toThrow(
      "At least one of frontend or backend must be specified"
    );
  });

  it("should handle all new backend types", async () => {
    const backendTypes: ProjectConfig["backend"][] = [
      "fastapi",
      "express",
      "typescript-prisma",
      "golang",
      "rust",
      "java",
    ];

    for (const backendType of backendTypes) {
      vi.clearAllMocks();
      const config: ProjectConfig = {
        projectName: "test-project",
        frontend: "none",
        backend: backendType,
        database: "postgres",
        useDocker: false,
      };

      await createProject(config, tempDir);

      expect(createBackendProject).toHaveBeenCalledWith(
        "test-project",
        backendType,
        tempDir
      );
    }
  });

  it("should handle all new frontend types", async () => {
    const frontendTypes: ProjectConfig["frontend"][] = [
      "react",
      "next",
      "svelte",
      "sveltekit",
    ];

    for (const frontendType of frontendTypes) {
      vi.clearAllMocks();
      const config: ProjectConfig = {
        projectName: "test-project",
        frontend: frontendType,
        backend: "none",
        database: "none",
        useDocker: false,
      };

      await createProject(config, tempDir);

      expect(createFrontendProject).toHaveBeenCalledWith(
        "test-project",
        frontendType,
        tempDir
      );
    }
  });
});

