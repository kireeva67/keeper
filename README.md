# Keeper

Keeper is a personal bookmarking app. Save links as "products" with a title, description, image (fetched via Open Graph) and a category, then browse and filter them from a mobile-first UI.

## Features

- Email/password sign-up and login, plus Google SSO
- Password reset by email (Resend)
- Save, edit and delete bookmarks; images and metadata are scraped from the URL
- Default and custom colored categories, with a category filter row
- Per-user URL uniqueness, rate limiting on products and categories
- Settings page with profile and account deletion

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Client   | React 19, TypeScript, Vite, MUI, React Router, Vitest + Testing Library |
| Server   | Node.js, Express 5, TypeScript, Passport (Google OAuth), express-rate-limit, open-graph-scraper, Vitest + Supertest |
| Database | SQLite via Prisma (`better-sqlite3` adapter) |
| Deploy   | Docker Compose (nginx serves the client) |

## Project Structure

npm workspaces monorepo:

```
packages/
  client/   React SPA (src/app, src/features/{auth,products,settings}, src/shared)
  server/   Express API (src/routes, src/middleware, src/prisma, src/token, src/utils, ...) + Prisma schema and migrations
docker-compose.yml
```

## API Overview

| Prefix            | Purpose |
| ----------------- | ------- |
| `/auth`           | Sign-up, login, logout, Google OAuth, forgot/reset password |
| `/api/products`   | CRUD for bookmarks |
| `/api/categories` | List, create and delete categories (products of a deleted category move to "Other") |
| `/api/me`         | Current user (`id`, `email`, `hasPassword`), password change, account deletion |

All `/api` routes require a session cookie, including `/api/healthCheck`.

## Getting Started

### Prerequisites

- Node.js 20.19+, 22.12+ or 24+ (required by Prisma 7.10) and npm

### Install

```bash
npm install
```

### Configure

Create `packages/server/.env`:

```env
DATABASE_URL=file:./dev.db
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:3000
RESEND_API_KEY=...         # needed to send password reset emails
GOOGLE_CLIENT_ID=...       # optional, see below
GOOGLE_CLIENT_SECRET=...   # optional
LOG_LEVEL=info             # optional (pino level)
```

Google sign-in is optional: without `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` the server logs a warning and `/auth/google*` returns 503. Email and password login still works.

Create `packages/client/.env` with the API base URL. The client reads it at build time:

```env
VITE_API_URL=http://localhost:3000
```

Never commit `.env` files.

### Database

```bash
npm -w @repo/server run migrate    # apply migrations
npm -w @repo/server run generate   # generate the Prisma client
npm run studio                     # optional: browse data in Prisma Studio
```

### Run

```bash
npm run dev     # client on http://localhost:5173, API on http://localhost:3000
```

### Test, type check and lint

```bash
npm -w @repo/client run test -- --run
npm -w @repo/server run test -- --run
npx -w @repo/client tsc -b
npx -w @repo/server tsc --noEmit
npm -w @repo/client run lint
```

Server tests mock Prisma, so they do not touch the database.

### End-to-end tests

Browser tests (Playwright) live in `e2e/` and click through the main flows: sign-up and login, bookmarks and categories, settings. Each test signs up its own throwaway `@example.invalid` account.

```bash
npx playwright install chromium               # once, downloads the browser
npm run test:e2e                              # all tests
npx playwright test --grep-invert @network    # skip tests that need the internet
npx tsc -p e2e                                # type check the tests
```

Playwright starts its own API on port `3201` and client on port `5201`, so the tests can run next to `npm run dev`. The API uses a fresh database, `packages/server/e2e.db`, rebuilt from the migrations on every run; `dev.db` is never touched. Bookmarks use fake `https://shop.example.invalid/...` addresses, so no real site is contacted, except by tests tagged `@network`, which fetch a real page to check that its preview image loads. On failure, the screenshot and trace are in `test-results/` (`npx playwright show-trace <trace.zip>`).

### Build

```bash
npm run build
```

## Docker

The root `.env` supplies `DOCKER_USERNAME`, `VITE_API_URL`, `CLIENT_URL` and `API_URL`; the server also reads `packages/server/.env`.

```bash
docker compose up --build
```

The client is served on port `8080`. The server listens on port `3000` inside the compose network, and SQLite data is stored in the `db-data` volume.

The Docker setup is not deployable yet: the server container does not run `prisma migrate deploy`, so a fresh volume has no tables. This is planned as part of the CI/CD work.

## Design

UI and styling conventions (theme, category colors, card layout, accessibility) are documented in [CLAUDE.md](CLAUDE.md).
