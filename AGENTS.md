# Repository Guidelines

## Project Structure & Module Organization

AgriculNet is split into `client/` and `server/`. The client uses Next.js 14 App Router: routes live in `client/src/app`, reusable UI in `client/src/components`, data hooks in `client/src/hooks`, and shared state/utilities in `client/src/store` and `client/src/lib`. Global styles are in `client/src/styles` and public assets are in `client/public`.

The Express API starts in `server/server.js` and `server/src/app.js`. Domain modules live under `server/src/modules/<domain>` with route, controller, service, repository, and validator files where applicable. Database migrations and safe seed templates are under `server/database`. Keep tests beside the code as `*.test.js` or `*.test.jsx`.

## Build, Test, and Development Commands

- `npm run dev:client` starts Next.js locally.
- `npm run dev:server` starts the API with Nodemon.
- `npm run verify:client` runs client lint, Vitest, and the production build.
- `npm run verify:server` checks Node syntax, runs Jest, and validates installed dependencies.
- `npm run verify` executes both gates in sequence; run it before opening a pull request.
- `npm run smoke:api` checks a separately running API health endpoint.

## Coding Style & Naming Conventions

Use JavaScript/JSX, two-space indentation, semicolons, and existing CommonJS conventions on the server. React components use PascalCase (`OrderDetailView.jsx`); hooks use `useCamelCase`; functions and variables use camelCase. Keep route folders lowercase and follow existing Next.js dynamic segments such as `[id]`. Run the configured Next.js ESLint task; avoid repository-wide formatting changes.

## Testing Guidelines

Client tests use Vitest and React Testing Library. Server tests use Jest, including real HTTP characterization tests where useful. Cover authorization, validation, error envelopes, state transitions, and failure compensation—not only happy paths. Every bug fix should include a focused regression test.

## Commit & Pull Request Guidelines

History favors short descriptive subjects. Use an imperative, scoped summary such as `payments: harden webhook settlement`. Keep commits focused. Pull requests should explain behavior changes, list verification commands, link relevant issues, and include screenshots for visible UI changes. Call out migrations, environment variables, and prototype-only functionality explicitly.

## Security & Configuration

Never commit API keys, passwords, usable hashes, or admin credentials. Copy environment examples locally and store real values only in ignored `.env` files or deployment secrets. Apply new database migrations before deploying dependent server code.
