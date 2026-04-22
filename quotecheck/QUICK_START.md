# QuoteCheck - 30-Minute Quick Start

## Goal: Get the app running locally

### Step 1: Install & Setup (5 min)

```bash
cd /workspaces/quotecheck-Perp-Chris/quotecheck
pnpm install
cp .env.example .env.local
```

### Step 2: Database Setup (5 min)

```bash
# Create local D1 database
wrangler d1 create quotecheck-dev

# Apply schema & seed data
wrangler d1 execute quotecheck-dev --file=./apps/worker/migrations/0001_initial.sql
wrangler d1 execute quotecheck-dev --file=./apps/worker/migrations/0002_seed_demo.sql
```

### Step 3: Start Development Servers (2 min)

**Terminal 1: Worker API**
```bash
cd apps/worker && npm run dev
# Runs on localhost:8787
```

**Terminal 2: Web Frontend**
```bash
cd apps/web && npm run dev
# Runs on localhost:3000
```

### Step 4: Test It Works (5 min)

1. Open http://localhost:3000
2. Select "Interior Painting"
3. Enter ZIP: `78704`
4. Answer 2-3 questions
5. Click "Get My Estimate"
6. See results: Low / Typical / High prices

✅ **Done!** App is working locally.

## What You Can Do Now

### Test the Estimation Engine

```bash
curl -X POST http://localhost:8787/api/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "areaId": 1,
    "answers": {"area_sqm": 100, "condition": "fair"},
    "photos": [],
    "turnstileToken": "test"
  }'
```

### Modify Pricing

Edit `apps/worker/migrations/0002_seed_demo.sql`, find:

```sql
-- Interior Painting, Austin, Low price
INSERT INTO pricing_tables (...) VALUES (1, 1, 1, 800, ...);
```

Change `800` to `900` (for example), then re-seed:

```bash
wrangler d1 execute quotecheck-dev --file=./apps/worker/migrations/0002_seed_demo.sql
```

### Add a New Rule

Edit `packages/estimator/rules.ts`:

```typescript
{
  name: "my_new_rule",
  reason: "My explanation",
  applies: (input) => input.categoryId === 1 && input.answers.condition === "poor",
  adjust: (low, typical, high) => ({
    low: low * 1.5,
    typical: typical * 1.5,
    high: high * 1.5,
  })
}
```

Test it with an estimate.

### Run Tests

```bash
pnpm test
```

## Next Steps

### To Deploy to Production

See **DEPLOYMENT.md** for step-by-step instructions.

### To Understand the Code

See **DEVELOPMENT.md** for architecture and patterns.

### To Use the Admin Panel

See **ADMIN_GUIDE.md** (stub endpoints in development).

---

**Need help?** Check README.md or specific guide files.
