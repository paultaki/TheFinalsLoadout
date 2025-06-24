# Visual Regression Testing

## Setup

```bash
npm install
npx playwright install
```

## Running Tests

### Capture Baseline
```bash
# Start local server
python3 -m http.server 8080

# In another terminal
node tests/visual/capture-baseline.js
```

### Run Visual Regression
```bash
npm run test:visual
```

### Update Snapshots
```bash
npm run test:visual:update
```

## CI Pipeline

The GitHub Actions workflow automatically:
- Runs visual regression on every PR
- Blocks merge if pixel delta > 0.1%
- Blocks merge if FPS < 55
- Captures video recordings of failures

## Percy Integration

Set `PERCY_TOKEN` in GitHub Secrets for visual comparison.

## Rollback

If animations break:
1. `git revert <commit>`
2. Re-run baseline capture
3. Deploy hotfix