# QuoteCheck v1 - Deployment Checklist

## Pre-Deployment

- [ ] All env vars set
- [ ] Cloudflare account ready
- [ ] Tests passing: pnpm test
- [ ] No TypeScript errors

## Create Cloudflare Resources

1. Create D1: `wrangler d1 create quotecheck`
2. Create R2: `wrangler r2 bucket create quotecheck-photos`
3. Get Turnstile keys from Dashboard
4. Update wrangler.toml with resource IDs

## Initialize Database

```bash
wrangler d1 execute quotecheck --file=./apps/worker/migrations/0001_initial.sql
wrangler d1 execute quotecheck --file=./apps/worker/migrations/0002_seed_demo.sql
```

## Deploy

```bash
pnpm build
wrangler deploy
```

## Post-Deployment Tests

- [ ] `curl /health` returns ok
- [ ] `curl /api/categories` returns 6 categories
- [ ] `curl /api/intake/1` returns questions
- [ ] Manual test: homepage → category → estimate → results

## Verify Security

- [ ] /admin routes not public
- [ ] Turnstile verification working
- [ ] R2 bucket private
- [ ] No secrets in Git

---

Full deployment instructions in README.md
