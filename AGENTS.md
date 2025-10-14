# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js route groups and feature pages; shared UI lives under `app/(app)/statistiques` and other nested segments.
- `components/`, `hooks/`, `stores/`, `lib/`: Reusable React building blocks, Zustand stores, and utilities; keep domain-specific logic close to its feature directory.
- `prisma/`: Schema, migrations, and seed helpers; update this before touching database-facing code.
- `public/` and `translations/`: Static assets and i18n resources—mirror naming between assets and translation keys.
- `scripts/` and `docs/`: Automation (Azure tooling, DB helpers) and internal documentation; place new operational scripts here.

## Build, Test, and Development Commands
- `npm run dev`: Launches the Next.js dev server (Turbopack) with hot reload; requires `.env.local`.
- `npm run build`: Generates Prisma client then compiles the production bundle.
- `npm start`: Runs the optimized production server after a successful build.
- `npm run lint`: Executes `next lint`; resolve every warning before opening a PR.
- `npm run db:push` / `npm run db:reset`: Sync Prisma schema to the database; use reset sparingly on shared environments.
- `npm run azure:sync`: Example operational script; mirror the pattern for new storage-maintenance tasks.

## Coding Style & Naming Conventions
- TypeScript-first codebase; keep components and hooks strongly typed with `zod` schemas or `Prisma` types where applicable.
- Use `PascalCase` for components, `camelCase` for functions/variables, kebab-case for filenames in feature directories.
- Tailwind CSS powers styling—compose utility classes and avoid inline styles unless dynamic logic requires them.
- Run `npm run lint` or rely on your editor’s ESLint integration before commits to maintain import ordering and accessibility checks.

## Testing Guidelines
- Automated tests are minimal today; when adding them, follow the `*.test.ts[x]` pattern adjacent to the code under test.
- Favor lightweight component tests (e.g., Vitest + Testing Library) and integrate them into `npm test` if introduced.
- Always perform manual smoke checks for analytics dashboards and data-heavy views after touching Prisma schema or async hooks.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat:`, `refactor:`, `fix:`) as seen in the existing history.
- Keep commits focused; include schema changes and generated clients in the same commit when necessary.
- Pull requests should describe the user impact, list key screenshots for UI changes, and reference related Jira/Azure work items or GitHub issues.
- Confirm `npm run lint`, relevant manual QA steps, and any database migrations in the PR checklist before requesting review.
