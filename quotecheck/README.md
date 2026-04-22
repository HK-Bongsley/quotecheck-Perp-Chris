# QuoteCheck v1

A production-ready, mobile-first home repair job estimation platform built entirely on Cloudflare infrastructure.

**Status**: 🚀 Ready for deployment

## Features

- ✅ Instant, transparent estimates (low / typical / high)
- ✅ Mobile-first responsive UI
- ✅ Rules-first estimation engine with confidence scoring
- ✅ Optional photo analysis (Gemini AI integration, feature-flagged)
- ✅ Admin panel for managing categories, pricing, and areas
- ✅ Complete audit trail of all estimates
- ✅ Turnstile CAPTCHA for abuse protection
- ✅ Serverless, scalable Cloudflare-first architecture

## Architecture

```
Frontend: Next.js → Cloudflare Pages
API: Cloudflare Workers + D1 database
Storage: R2 for photo uploads
Security: Turnstile, Cloudflare Access
```

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 9+
- Cloudflare account with:
  - D1 database enabled
  - R2 storage enabled
  - Workers enabled
  - Turnstile enabled

### 1. Clone and Install

```bash
git clone <repo>
cd quotecheck
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your Cloudflare credentials:

```
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
TURNSTILE_SITE_KEY=your_site_key
TURNSTILE_SECRET=your_secret
D1_DB_ID=your_db_id
```

### 3. Create D1 Database

```bash
wrangler d1 create quotecheck
wrangler d1 execute quotecheck --file=./apps/worker/migrations/0001_initial.sql
wrangler d1 execute quotecheck --file=./apps/worker/migrations/0002_seed_demo.sql
```

### 4. Run Locally

**Terminal 1: Worker API**
```bash
pnpm dev:worker
```

**Terminal 2: Web Frontend**
```bash
pnpm dev:web
```

Then open http://localhost:3000

### 5. Run Tests

```bash
pnpm test
```

## Project Structure

```
quotecheck/
├── apps/
│   ├── web/              # Next.js frontend for Cloudflare Pages
│   │   ├── app/
│   │   │   ├── page.tsx              (homepage)
│   │   │   ├── estimate/page.tsx     (estimate flow)
│   │   │   └── admin/page.tsx        (admin panel)
│   │   ├── next.config.js
│   │   └── package.json
│   └── worker/           # Cloudflare Worker API
│       ├── src/handler.ts            (main router)
│       ├── routes/api/
│       │   ├── estimate.post.ts      (POST /api/estimate)
│       │   ├── categories.ts         (GET /api/categories)
│       │   ├── intake.ts             (GET /api/intake/:id)
│       │   ├── uploads/sign.ts       (POST /api/uploads/sign)
│       │   └── admin/                (admin CRUD endpoints)
│       ├── migrations/
│       │   ├── 0001_initial.sql      (schema)
│       │   └── 0002_seed_demo.sql    (seed data)
│       ├── wrangler.toml
│       └── package.json
├── packages/
│   ├── types/            # Shared TypeScript types & Zod schemas
│   │   ├── index.ts      (types)
│   │   └── zod.ts        (validation schemas)
│   ├── estimator/        # Core estimation engine (pure TS)
│   │   ├── engine.ts     (main estimation logic)
│   │   ├── pricing.ts    (pricing lookup)
│   │   ├── rules.ts      (adjustment rules)
│   │   ├── confidence.ts (confidence scoring)
│   │   ├── photo-signal.ts (photo analysis)
│   │   └── test/         (unit tests)
│   └── ui/               # Shared UI components
│       └── components/   (Button, Card, etc.)
├── wrangler.toml         (root Wrangler config)
├── pnpm-workspace.yaml   (monorepo config)
└── README.md
```

## Estimation Engine

The estimation engine is pure TypeScript with no external dependencies (except for types).

### How It Works

1. **Base Pricing**: Load category + area pricing from D1
2. **Size Normalization**: Apply multipliers based on job size
3. **Rules Engine**: Apply adjustment rules (access difficulty, condition, etc.)
4. **Confidence Scoring**: Compute confidence based on data quality
5. **Range Widening**: Widen price bands if confidence is low

### Example Output

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "low": 640,
  "typical": 960,
  "high": 1280,
  "confidence": "medium",
  "assumptions": [
    "Base pricing: $800-$1600",
    "Form completeness: 75%",
    "Hard-to-reach areas increase labor cost by 20%"
  ],
  "exclusions": [
    "Permits and licenses",
    "Travel beyond 50km",
    "Structural damage or hidden problems"
  ],
  "reasonBreakdown": [
    "Access difficulty adjustment: +20%"
  ],
  "disclaimers": [
    "This is an automated estimate, not a binding contractor quote.",
    "Always get professional on-site quotes before hiring."
  ]
}
```

## API Endpoints

### Public API

