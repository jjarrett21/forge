# Forge CLI - Testing Instructions

## Setup

1. Install dependencies:
```bash
cd /Users/jamesjarrett/projects/Forge
pnpm install
```

2. Link the CLI package:
```bash
cd packages/cli
pnpm link --global
```

Or use npm:
```bash
cd packages/cli
npm link
```

## Testing

1. Run the CLI:
```bash
forge my-app
```

2. Follow the interactive prompts:
   - Enter project name (or use the provided `my-app`)
   - Select "Frontend" as project type
   - Confirm using Kitchen Sink starter (default: yes)

3. The CLI will:
   - Create the project using `npm create react-vite-kitchen-sink@latest`
   - Install dependencies with `npm install`
   - Display success message with next steps

4. Verify the project was created:
```bash
cd my-app
npm run dev
```

## Project Structure

```
Forge/
├── packages/
│   ├── cli/          # CLI entry point with prompts
│   │   └── src/
│   │       └── index.ts
│   └── core/         # Core scaffolding functions
│       └── src/
│           ├── createFrontendProject.ts
│           └── index.ts
└── pnpm-workspace.yaml
```

## Notes

- The CLI uses `@clack/prompts` for a better user experience
- The core function uses `child_process.spawn` with `stdio: "inherit"` as specified
- The project is created in the current working directory

