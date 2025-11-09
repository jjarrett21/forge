import prompts from "prompts";
import { handleProjectRequest } from "./handleProjectRequests.js";

async function run() {
  const answers = await prompts([
    { type: "text", name: "name", message: "Project name:" },
    {
      type: "select",
      name: "frontend",
      message: "Frontend stack:",
      choices: ["Kitchen Sink", "None"].map((v) => ({ title: v, value: v })),
    },
    {
      type: "select",
      name: "backend",
      message: "Backend stack:",
      choices: ["FastAPI", "None"].map((v) => ({ title: v, value: v })),
    },
  ]);
  await handleProjectRequest(answers);
}

run();
