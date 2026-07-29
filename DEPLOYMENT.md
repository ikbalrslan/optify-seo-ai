## ⚠ Leaked secret — rotate before going further

`src/actions/register.ts` had a hardcoded reCAPTCHA **secret** key (`6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe`), committed in `00633e8` and merged into `master` — it's already on GitHub in commit history, not just something removed from the current files. Moving it to `RECAPTCHA_SECRET_KEY` (done) stops it leaking further but does **not** undo the exposure; the old value is still readable by anyone with repo access via `git log`/`git blame`. Go to the [reCAPTCHA admin console](https://www.google.com/recaptcha/admin) and **regenerate the secret key** for this site, then use the new value for the `RECAPTCHA_SECRET_KEY` GitHub secret below. Rewriting git history (`git filter-repo`/BFG) to scrub the old commit is usually not worth it once the key is rotated — the exposed value becomes worthless — and it would force-rewrite shared history, so only do that if you have a specific reason to (e.g. a public repo you want fully clean).

The reCAPTCHA **site** key was also hardcoded but that one is meant to be public (it ships to the browser regardless) — moved to an env var for consistency, not because it was a real leak.

Also fixed while auditing: `src/lib/encryption.ts` and `src/app/api/cron/autopilot/route.ts` had hardcoded *fallback* values (`ENCRYPTION_KEY`/`CRON_SECRET`) that silently activated if the real env var was ever unset — effectively a hardcoded master key/credential sitting in source. Both now fail closed (throw / reject) instead of falling back to a known value.

## Ongoing secret-leak prevention

