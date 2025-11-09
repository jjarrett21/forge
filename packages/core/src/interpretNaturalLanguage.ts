import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

const ProjectConfigSchema = z.object({
  projectName: z.string(),
  frontend: z.enum(["react", "next", "none"]),
  backend: z.enum(["fastapi", "express", "none"]),
  database: z.enum(["postgres", "sqlite", "none"]),
  useDocker: z.boolean(),
});

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;

const SYSTEM_PROMPT = `You are an assistant that converts project descriptions into structured configuration for a scaffolding tool.

Only respond with valid JSON following this schema:

{
  "projectName": string,
  "frontend": "react" | "next" | "none",
  "backend": "fastapi" | "express" | "none",
  "database": "postgres" | "sqlite" | "none",
  "useDocker": boolean
}

If something is unclear, make a reasonable assumption.

Never include commentary, just return JSON.`;

/**
 * Interprets natural language project description and converts it to structured config
 * @param description - Natural language description of the project
 * @param apiKey - Claude API key (defaults to ANTHROPIC_API_KEY env var)
 * @returns Parsed and validated project configuration
 */
export async function interpretNaturalLanguage(
  description: string,
  apiKey?: string
): Promise<ProjectConfig> {
  const anthropic = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });

  if (!anthropic.apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is required. Set it with: export ANTHROPIC_API_KEY=your-key"
    );
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: description,
        },
      ],
    });

    // Extract JSON from response
    const content = message.content[0];
    if (!content) {
      throw new Error("Empty response from Claude API");
    }
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude API");
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
        `Invalid configuration from Claude: ${error.issues
          .map((e: z.ZodIssue) => e.message)
          .join(", ")}`
      );
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse JSON from Claude: ${error.message}`);
    }
    throw error;
  }
}
