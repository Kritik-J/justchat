# JustChat Monorepo

This is the monorepo for the JustChat project, managed with [Turborepo](https://turbo.build/) and [pnpm workspaces](https://pnpm.io/workspaces). It contains all applications, shared packages, and infrastructure code for the project.

---

## Monorepo Structure

```
.
├── apps/
│   ├── webapp/      # Main frontend application (React, Vite)
│   └── sam/         # AWS SAM templates and scripts for infrastructure
├── packages/
│   ├── database/    # Database layer (Mongoose, TypeScript interfaces, repository)
│   ├── ui/          # Shared React UI components, hooks, and styles
│   ├── logger/      # Centralized logging utility (pino)
│   ├── email/       # Email templates/components (React)
│   ├── eslint-config/ # Shared ESLint configuration
│   └── tsconfig/    # Shared TypeScript configuration
├── turbo.json       # Turborepo pipeline configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── ...
```

---

## Apps

### `apps/webapp`

- Main frontend application built with React and Vite.
- Uses internal packages for database access, UI components, and logging.
- Organized into routes, components, providers, services, and utilities.

### `apps/sam`

- Contains AWS SAM (Serverless Application Model) templates and scripts.
- Used for deploying infrastructure (e.g., S3, SQS) via CloudFormation YAML templates.
- Includes automation scripts for deployment.

---

## Packages

### `packages/database`

- Implements the data layer using Mongoose (MongoDB).
- Provides TypeScript interfaces, Mongoose schemas/models, a generic repository, and a DB client.
- Centralizes all data access logic for the project.

### `packages/ui`

- Shared React UI components, hooks, icons, and styles.
- Promotes design consistency and code reuse across frontends.

### `packages/logger`

- Exports a simple logger using `pino` for consistent logging across the codebase.

### `packages/email`

- Contains email templates (React components) and email-related utilities.
- Example: Magic Link authentication email, with shared header/footer components.

### `packages/eslint-config`

- Centralized linting rules for all packages and apps.

### `packages/tsconfig`

- Centralized TypeScript configuration presets for different use cases (Next.js, React library, base).

---

## Development Workflow

- **Install dependencies:**
  ```sh
  pnpm install
  ```
- **Build all apps and packages:**
  ```sh
  pnpm build
  ```
- **Develop (watch mode) all apps and packages:**
  ```sh
  pnpm dev
  ```
- **Lint all code:**
  ```sh
  pnpm lint
  ```
- **Typecheck all code:**
  ```sh
  pnpm typecheck
  ```

---

## How Everything Connects

- The **webapp** imports from `@justchat/database` for data access, `@justchat/logger` for logging, and `@justchat/ui` for UI components.
- The **database** package provides a robust, type-safe, and reusable way to interact with MongoDB.
- The **email** package provides ready-to-use email templates for user communication.
- The **sam** app is used for deploying backend infrastructure (e.g., queues, storage) needed by your app.

---

## Contributing

1. Fork the repo and create your branch from `main`.
2. Make your changes and add tests if applicable.
3. Run lint and typecheck before pushing:
   ```sh
   pnpm lint && pnpm typecheck
   ```
4. Open a pull request.

---

## Notes

- This monorepo is designed for scalability, code reuse, and developer productivity.
- All packages and apps are written in TypeScript.
- Infrastructure is managed as code (AWS SAM).

---

## License

This project is for internal reference and development. License details to be added as needed.
