# Optify

Optify is an all-in-one, AI-powered SEO platform: connect a website and Optify researches keywords, writes and publishes SEO-optimized articles on autopilot, audits on-page/technical SEO, and reports on organic growth — all from one dashboard.

Live at **[optifyseo.ai](https://optifyseo.ai)** · UAT at `acceptance.optifyseo.ai`.

## Features

- **Autopilot content engine** — discovers keywords (Google Trends via SerpApi), generates SEO-optimized articles with Claude, and publishes them straight to a connected site on a schedule.
- **Keyword research & discovery** — Top/Rising keyword suggestions, search intent, and per-project keyword tracking.
- **Site analyzer** — on-page and technical SEO scoring backed by the Google PageSpeed Insights (Lighthouse) API.
- **CMS integrations** — connect WordPress and other platforms so generated content publishes automatically.
- **Organizations & teams** — multi-tenant orgs with invites, roles, and per-organization billing.
- **Billing** — Stripe subscriptions, priced per connected site with automatic volume discounts.
- **Admin console** — user/plan management and staff-only overrides.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript |
| Styling / UI | Tailwind CSS 4, Radix UI, [shadcn/ui](https://ui.shadcn.com)-style components |
| Database | SQLite via [Prisma](https://www.prisma.io) ORM |
| Auth | [Auth.js](https://authjs.dev) (NextAuth v5) — Google OAuth + email/password |
| AI | [Anthropic API](https://console.anthropic.com) (`claude-sonnet-5`) for content generation |
| Payments | [Stripe](https://stripe.com) |
| File storage | Cloudflare R2 (S3-compatible) |
| Keyword data | [SerpApi](https://serpapi.com) (Google Trends) |
| Deployment | Docker Compose + [Caddy](https://caddyserver.com) on a self-managed VPS, built and shipped via GitHub Actions |

## Getting started

### Prerequisites

- Node.js 22+
- npm
- A SQLite-compatible environment (works out of the box, no separate DB server needed)

### 1. Clone and install

```bash
git clone https://github.com/ikbalrslan/optify-seo-ai.git
cd optify-seo-ai
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root (see [Environment variables](#environment-variables) below for what each key does and where to get it).

### 3. Set up the database

```bash
npx prisma migrate dev
```

This applies all migrations in `prisma/migrations/` to a local SQLite file (`prisma/dev.db`).

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | `prisma generate` + `next build` (production build) |
| `npm run start` | Start the production server (run `build` first) |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite connection string, e.g. `file:./prisma/dev.db` locally, `file:/data/app.db` in the container |
| `AUTH_SECRET` | ✅ | Auth.js session/JWT signing secret. Generate with `npx auth secret` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth client (Google Cloud Console) — also grants Search Console read access |
| `NEXTAUTH_URL` / `AUTH_URL` | ✅ (prod) | Canonical app URL Auth.js should trust, e.g. `https://optifyseo.ai` |
| `AUTH_TRUST_HOST` | prod only | Set to `true` when running behind a reverse proxy (Caddy) |
| `ENCRYPTION_KEY` | ✅ | Encrypts stored credentials (e.g. connected-site secrets). Fails closed if unset — no insecure fallback |
| `CRON_SECRET` | ✅ | Bearer token that authorizes the autopilot cron endpoints |
| `ANTHROPIC_API_KEY` | ✅ | [console.anthropic.com](https://console.anthropic.com) API key — powers article generation via `claude-sonnet-5`. This is a separate product from a personal claude.ai/Claude Code subscription |
| `GOOGLE_PAGESPEED_API_KEY` | ✅ | Powers the Analyzer's Lighthouse/performance scoring (Google PageSpeed Insights API) |
| `SERPAPI_KEY` | ✅ | [serpapi.com](https://serpapi.com/users/sign_up) key — powers Keyword Generator Top/Rising discovery via Google Trends |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | ✅ | Stripe dashboard — billing and subscription webhooks |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key (client-side, baked in at build time) |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | ✅ | Cloudflare R2 bucket + scoped API token for file storage |
| `RECAPTCHA_SECRET_KEY` / `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | ✅ | [reCAPTCHA admin console](https://www.google.com/recaptcha/admin) — bot protection on signup |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL, baked in at build time (e.g. `https://optifyseo.ai`) |

`NEXT_PUBLIC_*` values are inlined into the client bundle at **build time** (see `Dockerfile`), everything else is read at **runtime**.

## Project structure

```
src/
  app/            Next.js App Router routes
    (app)/        Authenticated product pages (dashboard, autopilot, keywords, analyzer, settings...)
    admin/        Staff-only admin console
    api/          Route handlers (webhooks, cron endpoints, health check)
    blog/         Public marketing blog
  actions/        Server actions (billing, organizations, autopilot, wordpress, ...)
  components/     UI components, grouped by feature area
  lib/            Shared server-side utilities (encryption, R2, Stripe, cron, SEO helpers)
  config/         App-level constants (plans, etc.)
prisma/
  schema.prisma   Data model
  migrations/     Versioned migrations (applied via `prisma migrate deploy` on deploy)
```

## Deployment

Optify deploys via GitHub Actions (`.github/workflows/deploy.yml`) to a self-managed Docker Compose host:

- Push to **`master`** → builds and ships **prod** (`optifyseo.ai`)
- Push to **`acceptance`** → builds and ships the **acceptance/UAT** environment (`acceptance.optifyseo.ai`)

Both environments run as separate containers on the same VPS, each with its own SQLite volume, fronted by a single shared [Caddy](https://caddyserver.com) instance that terminates TLS (automatic Let's Encrypt) and routes by hostname. `www.optifyseo.ai` redirects to the apex.

Full setup instructions — GitHub Actions secrets, DNS records, R2 bucket setup, and how to roll back — are in **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

## Database migrations

```bash
npx prisma migrate dev --name <description>
```

Commit the generated `prisma/migrations/` folder and push — the deploy workflow runs `prisma migrate deploy` automatically against the target environment. See [DEPLOYMENT.md](./DEPLOYMENT.md#ongoing) for the Docker-only workflow if you don't have Node installed locally.

## Security

Found a vulnerability or a potential secret leak? Please report it privately rather than opening a public issue — see the notes in [DEPLOYMENT.md](./DEPLOYMENT.md) for current handling practices.
