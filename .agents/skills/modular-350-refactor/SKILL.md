---
name: modular-350-refactor
description: >-
  Use this skill when refactoring bloated files that exceed 350 lines of code,
  breaking them down cleanly into cohesive, single-responsibility submodules
  without breaking existing public contracts or imports.
---

# 350-Line Modular Refactoring Runbook

Large files (>350 lines) introduce context fragmentation, degrade LLM reasoning precision, and increase git merge conflicts. This runbook details how to decouple complex modules safely.

## Workflow

### 1. Inventory & Measure
Run the sanitation check to pinpoint files requiring decomposition:
```bash
agy-vibe sanitize
```

### 2. Identify Cohesive Boundaries
For each oversized file, categorize its internal blocks into:
- **Types & Interfaces**: Move to `types.ts` or a local `types/` folder.
- **Constants & Configs**: Move to `constants.ts` or `config.ts`.
- **Pure Helpers & Utilities**: Move to `utils.ts` or `helpers.ts`.
- **Domain / Business Logic**: Extract into focused service functions or custom hooks.
- **Presentation / Components**: Break compound UI into atomic subcomponents.

### 3. Maintain Public Contract (Facade Pattern)
Keep the original file path as a clean **Facade**:
```typescript
// Example: src/services/user-service.ts (reduced from 500 lines to 30 lines)
export * from './user/auth';
export * from './user/profile';
export * from './user/permissions';
```
Existing consumers across the codebase remain 100% unaffected without needing widespread import updates!

### 4. Verify Integrity
Immediately verify that types, lint, and tests still pass:
```bash
agy-vibe verify
```
Confirm line counts are now well below 350 lines per file.
