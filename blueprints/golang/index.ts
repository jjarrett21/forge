import fs from "fs-extra";
import path from "path";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  scripts: {
    "dev:api": "cd backend && go run main.go",
    "build:api": "cd backend && go build -o bin/server main.go",
  },
  async setup(target: string) {
    const backendDir = target;
    await fs.ensureDir(backendDir);
    await fs.ensureDir(path.join(backendDir, "internal"));
    await fs.ensureDir(path.join(backendDir, "internal", "handlers"));
    await fs.ensureDir(path.join(backendDir, "internal", "models"));

    // Create go.mod
    await fs.writeFile(
      path.join(backendDir, "go.mod"),
      `module backend

go 1.21

require (
	github.com/gorilla/mux v1.8.1
	github.com/lib/pq v1.10.9
)
`
    );

    // Create main.go
    await fs.writeFile(
      path.join(backendDir, "main.go"),
      `package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type App struct {
	Router *mux.Router
	DB     *sql.DB
}

func (a *App) Initialize() {
	var err error

	// Get database connection string from environment
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbUser := getEnv("DB_USER", "postgres")
	dbPassword := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "mydb")

	connectionString := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName,
	)

	a.DB, err = sql.Open("postgres", connectionString)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	if err = a.DB.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	a.Router = mux.NewRouter()
	a.initializeRoutes()
}

func (a *App) initializeRoutes() {
	a.Router.HandleFunc("/health", a.healthCheck).Methods("GET")
	a.Router.HandleFunc("/api/users", a.getUsers).Methods("GET")
}

func (a *App) healthCheck(w http.ResponseWriter, r *http.Request) {
	respondWithJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (a *App) getUsers(w http.ResponseWriter, r *http.Request) {
	// Example: Query users from database
	rows, err := a.DB.Query("SELECT id, email, name FROM users LIMIT 10")
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var users []map[string]interface{}
	for rows.Next() {
		var id, email, name string
		if err := rows.Scan(&id, &email, &name); err != nil {
			respondWithError(w, http.StatusInternalServerError, err.Error())
			return
		}
		users = append(users, map[string]interface{}{
			"id":    id,
			"email": email,
			"name":  name,
		})
	}

	respondWithJSON(w, http.StatusOK, users)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func main() {
	app := App{}
	app.Initialize()

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, app.Router))
}
`
    );

    // Create .env.example
    await fs.writeFile(
      path.join(backendDir, ".env.example"),
      `DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mydb
PORT=8080
`
    );

    // Create README.md
    await fs.writeFile(
      path.join(backendDir, "README.md"),
      `# Go Backend

RESTful API built with Go, Gorilla Mux, and PostgreSQL.

## Prerequisites

- Go 1.21 or later
- PostgreSQL database

## Setup

1. Install dependencies:
\`\`\`bash
go mod download
\`\`\`

2. Set up your database:
\`\`\`bash
# Copy .env.example to .env and update database credentials
cp .env.example .env

# Create your database
createdb mydb
\`\`\`

3. Run the server:
\`\`\`bash
go run main.go
\`\`\`

Or build and run:
\`\`\`bash
go build -o bin/server main.go
./bin/server
\`\`\`

## Environment Variables

- \`DB_HOST\` - Database host (default: localhost)
- \`DB_PORT\` - Database port (default: 5432)
- \`DB_USER\` - Database user (default: postgres)
- \`DB_PASSWORD\` - Database password (default: postgres)
- \`DB_NAME\` - Database name (default: mydb)
- \`PORT\` - Server port (default: 8080)

## API Endpoints

- \`GET /health\` - Health check endpoint
- \`GET /api/users\` - Get list of users
`
    );

    // Create .gitignore
    await fs.writeFile(
      path.join(backendDir, ".gitignore"),
      `# Binaries
bin/
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of the go coverage tool
*.out

# Dependency directories
vendor/

# Go workspace file
go.work

# Environment files
.env
`
    );
  },
};

