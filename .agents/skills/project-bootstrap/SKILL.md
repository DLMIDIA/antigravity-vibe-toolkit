---
name: project-bootstrap
description: >-
  Use this skill to bootstrap a brand-new project from scratch using the Antigravity Vibe Coding foundation,
  creating PRODUCT.md, AGENTS.md, documentation manifests, quality gates, and Next.js / TypeScript / Python setups.
---

# Project Bootstrap Runbook

This skill scaffolds a production-ready repository from a single user intent statement.

## 2-Line Kickoff Pattern
```text
Execute project-bootstrap in this directory.
Project: [Name, Problem, Target Audience, MVP Core Features, Constraints]
```

## Bootstrap Sequence

### 1. Initialize Antigravity Vibe Structure
Run the CLI in the current directory:
```bash
agy-vibe init .
```
This generates:
- `PRODUCT.md` (Product scope, user persona, acceptance criteria).
- `AGENTS.md` & `GEMINI.md` (Agent guidelines, canonical commands).
- `docs/` (`architecture.md`, `quality.md`, `setup.md`, `onboarding.md`, `design.md`).
- `.agents/rules/` (Evidence-first, 350-line limit, subagent coordination).

### 2. Scaffold Foundation Stack
Depending on the project specification:
- **Next.js Fullstack**:
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-turbopack --use-npm
  ```
- Install quality foundations:
  ```bash
  npm install -D vitest @types/node
  ```

### 3. Verify Baseline
Run the quality gate immediately to prove the newly initialized foundation builds cleanly:
```bash
agy-vibe verify
```
Record the baseline metrics in `docs/setup.md`.
