# 🔥 Forge

A CLI tool that uses Claude to generate a project with the bare bones of either frontend, backend or fullstack. This is for developers and by developers.

## Features

- **Interactive Mode**: Guided prompts to scaffold your project
- **Natural Language Mode**: Describe your project in plain English and let Claude interpret it
- **Frontend Projects**: React + Vite + Tailwind CSS + React Query
- **Backend Projects**: FastAPI + PostgreSQL + Docker
- **Full-Stack Projects**: Complete frontend + backend setup with Docker Compose

## Installation

```bash
npm install -g create-forge
```

Or use with npx (no installation required):

```bash
npx create-forge my-app
```

## Usage

### Interactive Mode

Simply run:

```bash
forge my-app
```

Follow the interactive prompts to choose:
- Project name
- Project type (Frontend, Backend, or Full Stack)
- Configuration options

### Natural Language Mode (AI-Powered)

Describe your project in plain English and let AI interpret it:

```bash
forge --from-prompt
```

Example prompts:
- "I want a web app with React UI, FastAPI backend, and Postgres. Use Docker."
- "Create a frontend project with React and Tailwind"
- "Build a full-stack app with authentication"

**Note:** This feature includes 10 free AI interpretations per day. No API key required!

## Project Types

### Frontend
- React 18+
- Vite for blazing-fast builds
- Tailwind CSS for styling
- React Query for data fetching
- TypeScript support

### Backend
- FastAPI framework
- PostgreSQL database
- Docker & Docker Compose
- API documentation with Swagger
- Type hints and validation

### Full Stack
- Complete frontend + backend integration
- Docker Compose orchestration
- Pre-configured CORS and proxy
- Ready for development

## Quick Start

```bash
# Install globally
npm install -g create-forge

# Create a new project
forge my-awesome-app

# Navigate to your project
cd my-awesome-app

# Start development
docker-compose up --build  # for full-stack/backend
# or
npm run dev                 # for frontend only
```

## Development

Want to contribute? Here's how to set up the project locally:

```bash
# Clone the repository
git clone https://github.com/jjarrett21/forge.git
cd forge

# Install dependencies
pnpm install

# Link for local testing
cd packages/cli
pnpm link --global

# Test the CLI
forge test-project
```

## Project Structure

```
Forge/
├── packages/
│   ├── cli/           # CLI entry point with prompts
│   └── core/          # Core scaffolding functions
├── src/               # Main source code
├── blueprints/        # Project templates
└── output/            # Generated projects (gitignored)
```

## Requirements

- Node.js 18 or higher
- npm or pnpm
- Docker (for backend/fullstack projects)

## License

ISC

## Author

[jjarrett21](https://github.com/jjarrett21)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

Found a bug or have a feature request? [Open an issue](https://github.com/jjarrett21/forge/issues)

---

Made with ❤️ by developers, for developers.
