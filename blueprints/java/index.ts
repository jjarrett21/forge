import fs from "fs-extra";
import path from "path";
import type { Blueprint } from "../../src/compose.js";

export const blueprint: Blueprint = {
  scripts: {
    "dev:api": "cd backend && ./mvnw spring-boot:run",
    "build:api": "cd backend && ./mvnw clean package",
    "start:api": "cd backend && java -jar target/*.jar",
  },
  async setup(target: string) {
    const backendDir = path.join(target, "backend");
    await fs.ensureDir(backendDir);
    await fs.ensureDir(path.join(backendDir, "src", "main", "java", "com", "example", "backend"));
    await fs.ensureDir(path.join(backendDir, "src", "main", "java", "com", "example", "backend", "controller"));
    await fs.ensureDir(path.join(backendDir, "src", "main", "java", "com", "example", "backend", "model"));
    await fs.ensureDir(path.join(backendDir, "src", "main", "resources"));
    await fs.ensureDir(path.join(backendDir, "src", "test", "java"));

    // Create pom.xml
    await fs.writeFile(
      path.join(backendDir, "pom.xml"),
      `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.example</groupId>
    <artifactId>backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>backend</name>
    <description>Spring Boot REST API</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`
    );

    // Create application.properties
    await fs.writeFile(
      path.join(backendDir, "src", "main", "resources", "application.properties"),
      `spring.application.name=backend
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/mydb
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
`
    );

    // Create application.yml.example
    await fs.writeFile(
      path.join(backendDir, "src", "main", "resources", "application.yml.example"),
      `spring:
  application:
    name: backend
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: postgres
    password: postgres
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

server:
  port: 8080
`
    );

    // Create main application class
    await fs.writeFile(
      path.join(backendDir, "src", "main", "java", "com", "example", "backend", "BackendApplication.java"),
      `package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}
`
    );

    // Create HealthController
    await fs.writeFile(
      path.join(backendDir, "src", "main", "java", "com", "example", "backend", "controller", "HealthController.java"),
      `package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        return ResponseEntity.ok(response);
    }
}
`
    );

    // Create User model
    await fs.writeFile(
      path.join(backendDir, "src", "main", "java", "com", "example", "backend", "model", "User.java"),
      `package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String name;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Getters and setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
`
    );

    // Create README.md
    await fs.writeFile(
      path.join(backendDir, "README.md"),
      `# Java Spring Boot Backend

RESTful API built with Spring Boot, Spring Data JPA, and PostgreSQL.

## Prerequisites

- Java 17 or later
- Maven 3.6+
- PostgreSQL database

## Setup

1. Set up your database:
\`\`\`bash
createdb mydb
\`\`\`

2. Update database configuration in \`src/main/resources/application.properties\`

3. Run the application:
\`\`\`bash
./mvnw spring-boot:run
\`\`\`

Or build and run:
\`\`\`bash
./mvnw clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
\`\`\`

## Configuration

Edit \`src/main/resources/application.properties\` to configure:
- Database connection
- Server port
- JPA settings

## API Endpoints

- \`GET /api/health\` - Health check endpoint

## Project Structure

- \`src/main/java/com/example/backend/\` - Main application code
- \`src/main/java/com/example/backend/controller/\` - REST controllers
- \`src/main/java/com/example/backend/model/\` - JPA entities
- \`src/main/resources/\` - Configuration files
- \`pom.xml\` - Maven dependencies and project configuration
`
    );

    // Create .gitignore
    await fs.writeFile(
      path.join(backendDir, ".gitignore"),
      `# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties
dependency-reduced-pom.xml
buildNumber.properties
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar

# IDE
.idea/
*.iml
*.iws
*.ipr
.vscode/
.classpath
.project
.settings/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
`
    );

    // Create mvnw wrapper script (simplified - in production, download from Maven)
    await fs.writeFile(
      path.join(backendDir, "mvnw"),
      `#!/bin/sh
# Maven Wrapper script
# In production, download mvnw from https://maven.apache.org/wrapper/

if command -v mvn > /dev/null 2>&1; then
    mvn "$@"
else
    echo "Maven not found. Please install Maven or download mvnw from https://maven.apache.org/wrapper/"
    exit 1
fi
`
    );
    await fs.chmod(path.join(backendDir, "mvnw"), 0o755);
  },
};

