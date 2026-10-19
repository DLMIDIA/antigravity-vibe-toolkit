---
name: evidence-first
description: >-
  Use this skill whenever concluding any implementation, bugfix, or refactoring task
  to run automated quality gates (types, lint, unit tests, build, 350-line limit)
  and prove results with terminal evidence before declaring done.
---

# Evidence-First Quality Verification

This skill enforces the fundamental rule of production-grade Vibe Coding: **never declare completion without verifiable proof**.

## When to Activate
- Immediately after writing code or completing a user-requested feature.
- Prior to creating git commits or opening pull requests.
- When the user asks "is it ready?", "está pronto?", or asks for a status check.

## Verification Workflow

### Step 1: Scan Modular File Limits (350-line rule)
Check whether any created or modified file exceeds the 350-line threshold:
```bash
agy-vibe sanitize
```
If any file exceeds 350 lines, refactor it into smaller submodules before proceeding.

### Step 2: Run Automated Quality Checks
Execute the full quality gate pipeline:
```bash
agy-vibe verify
```
This command automatically executes:
1. **Type Checking**: TypeScript (`npx tsc --noEmit`) or Python syntax check.
2. **Linting**: Linter verification (`npm run lint` or equivalent).
3. **Automated Tests**: Unit and integration test suites (`npm test` or `pytest`).
4. **Production Build**: Full compilation (`npm run build`).

### Step 3: Format the Evidence Report
Present the verified output in your response to the user with:
- The command executed.
- The exit code.
- Key logs proving zero errors or warnings.
- Explicit notation of any unverified edge cases or external credentials needed.
