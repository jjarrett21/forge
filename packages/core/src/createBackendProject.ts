import fs from "fs-extra";
import path from "path";
import { composeBlueprints } from "../../../src/compose.js";
import type { ProjectConfig } from "./interpretNaturalLanguage.js";

/**
 * Creates a backend project based on the backend type
 * @param projectPath - Path to the project directory (where backend/ will be created)
 * @param backendType - Type of backend to create
 * @param cwd - Current working directory (defaults to process.cwd())
 */
export async function createBackendProject(
  projectPath: string,
  backendType: ProjectConfig["backend"],
  cwd: string = process.cwd()
): Promise<void> {
  const backendDir = path.join(cwd, projectPath, "backend");
  await fs.ensureDir(backendDir);

  // Map backend types to blueprint imports
  const blueprintMap: Record<string, () => Promise<{ blueprint: any }>> = {
    fastapi: () => import("../../../blueprints/fastapi/index.js"),
    express: () => import("../../../blueprints/express/index.js"),
    "typescript-prisma": () => import("../../../blueprints/typescript-prisma/index.js"),
    golang: () => import("../../../blueprints/golang/index.js"),
    rust: () => import("../../../blueprints/rust/index.js"),
    java: () => import("../../../blueprints/java/index.js"),
  };

  // For FastAPI, use the old direct file creation method for backward compatibility
  if (backendType === "fastapi") {
    await createFastAPIProject(backendDir);
    return;
  }

  // For other backends, use blueprints
  const blueprintImport = blueprintMap[backendType];
  if (!blueprintImport) {
    throw new Error(`Unsupported backend type: ${backendType}`);
  }

  const { blueprint } = await blueprintImport();
  await composeBlueprints(backendDir, [blueprint]);
}

/**
 * Creates a FastAPI backend project (legacy method)
 * @param backendDir - Directory where backend will be created
 */
async function createFastAPIProject(backendDir: string): Promise<void> {
  const appDir = path.join(backendDir, "app");
  const apiDir = path.join(appDir, "api");
  const coreDir = path.join(appDir, "core");
  const testsDir = path.join(backendDir, "tests");
  const projectRoot = path.dirname(backendDir);

  // Create directory structure
  await fs.ensureDir(apiDir);
  await fs.ensureDir(coreDir);
  await fs.ensureDir(testsDir);

  // Create __init__.py files
  await fs.writeFile(path.join(appDir, "__init__.py"), "");
  await fs.writeFile(path.join(apiDir, "__init__.py"), "");

  // Create app/main.py
  await fs.writeFile(
    path.join(appDir, "main.py"),
    `from fastapi import FastAPI

from app.api.routes import router

app = FastAPI()

app.include_router(router)
`
  );

  // Create app/api/routes.py
  await fs.writeFile(
    path.join(apiDir, "routes.py"),
    `from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {"status": "ok"}
`
  );

  // Create app/core/config.py
  await fs.writeFile(
    path.join(coreDir, "config.py"),
    `import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")
`
  );

  // Create requirements.txt
  await fs.writeFile(
    path.join(backendDir, "requirements.txt"),
    `fastapi
uvicorn[standard]
psycopg[binary]
`
  );

  // Create docker-compose.yml
  await fs.writeFile(
    path.join(projectRoot, "docker-compose.yml"),
    `version: "3.9"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"

  api:
    build: ./backend
    command: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
`
  );

  // Create Dockerfile for backend
  await fs.writeFile(
    path.join(backendDir, "Dockerfile"),
    `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`
  );

  // Create .dockerignore
  await fs.writeFile(
    path.join(backendDir, ".dockerignore"),
    `__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
*.egg-info/
dist/
build/
.pytest_cache/
.coverage
`
  );

  // Create README.md
  await fs.writeFile(
    path.join(backendDir, "README.md"),
    `# Backend API

FastAPI backend with PostgreSQL and Docker Compose.

## Setup

1. Start the services:
\`\`\`bash
docker-compose up --build
\`\`\`

2. The API will be available at http://localhost:8000

3. API documentation at http://localhost:8000/docs

## Development

To run locally without Docker:

1. Create a virtual environment:
\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

2. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. Run the server:
\`\`\`bash
uvicorn app.main:app --reload
\`\`\`
`
  );
}