- `.github/workflows/secret-scan.yml` runs [gitleaks](https://github.com/gitleaks/gitleaks) on every push to `master`/`acceptance` and every PR, scoped to just the newly introduced commits (not full history — see the workflow's comments for why). A real finding fails the build.
- A local pre-commit hook is installed on this VPS at `.git/hooks/pre-commit` (not version-controlled, so it only protects commits made from here — everyone else relies on the CI check above). It blocks any commit whose staged changes contain a likely secret; override with `git commit --no-verify` for false positives.

# Deployment

`optifyseo.ai` deploys via GitHub Actions (`.github/workflows/deploy.yml`) to a self-managed VPS running Docker Compose, using SQLite for the database and Cloudflare R2 for file storage. Push to `master` deploys prod; push to `acceptance` deploys the acceptance/UAT environment. Both live on the same VPS behind a shared Caddy reverse proxy (`Caddyfile`) that routes by hostname — `optifyseo.ai` → the `prod` container, `acceptance.optifyseo.ai` → the `acceptance` container, `www.optifyseo.ai` → redirected (301) to the apex — each app with its own SQLite volume, so test data never touches prod. All three (`caddy`, `prod`, `acceptance`) are services in the one `docker-compose.yml`, sharing a single `.env` of third-party secrets (Anthropic, Stripe, Google, R2 — same accounts for both environments; only the per-environment URL/DB values differ, set directly in the compose file).

This VPS is the only deployment target — the app previously also ran on AWS Amplify (`www.optifyseo.ai`, serving from a CloudFront distribution) during the migration; Amplify has since been fully retired (app deleted, `amplify.yml` removed, DNS repointed) and is mentioned below only where it's relevant history.

AI content generation (blog posts, in `src/actions/generate-blog.ts`) uses the **Anthropic API** (`claude-sonnet-5`) — this requires an API key from [console.anthropic.com](https://console.anthropic.com), a separate product from a personal claude.ai/Claude Code subscription; there's no way to point application code at a personal subscription. `GOOGLE_PAGESPEED_API_KEY` is unrelated to this — it powers the Analyzer feature's Lighthouse/performance scoring (Google PageSpeed Insights API), not any LLM.

## One-time manual setup

These steps need account access this pipeline doesn't have, so they're not automated.

### 1. GitHub Actions secrets

Repo → Settings → Secrets and variables → Actions → New repository secret. Add all of these:

**Infra (already provisioned for you):**
- `VPS_HOST` — the VPS IP
- `VPS_USER` — `ikbal`
- `VPS_SSH_KEY` — dedicated deploy key (already generated and installed in `~/.ssh/authorized_keys` on the VPS)

**Generated for you (see below for values, or generate your own):**
- `AUTH_SECRET`
- `ENCRYPTION_KEY`
- `CRON_SECRET`

**You need to supply these** (existing values from the old Amplify deployment, or new ones):
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — Google OAuth client (Google Cloud Console)
- `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com) API key (not a claude.ai/Claude Code subscription — see note above). Powers blog-post generation via `claude-sonnet-5`.
- `GOOGLE_PAGESPEED_API_KEY` — PageSpeed Insights API key (Analyzer feature, unrelated to the AI provider)
- `SERPAPI_KEY` — [serpapi.com](https://serpapi.com/users/sign_up) API key (free tier: 250 searches/month). Powers the Keyword Generator's Top/Rising discovery via the Google Trends engine.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe dashboard
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` — see step 2
- `RECAPTCHA_SECRET_KEY`, `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` — [reCAPTCHA admin console](https://www.google.com/recaptcha/admin). **Use a newly regenerated secret key, not the old leaked one** — see the warning at the top of this file

Note: since this is a fresh SQLite database (no data migrated from the old MongoDB), a new `ENCRYPTION_KEY` is fine — there's no old encrypted data it needs to match.

GHCR image visibility doesn't matter — the deploy step logs in to `ghcr.io` on the VPS using the workflow's own `GITHUB_TOKEN`, so the package can stay private.

### 2. Cloudflare R2

Cloudflare dashboard → R2 → Create bucket (e.g. `optifyseo`) → Manage API tokens → create a token scoped to that bucket with read/write. You'll get an Account ID, Access Key ID, and Secret Access Key — those become the four `R2_*` secrets above.

### 3. DNS (Porkbun — not Cloudflare)

`optifyseo.ai`'s nameservers are Porkbun's own (`*.ns.porkbun.com`), confirmed via `dig NS optifyseo.ai` — despite R2 living on Cloudflare, this domain's DNS is unrelated to that account. Porkbun is plain DNS with no reverse-proxy/CDN layer, so there's nothing like Cloudflare's "Flexible SSL" here — Caddy handles real TLS itself via automatic Let's Encrypt certificates (`Caddyfile` has no `http://` prefix, which is what enables this).

Current records in the [Porkbun dashboard](https://porkbun.com/account/domains) → DNS records for `optifyseo.ai` (all pointing at the VPS):
- `A` record, host `` (apex), answer `89.167.18.180`
- `AAAA` record, host `` (apex), answer `2a01:4f9:c013:240c::1`
- `A` record, host `acceptance`, answer `89.167.18.180`
- `AAAA` record, host `acceptance`, answer `2a01:4f9:c013:240c::1`
- `CNAME` record, host `www`, answer `optifyseo.ai` — resolves through to the apex's A/AAAA above; Caddy 301-redirects it to `https://optifyseo.ai` (see `Caddyfile`)

No "proxied" toggle to worry about — these are direct records to the VPS; Caddy handles TLS itself via automatic Let's Encrypt certificates.

If re-provisioning on a new VPS: add the `acceptance` record first (safe anytime, nothing else serves that hostname) and verify it deploys correctly before touching the apex or `www` — see step 4 for the cutover sequence that was followed here.

⚠️ **Hetzner Cloud Firewall**: this VPS is Hetzner Cloud. If the server has a Cloud Firewall attached (configured in the Hetzner console, separate from anything on the OS itself), it can block inbound ports regardless of what's listening — check that ports 80 and 443 (TCP, and 443/UDP for HTTP/3) are allowed inbound before assuming a connectivity failure is a DNS or Caddy problem.

### 4. Cut over (done — kept here as reference)

This is the sequence that was actually followed to bring prod live, useful again if this ever needs to be redone on a new VPS:

1. Add the secrets and push to `master`; watch the Actions tab go green.
2. Verify from the VPS itself before touching DNS (`curl -H "Host: optifyseo.ai" http://localhost/api/health`) — safe to rehearse since nothing external serves that hostname yet.
3. Add the `optifyseo.ai` apex A/AAAA records at Porkbun (see step 3) and confirm Caddy provisions a real Let's Encrypt cert for it (`docker compose logs caddy`).
4. Repoint `www.optifyseo.ai` from its old Amplify CloudFront CNAME to `optifyseo.ai` (the apex) and add the corresponding `www.optifyseo.ai` block to `Caddyfile` (redirect to the apex).
5. Once `www` also has a cert and redirects correctly, delete the AWS Amplify app and remove `amplify.yml` — nothing depends on Amplify at that point.

Pushing to `acceptance` has no such gate — merge the acceptance PR whenever, and once its DNS record exists it deploys and updates immediately, independent of prod.

## Ongoing

Every push to `master` redeploys automatically. To roll back, revert the commit and push — the workflow rebuilds and redeploys.

Database migrations: add a new migration with `npx prisma migrate dev --name <description>` locally (or via a throwaway container, since this schema also needs Node — see below), commit `prisma/migrations/`, push. The deploy step runs `prisma migrate deploy` automatically.

If you don't have Node installed locally, generate migrations via Docker instead:
```
docker run --rm -v "$(pwd)":/app -w /app -e DATABASE_URL="file:./dev.db" node:22-bookworm-slim \
  bash -c "apt-get update -qq && apt-get install -y -qq openssl >/dev/null && npm ci && npx prisma migrate dev --name <description>"
rm prisma/dev.db prisma/dev.db-journal
```
