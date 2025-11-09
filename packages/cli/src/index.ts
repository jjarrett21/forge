#!/usr/bin/env node

import * as p from "@clack/prompts";
import {
  createFrontendProject,
  createBackendProject,
  createFullStackProject,
  createProject,
  interpretNaturalLanguage,
} from "@forge/core";

async function main() {
  // Check for --from-prompt flag
  const args = process.argv.slice(2);
  const fromPrompt = args.includes("--from-prompt");

  if (fromPrompt) {
    await handleNaturalLanguageFlow();
    return;
  }

  await handleInteractiveFlow();
}

async function handleNaturalLanguageFlow() {
  console.log(); // Add spacing

  p.intro("🔥 Forge - Natural Language Project Scaffolder");

  // Collect multiline text input
  const description = await p.text({
    message: "Describe the project you want to build:",
    placeholder:
      "I want a web app with React UI, FastAPI backend, and Postgres. Use Docker.",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Project description is required";
      }
      return;
    },
  });

  if (p.isCancel(description)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // Interpret natural language
  const spinner = p.spinner();
  spinner.start("Interpreting your project description...");

  let config;
  try {
    config = await interpretNaturalLanguage(description as string);
    spinner.stop("✅ Project configuration interpreted!");
  } catch (error) {
    spinner.stop("❌ Failed to interpret project description");
    p.cancel(error instanceof Error ? error.message : "Unknown error occurred");
    process.exit(1);
  }

  // Show interpreted config
  p.note(
    `Project: ${config.projectName}\nFrontend: ${config.frontend}\nBackend: ${config.backend}\nDatabase: ${config.database}\nDocker: ${config.useDocker}`,
    "Configuration"
  );

  // Confirm before creating
  const confirm = await p.confirm({
    message: "Proceed with creating this project?",
    initialValue: true,
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // Create the project
  const createSpinner = p.spinner();
  createSpinner.start("Creating your project...");

  try {
    await createProject(config);
    createSpinner.stop("✅ Project created successfully!");

    const nextSteps = getNextSteps(config);
    p.note(nextSteps, "Ready to code!");

    p.outro("🎉 Your project is ready!");
  } catch (error) {
    createSpinner.stop("❌ Failed to create project");
    p.cancel(error instanceof Error ? error.message : "Unknown error occurred");
    process.exit(1);
  }
}

function getNextSteps(config: {
  projectName: string;
  frontend: string;
  backend: string;
  useDocker: boolean;
}): string {
  const { projectName, frontend, backend, useDocker } = config;
  let steps = `cd ${projectName}\n`;

  if (useDocker && backend !== "none") {
    steps += "docker-compose up --build\n\n";
    if (frontend !== "none") {
      steps += "Frontend: http://localhost:3000\n";
    }
    steps += "Backend: http://localhost:8000\n";
    steps += "API Docs: http://localhost:8000/docs";
  } else {
    if (frontend !== "none") {
      steps += `cd ${
        frontend !== "none" && backend !== "none" ? "frontend" : ""
      }\n`;
      steps += "npm run dev";
    }
    if (backend !== "none") {
      if (frontend !== "none") steps += "\n\n";
      steps += `cd ${frontend !== "none" ? "../backend" : "backend"}\n`;
      steps += "uvicorn app.main:app --reload";
    }
  }

  return steps;
}

async function handleInteractiveFlow() {
  console.log(); // Add spacing

  p.intro("🔥 Forge - Full-Stack Project Scaffolder");

  // Prompt for project name
  const projectName = await p.text({
    message: "What is your project name?",
    placeholder: "my-awesome-app",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Project name is required";
      }
      // Basic validation for project names
      if (!/^[a-z0-9-_]+$/i.test(value)) {
        return "Project name can only contain letters, numbers, hyphens, and underscores";
      }
      return;
    },
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // Prompt for project type
  const projectType = await p.select({
    message: "What type of project do you want to create?",
    options: [
      {
        value: "frontend",
        label: "Frontend",
        hint: "React + Vite + Tailwind + React Query",
      },
      {
        value: "backend",
        label: "Backend",
        hint: "FastAPI + PostgreSQL + Docker",
      },
      {
        value: "fullstack",
        label: "Full Stack",
        hint: "Frontend + Backend (FastAPI + PostgreSQL)",
      },
    ],
  });

  if (p.isCancel(projectType)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  // Handle frontend project
  if (projectType === "frontend") {
    const useKitchenSink = await p.confirm({
      message:
        "Use the Kitchen Sink starter? (React + Vite + Tailwind + React Query)",
      initialValue: true,
    });

    if (p.isCancel(useKitchenSink)) {
      p.cancel("Operation cancelled.");
      process.exit(0);
    }

    if (!useKitchenSink) {
      p.cancel(
        "Kitchen Sink starter is currently the only option for frontend projects."
      );
      process.exit(0);
    }

    // Create the project
    const spinner = p.spinner();
    spinner.start("Creating your frontend project...");

    try {
      await createFrontendProject(projectName as string);
      spinner.stop("✅ Project created successfully!");

      p.note(
        `Next steps:\n  cd ${projectName}\n  npm run dev`,
        "Ready to code!"
      );

      p.outro("🎉 Your project is ready!");
    } catch (error) {
      spinner.stop("❌ Failed to create project");
      p.cancel(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      process.exit(1);
    }
  }
  // Handle backend project
  else if (projectType === "backend") {
    const spinner = p.spinner();
    spinner.start("Creating your backend project...");

    try {
      await createBackendProject(projectName as string);
      spinner.stop("✅ Backend project created successfully!");

      p.note(
        `Next steps:\n  cd ${projectName}\n  docker-compose up --build\n\n  API: http://localhost:8000\n  API Docs: http://localhost:8000/docs`,
        "Ready to code!"
      );

      p.outro("🎉 Your backend project is ready!");
    } catch (error) {
      spinner.stop("❌ Failed to create project");
      p.cancel(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      process.exit(1);
    }
  }
  // Handle full stack project
  else if (projectType === "fullstack") {
    const spinner = p.spinner();
    spinner.start("Creating your full-stack project...");

    try {
      // Step 1: Create frontend
      spinner.message("Creating frontend...");
      await createFullStackProject(projectName as string);
      spinner.stop("✅ Full-stack project created successfully!");

      p.note(
        `Next steps:\n  cd ${projectName}\n  docker-compose up --build\n\n  Frontend: http://localhost:3000\n  Backend: http://localhost:8000\n  API Docs: http://localhost:8000/docs`,
        "Ready to code!"
      );

      p.outro("🎉 Your full-stack project is ready!");
    } catch (error) {
      spinner.stop("❌ Failed to create project");
      p.cancel(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
      process.exit(1);
    }
  } else {
    p.cancel("This project type is not yet supported.");
    process.exit(0);
  }
}

main().catch((error) => {
  p.cancel(error instanceof Error ? error.message : "Unknown error occurred");
  process.exit(1);
});