- **POST /api/estimate** - Get an estimate
- **GET /api/estimate/:id** - Retrieve stored estimate
- **GET /api/categories** - List all job categories
- **GET /api/intake/:categoryId** - Get dynamic questions for a category
- **POST /api/uploads/sign** - Get presigned URL for photo upload
- **POST /api/photo-analyze** - Analyze uploaded photo (optional)

### Admin API (Protected)

- **GET/POST /api/admin/categories** - Manage categories
- **GET/POST /api/admin/pricing** - Manage pricing tables
- **GET/POST /api/admin/areas** - Manage area profiles
- **GET /api/admin/runs** - View estimate audit log

## Database Schema

### Core Tables

- `categories` - Job types (interior_painting, drywall_plaster, etc.)
- `area_profiles` - Geographic areas with cost multipliers
- `pricing_tables` - Base prices (low/typical/high) per area + category
- `pricing_versions` - Versioned pricing snapshots
- `question_items` - Dynamic intake questions per category
- `pricing_rules` - Adjustment rules (access_difficulty, condition, etc.)
- `estimate_runs` - Stored estimate history with audit trail
- `uploaded_photos` - Photo metadata (images stored in R2)
- `admin_audit_logs` - Admin action history

## Security

### Turnstile Protection

All public endpoints are protected by Cloudflare Turnstile (CAPTCHA):
- `/api/estimate` requires `turnstileToken`
- `/api/uploads/sign` requires `turnstileToken`

### Admin Access

Admin routes are conceptually protected by Cloudflare Access. In production:
1. Routes prefixed `/admin/` should be behind Cloudflare Access policies
2. Implement header validation for additional auth

### Photo Handling

- Photos never leave Cloudflare (stored in R2)
- No public image URLs exposed
- Photos only used for confidence signal, never for price extraction
- Retention policy: Delete after 90 days

### Input Validation

- All request bodies validated with Zod schemas
- File uploads limited to 5MB, JPEG/PNG/WebP only
- ZIP codes validated against `area_profiles` table

## Seed Data

The database includes realistic seed data for v1 launch:

**Categories (6):**
- Interior Painting
- Drywall / Plaster Repair
- Gutter Cleaning
- Pressure Washing
- Junk Removal
- Ceiling Fan / Light Fixture Installation

**Areas (3):**
- Austin, TX (78704) - baseline costs
- New York, NY (10001) - +45% cost multiplier
- Los Angeles, CA (90210) - +35% cost multiplier

## Deployment

### 1. Create Cloudflare Resources

```bash
# Create D1 database
wrangler d1 create quotecheck

# Create R2 bucket
wrangler r2 bucket create quotecheck-photos

# Get Turnstile site key and secret from Cloudflare dashboard
```

### 2. Build

```bash
pnpm build
```

### 3. Deploy Worker

```bash
wrangler deploy
```

### 4. Deploy Frontend

Configure Cloudflare Pages to build from `apps/web`:
- Build command: `cd apps/web && npm run build`
- Build output directory: `apps/web/.next`

### 5. Verify

```bash
# Check health
curl https://your-worker.workers.dev/health

# Test estimate endpoint
curl -X POST https://your-worker.workers.dev/api/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "categoryId": 1,
    "areaId": 1,
    "answers": {"area_sqm": 100},
    "photos": [],
    "turnstileToken": "dummy"
  }'
```

## Configuration

### Environment Variables

See `.env.example` for all available variables.

Key variables:
- `TURNSTILE_SITE_KEY` - Public Turnstile key
- `TURNSTILE_SECRET` - Private Turnstile secret
- `GEMINI_ENABLED` - Enable photo analysis (default: false)
- `GEMINI_API_KEY` - Google Gemini API key (if photo analysis enabled)

### Feature Flags

Photo analysis is disabled by default for privacy:

```typescript
// Enable in .env.local
GEMINI_ENABLED=true
GEMINI_API_KEY=your_key
```

When disabled, photo analysis returns neutral confidence signals.

## Testing

### Unit Tests (Estimator)

```bash
pnpm test
```

Tests cover:
- Size band multipliers
- Rule adjustments
- Confidence scoring
- Edge cases

### Manual E2E Testing

1. Go to http://localhost:3000
2. Select a category
3. Enter ZIP code (78704, 10001, or 90210)
4. Answer intake questions
5. Skip photos
6. Verify estimate output

## Future Phases

**Phase 2: Monetization**
- Email capture on results page
- Lead handoff to contractors
- Affiliate links for tools/materials
- PDF export/email

**Phase 3: Scale**
- 30+ job categories
- All US ZIP codes (RSMeans CCI integration)
- Canada, UK, Australia expansion
- Contractor profile matching

**Phase 4: Marketplace**
- Contractor profiles
- Real quotes integration
- Booking workflow

## License

Proprietary - QuoteCheck, 2026

## Support

For issues, open a GitHub issue or contact the team.

---

**Built with ❤️ on Cloudflare infrastructure**
