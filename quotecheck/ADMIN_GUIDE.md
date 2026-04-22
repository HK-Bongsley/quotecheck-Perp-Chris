# QuoteCheck Admin Guide

## Admin Panel Access

The admin panel is available at `/admin` but is protected by Cloudflare Access.

**Production**: Only accessible with valid Cloudflare credentials.

## Managing Categories

### Add a New Category

1. Go to `/admin/categories`
2. Click "New Category"
3. Fill in:
   - **Slug**: `bathroom_tile` (lowercase, underscore-separated)
   - **Name**: "Bathroom Tile Installation"
   - **Description**: "Professional bathroom tile work"
   - **Unit**: "sqm" or "job"
   - **Example Use**: "Shower enclosure or bathroom floor"
4. Click "Create"

### Modify Pricing for a Category

1. Go to `/admin/pricing`
2. Select category and area
3. Update low/typical/high prices
4. Create a new pricing version (versioning enables rollback)

## Managing Areas

### Add a New Area

1. Go to `/admin/areas`
2. Click "New Area"
3. Fill in:
   - **Area Code**: "12345" (ZIP code)
   - **Area Name**: "Denver Metro"
   - **State**: "CO"
   - **Cost Index**: 0.92 (multiplier vs national avg)
   - **Tier**: "metro" or "suburban" or "rural"
4. Click "Create"

## Pricing Rules

Rules are applied during estimation:

- **multiply**: Multiplies base price by factor
- **add_fixed**: Adds fixed amount to price
- **widen_range**: Widens confidence range

### Example Rules (Pre-configured)

- Interior Painting + Hard Access: ×1.2
- Interior Painting + Poor Condition: ×1.3
- Drywall + Many Patches: ×1.4
- Gutter + 3+ Stories: ×1.25
- Ceiling Fan + Complex Electrical: ×1.5

### Add a New Rule

1. Go to `/admin/rules`
2. Select category
3. Define condition and adjustment
4. Test with mock estimate

## Viewing Estimates

### Audit Log

1. Go to `/admin/runs`
2. Filter by:
   - Date range
   - Category
   - Area
   - Confidence level
3. Export as CSV for analysis

### Estimate Details

Click any estimate to see:
- User inputs
- Calculated prices
- Applied rules
- Uploaded photos (metadata only)

## Pricing Versions

Pricing is versioned for audit trail:

1. Create new version: `/admin/pricing/versions`
2. Publish when ready: "Set as active"
3. Old versions remain in history

### Rollback

If prices are wrong:
1. Go to `/admin/pricing/versions`
2. Select old version
3. Click "Restore"

(No actual data is deleted)

## Analytics

### Dashboard (`/admin/dashboard`)

- Daily estimates
- Average price ranges
- Confidence distribution
- Top categories
- Top areas

### Export Data

- Estimates: CSV format
- Users: anonymized
- Photos: metadata only (no images exported)

## Troubleshooting

### Estimate Prices Too High/Low

1. Check `/admin/pricing` base prices
2. Review `/admin/rules` adjustments
3. Verify `/admin/areas` cost indices
4. Check pricing version is active

### Missing Questions

1. Go to `/admin/intake`
2. Verify questions exist for category
3. Add questions if needed

### Photo Analysis Failing

Check if Gemini is enabled:
1. Settings → Feature Flags
2. Toggle "Photo Analysis" on/off
3. Requires GEMINI_API_KEY in env

## Monthly Maintenance

- [ ] Review estimate accuracy vs real quotes
- [ ] Adjust pricing if needed (new version)
- [ ] Archive old estimates (90+ days)
- [ ] Check for spam/abuse patterns
- [ ] Update category descriptions
- [ ] Review question wording

## Disaster Recovery

### Restore from Backup

1. D1 automatically backs up daily
2. Request restore from Cloudflare Dashboard
3. Specify date to restore to

### Manual Recovery

All data is in D1; no single point of failure:
- Photos in R2 (immutable)
- Estimates in D1 (queryable)
- Pricing versions (versioned)

---

For technical issues, contact engineering team.
