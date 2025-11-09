#!/usr/bin/env node

import * as p from "@clack/prompts";
import {
  createFrontendProject,
  createBackendProject,
  createFullStackProject,
} from "@forge/core";

async function main() {
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
