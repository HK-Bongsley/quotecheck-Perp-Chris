# QuoteCheck Development Guide

## Local Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+
- Git

### Install Dependencies

```bash
pnpm install
```

### Start Development Servers

**Terminal 1: Cloudflare Worker API**
```bash
cd apps/worker
npm run dev
```

Runs on `localhost:8787`

**Terminal 2: Next.js Frontend**
```bash
cd apps/web
npm run dev
```

Runs on `localhost:3000`

## Project Structure

### /packages/estimator

Pure TypeScript estimation engine, no side effects.

- `engine.ts` - Main estimation logic
- `pricing.ts` - Database pricing lookup
- `rules.ts` - Adjustment rules
- `confidence.ts` - Confidence scoring
- `photo-signal.ts` - Photo analysis

**Adding a new rule:**

1. Add to `RULES` array in `rules.ts`
2. Define `applies()` condition
3. Define `adjust()` function
4. Add test in `test/rules.test.ts`

### /apps/worker

Cloudflare Worker API.

- `src/handler.ts` - Main router
- `routes/api/*.ts` - Endpoints
- `migrations/*.sql` - Database migrations

**Adding an endpoint:**

1. Create `routes/api/my-endpoint.ts`
2. Import in `src/handler.ts`
3. Add route: `router.post("/api/my-endpoint", handler)`

### /apps/web

Next.js frontend for Cloudflare Pages.

- `app/page.tsx` - Homepage
- `app/estimate/page.tsx` - Estimate flow
- `app/admin/page.tsx` - Admin panel
- `app/globals.css` - Global styles

**Add a new page:**

1. Create `app/my-page/page.tsx`
2. Export default component
3. Next.js automatically routes it

## Development Workflow

### Run Tests

```bash
pnpm test              # All tests
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report
```

### Type Checking

```bash
pnpm type-check
```

Runs `tsc --noEmit` on entire monorepo.

### Linting

```bash
pnpm lint
```

Uses ESLint for TypeScript/React files.

### Build

```bash
pnpm build
```

Builds web app and worker.

## Database Development

### Access Local D1

During development:

```bash
wrangler d1 execute quotecheck-dev --interactive
```

### Run Migrations

```bash
wrangler d1 execute quotecheck-dev --file=./apps/worker/migrations/0001_initial.sql
```

### Query Data

```sql
SELECT * FROM categories;
SELECT * FROM area_profiles;
SELECT * FROM pricing_tables WHERE category_id = 1;
```

### Reset Database

```bash
# Delete and recreate
wrangler d1 delete quotecheck-dev --yes
wrangler d1 create quotecheck-dev

# Re-run migrations
wrangler d1 execute quotecheck-dev --file=./apps/worker/migrations/0001_initial.sql
wrangler d1 execute quotecheck-dev --file=./apps/worker/migrations/0002_seed_demo.sql
```

## Adding a New Category

### 1. Add to Database Seed

Edit `apps/worker/migrations/0002_seed_demo.sql`:

```sql
INSERT INTO categories (slug, name, description, unit, example_use, display_order)
VALUES ('roof_repair', 'Roof Repair', '...', 'sqm', '...', 7);
```

### 2. Add Pricing

```sql
INSERT INTO pricing_tables (pricing_version_id, category_id, area_id, base_low, base_typical, base_high)
VALUES (1, 7, 1, 2000, 3500, 5000);
```

### 3. Add Questions

```sql
INSERT INTO question_sets (category_id, display_order) VALUES (7, 1);
INSERT INTO question_items (question_set_id, field_name, question_text, question_type, ...)
VALUES (7, 'area_sqm', 'Roof area in sqm?', 'number', ...);
```

### 4. Add Rules (optional)

```sql
INSERT INTO pricing_rules (category_id, rule_name, rule_type, ...)
VALUES (7, 'steep_pitch', 'multiply', 'pitch', 'steep', 1.3);
```

### 5. Update Estimator

Update `SIZE_BANDS` in `packages/estimator/rules.ts`:

```typescript
7: {
  thresholds: [100, 200, 400, 600],
  names: ["small", "medium", "large", "huge"],
  multipliers: [0.8, 1.0, 1.5, 2.0],
}
```

## API Development

### Testing Endpoints

```bash
# Test categories
curl http://localhost:8787/api/categories

# Test intake questions
curl http://localhost:8787/api/intake/1

# Test estimation
curl -X POST http://localhost:8787/api/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "areaId": 1,
    "answers": {"area_sqm": 100},
    "photos": [],
    "turnstileToken": "test"
  }'
```

### Debugging

Enable logging in routes:

```typescript
console.log("Input:", input);
console.log("Estimate:", estimate);
console.log("Error:", error);
```

View logs:

```bash
wrangler tail
```

## Frontend Development

### Component Guidelines

- Use React functional components with TypeScript
- Props should be typed with interfaces
- Use Tailwind CSS for styling
- Mobile-first responsive design

### Adding a Component

Create `apps/web/components/MyComponent.tsx`:

```typescript
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return <button onClick={onClick}>{title}</button>;
}
```

Use in page:

```typescript
import { MyComponent } from "@/components/MyComponent";

export default function Page() {
  return <MyComponent title="Click me" onClick={() => {}} />;
}
```

## Common Tasks

### Update Pricing

1. Edit `apps/worker/migrations/0002_seed_demo.sql`
2. Re-seed database: `wrangler d1 execute ...`
3. Test with `/api/estimate` endpoint

### Add a New Rule

1. Create rule in `packages/estimator/rules.ts` `RULES` array
2. Write test in `packages/estimator/test/rules.test.ts`
3. Test with `/api/estimate` endpoint

### Fix Estimate Accuracy

1. Check base pricing in database
2. Verify rules are applying correctly
3. Check confidence scoring
4. Add test case for edge case

### Add Admin Feature

1. Create page in `apps/web/app/admin/`
2. Add corresponding Worker endpoint
3. Add Turnstile protection
4. Add database audit log entry

## Deployment

### Staging Deployment

```bash
wrangler deploy --env development
```

### Production Deployment

```bash
pnpm build
wrangler deploy --env production
```

## Troubleshooting

### Worker won't start

```bash
cd apps/worker
npm run build
wrangler dev
```

### Frontend build fails

```bash
cd apps/web
rm -rf .next
npm run build
```

### Database connection error

```bash
wrangler d1 execute quotecheck-dev --command "SELECT 1;"
```

### Type errors after adding package

```bash
pnpm install  # Reinstall dependencies
pnpm build    # Rebuild monorepo
```

---

Need help? Check README.md or DEPLOYMENT.md
