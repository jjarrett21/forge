import { z } from "zod";

const ProjectConfigSchema = z.object({
  projectName: z.string(),
  frontend: z.enum(["react", "next", "none"]),
  backend: z.enum(["fastapi", "express", "none"]),
  database: z.enum(["postgres", "sqlite", "none"]),
  useDocker: z.boolean(),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

// Default to production proxy, allow override with env var
const PROXY_URL =
  process.env.FORGE_PROXY_URL || "https://forge-proxy.jjarrett21.workers.dev";

/**
 * Interprets natural language project description and converts it to structured config
 * Uses a backend proxy to keep API keys secure
 * @param description - Natural language description of the project
 * @returns Parsed and validated project configuration
 */
export async function interpretNaturalLanguage(
  description: string
): Promise<ProjectConfig> {
  try {
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error(
          "Rate limit exceeded. You've reached the maximum of 10 AI interpretations per day. Please try again tomorrow or use the interactive mode."
        );
      }
      throw new Error(
        error.error || `Proxy error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Extract JSON from Anthropic response
    const content = data.content?.[0];
    if (!content) {
      throw new Error("Empty response from AI service");
    }
    if (content.type !== "text") {
      throw new Error("Unexpected response type from AI service");
    }

    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
    jsonText = jsonText.replace(/\s*```$/i, "").trim();

    // Parse JSON
    const parsed = JSON.parse(jsonText);

    // Validate with Zod
    const validated = ProjectConfigSchema.parse(parsed);

    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid configuration from AI: ${error.issues
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`
      );
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON from AI: ${error.message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Unknown error occurred while interpreting project description"
    );
  }
}
