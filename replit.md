# Student Diary

An Expo student companion for viewing attendance, notices, schedules, and academic records.

## Run & Operate

- Run the managed workflow `artifacts/student-diary: expo` for the mobile app and browser preview. Replit supplies its port and Expo preview domain.
- Use Node.js 24 (configured in `.replit`).
- Dependencies must be installed with `pnpm install --frozen-lockfile` from the repository root before starting the imported project.
- `pnpm --filter @workspace/student-diary run typecheck` — check the mobile app.
- From `artifacts/student-diary`, run `CI=1 pnpm exec expo install --check` and `pnpm dlx expo-doctor@latest` to check Expo compatibility.
- Student Diary currently stores attendance locally with AsyncStorage; its preview does not require the API server or a database.
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env for the API server only: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
