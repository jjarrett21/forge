import fs from "fs-extra";
import path from "path";
import { execa } from "execa";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  dependencies: {
    "@prisma/client": "^5.7.0",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
  },
  devDependencies: {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    "prisma": "^5.7.0",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
  },
  scripts: {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && prisma generate",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
  },
  async setup(target: string) {
    // Target is already the backend directory
    await fs.ensureDir(target);
    await fs.ensureDir(path.join(target, "src"));
    await fs.ensureDir(path.join(target, "prisma"));

    // Create tsconfig.json
    await fs.writeJSON(
      path.join(target, "tsconfig.json"),
      {
        compilerOptions: {
          target: "ES2020",
          module: "commonjs",
          lib: ["ES2020"],
          outDir: "./dist",
          rootDir: "./src",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
        },
        include: ["src/**/*"],
        exclude: ["node_modules", "dist"],
      },
      { spaces: 2 }
    );

    // Create Prisma schema
    await fs.writeFile(
      path.join(target, "prisma", "schema.prisma"),
      `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`
    );

    // Create .env.example
    await fs.writeFile(
      path.join(target, ".env.example"),
      `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"
PORT=3000
`
    );

    // Create main server file
    await fs.writeFile(
      path.join(target, "src", "index.ts"),
      `import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Example route
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`
    );

    // Create README
    await fs.writeFile(
      path.join(target, "README.md"),
      `# TypeScript + Prisma Backend

Express.js backend with TypeScript and Prisma ORM.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up your database:
\`\`\`bash
# Copy .env.example to .env and update DATABASE_URL
cp .env.example .env

# Generate Prisma Client
npm run db:generate

# Push schema to database (or use migrations)
npm run db:push
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
- \`npm run db:generate\` - Generate Prisma Client
- \`npm run db:push\` - Push schema changes to database
- \`npm run db:migrate\` - Create and run migrations
- \`npm run db:studio\` - Open Prisma Studio (database GUI)
`
    );

    // Create .gitignore
    await fs.writeFile(
      path.join(target, ".gitignore"),
      `node_modules/
dist/
.env
*.log
.DS_Store
`
    );
  },
};

