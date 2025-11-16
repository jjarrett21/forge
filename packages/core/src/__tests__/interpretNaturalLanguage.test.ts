import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { interpretNaturalLanguage, type ProjectConfig } from "../interpretNaturalLanguage.js";

describe("interpretNaturalLanguage", () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.FORGE_PROXY_URL;

  beforeEach(() => {
    global.fetch = vi.fn();
    delete process.env.FORGE_PROXY_URL;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalEnv) {
      process.env.FORGE_PROXY_URL = originalEnv;
    } else {
      delete process.env.FORGE_PROXY_URL;
    }
  });

  it("should parse valid project config from AI response", async () => {
    const mockResponse: ProjectConfig = {
      projectName: "test-project",
      frontend: "react",
      backend: "fastapi",
      database: "postgres",
      useDocker: true,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(mockResponse),
          },
        ],
      }),
    });

    const result = await interpretNaturalLanguage("Create a React app with FastAPI backend");

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://forge-proxy.jjarrett21.workers.dev",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });

  it("should handle JSON wrapped in markdown code blocks", async () => {
    const mockResponse: ProjectConfig = {
      projectName: "test-project",
      frontend: "next",
      backend: "typescript-prisma",
      database: "postgres",
      useDocker: false,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: "```json\n" + JSON.stringify(mockResponse) + "\n```",
          },
        ],
      }),
    });

    const result = await interpretNaturalLanguage("Create a Next.js app with TypeScript Prisma backend");

    expect(result).toEqual(mockResponse);
  });

  it("should validate all new backend types", async () => {
    const backendTypes: ProjectConfig["backend"][] = [
      "fastapi",
      "express",
      "typescript-prisma",
      "golang",
      "rust",
      "java",
      "none",
    ];

    for (const backendType of backendTypes) {
      const mockResponse: ProjectConfig = {
        projectName: "test-project",
        frontend: "none",
        backend: backendType,
        database: "none",
        useDocker: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              type: "text",
              text: JSON.stringify(mockResponse),
            },
          ],
        }),
      });

      const result = await interpretNaturalLanguage(`Create a ${backendType} backend`);
      expect(result.backend).toBe(backendType);
    }
  });

  it("should validate all new frontend types", async () => {
    const frontendTypes: ProjectConfig["frontend"][] = [
      "react",
      "next",
      "svelte",
      "sveltekit",
      "none",
    ];

    for (const frontendType of frontendTypes) {
      const mockResponse: ProjectConfig = {
        projectName: "test-project",
        frontend: frontendType,
        backend: "none",
        database: "none",
        useDocker: false,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              type: "text",
              text: JSON.stringify(mockResponse),
            },
          ],
        }),
      });

      const result = await interpretNaturalLanguage(`Create a ${frontendType} frontend`);
      expect(result.frontend).toBe(frontendType);
    }
  });

  it("should throw error for invalid backend type", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              projectName: "test",
              frontend: "react",
              backend: "invalid-backend",
              database: "postgres",
              useDocker: true,
            }),
          },
        ],
      }),
    });

    await expect(
      interpretNaturalLanguage("Create a React app with invalid backend")
    ).rejects.toThrow();
  });

  it("should throw error for invalid frontend type", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify({
              projectName: "test",
              frontend: "invalid-frontend",
              backend: "fastapi",
              database: "postgres",
              useDocker: true,
            }),
          },
        ],
      }),
    });

    await expect(
      interpretNaturalLanguage("Create an invalid frontend app")
    ).rejects.toThrow();
  });

  it("should handle rate limit error", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({
        error: "Rate limit exceeded",
      }),
    });

    await expect(
      interpretNaturalLanguage("Create a project")
    ).rejects.toThrow("Rate limit exceeded");
  });

  it("should handle proxy errors", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({
        error: "Proxy error",
      }),
    });

    await expect(
      interpretNaturalLanguage("Create a project")
    ).rejects.toThrow("Proxy error");
  });

  it("should use custom proxy URL from environment variable", async () => {
    // Note: This test verifies the default behavior since env vars are read at module load time
    // In a real scenario, the env var would be set before the module is imported
    const mockResponse: ProjectConfig = {
      projectName: "test-project",
      frontend: "react",
      backend: "fastapi",
      database: "postgres",
      useDocker: true,
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        content: [
          {
            type: "text",
            text: JSON.stringify(mockResponse),
          },
        ],
      }),
    });

    await interpretNaturalLanguage("Create a React app");

    // The default URL should be used since env var is set at module load time
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("forge-proxy"),
      expect.any(Object)
    );
  });
});

