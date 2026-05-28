# End-to-End Test Plan

The frontend E2E suite lives in `frontend/tests/e2e` and runs with Playwright.

## Coverage

- Home page hero, primary calls to action, category navigation, destination card links, and image health.
- Header search navigation and theme toggle.
- Explore page URL state, selected places, chips, search, category filtering, safe-only filtering, and image health.
- Food page search, category, budget, and late-night filters.
- Planner itinerary generation, QR guide toggle, and offline JSON download.
- Assistant prompt submission and quick prompt behavior.
- Admin analytics loading and moderation approval state.
- Cross-page smoke checks for page title, visible main content, console errors, broken images, and horizontal overflow.
- Desktop Chromium and mobile Chrome viewports.

## Commands

```bash
cd frontend
npm run test:e2e
npm run test:e2e -- --project=chromium-desktop
npm run test:e2e -- --project=mobile-chrome
npm run test:e2e:report
```

## Notes

The tests mock backend API responses inside Playwright. This keeps the UI suite deterministic and lets CI verify the application experience even when Postgres, Redis, and external APIs are not available. Full-stack API/database tests can be added separately once Docker or managed test services are available in CI.
