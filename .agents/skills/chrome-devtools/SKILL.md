---
name: chrome-devtools
description: >-
  Use this skill to inspect frontend applications, capture client-side console errors,
  analyze network requests, and audit DOM accessibility using Chrome DevTools or agent browser.
---

# Frontend Runtime Verification & Telemetry

Compiling code without syntax errors does not guarantee frontend runtime correctness. This skill guides interactive verification of the web interface.

## Verification Steps

### 1. Dev Server Check
Ensure local server is running and accessible:
```bash
curl -sI http://localhost:3000 | head -n 5
```

### 2. Browser Inspection
Using Chrome DevTools MCP or `read_browser_page` / `agent-browser`:
- Navigate to the affected route.
- Check browser console logs for uncaught exceptions, React hydration errors, or missing key warnings.
- Verify network tab for 404s, CORS issues, or slow API payloads.

### 3. Layout & Accessibility
- Check responsive viewport rendering.
- Verify keyboard navigation: focus rings must be visible, modal traps must be escapable.
