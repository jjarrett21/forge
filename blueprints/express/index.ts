import fs from "fs-extra";
import path from "path";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  dependencies: {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
  },
  devDependencies: {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.2",
  },
  scripts: {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
  },
  async setup(target: string) {
    // Target is already the backend directory
    await fs.ensureDir(target);
    await fs.ensureDir(path.join(target, "src"));

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

    // Create .env.example
    await fs.writeFile(
      path.join(target, ".env.example"),
      `PORT=3000
NODE_ENV=development
`
    );

    // Create main server file
    await fs.writeFile(
      path.join(target, "src", "index.ts"),
      `import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Example route
app.get("/api/users", (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`
    );

    // Create README
    await fs.writeFile(
      path.join(target, "README.md"),
      `# Express.js Backend

Express.js backend with TypeScript.

## Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
# Copy .env.example to .env and update as needed
cp .env.example .env
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build for production
- \`npm run start\` - Start production server
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

