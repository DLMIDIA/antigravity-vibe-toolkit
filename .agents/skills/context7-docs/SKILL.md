---
name: context7-docs
description: >-
  Use this skill to look up current, verified documentation, APIs, and setup guides
  for third-party libraries and frameworks, eliminating outdated hallucinated syntax.
---

# Context7 & Up-to-Date Documentation Lookup

Antigravity operates with massive context windows, but third-party libraries (Next.js App Router, Tailwind v4, Drizzle ORM, Zod, Shadcn) release breaking changes rapidly. This skill guarantees that code utilizes current, canonical APIs.

## Lookup Strategy

1. **Identify the Exact Version**:
   Inspect `package.json` or `pyproject.toml` to determine the installed major/minor version before researching.

2. **Official Documentation Query**:
   When using Context7 MCP or browser search:
   - Formulate targeted queries: `"drizzle-orm v0.38 postgres-js transactions"`, `"nextjs 15 server actions error handling"`.
   - Focus on official documentation endpoints (docs.nestjs.com, orm.drizzle.team, nextjs.org/docs).

3. **Validate in Code**:
   - Write a minimal type test or smoke test to confirm the imported signature compiles.
   - Run `npx tsc --noEmit` immediately to verify syntax validity.
