import { z } from "zod";
import path from "path";
import { composeBlueprints } from "./compose.js";

const projectSchema = z.object({
  name: z.string(),
  frontend: z.string().optional(),
  backend: z.string().optional(),
});

export async function handleProjectRequest(input: unknown) {
  const data = projectSchema.parse(input);

  const blueprints = [];
  if (data.frontend === "Kitchen Sink") {
    const { blueprint } = await import(
      "../blueprints/react-kitchen-sink/index.js"
    );
    blueprints.push(blueprint);
  }
  if (data.backend === "FastAPI") {
    const { blueprint } = await import("../blueprints/fastapi/index.js");
    blueprints.push(blueprint);
  }

  // Use process.cwd() for output path (relative to where CLI is run)
  const outputPath = path.join(process.cwd(), "output", data.name);
  await composeBlueprints(outputPath, blueprints);
}
