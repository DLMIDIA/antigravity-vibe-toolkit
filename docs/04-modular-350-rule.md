# The 350-Line Modular Limit: Token Economy & Attention Precision

One of the most consequential findings in AI-assisted software engineering is that **file length directly correlates with regression rates**.

## Why 350 Lines?

1. **Context Window Attention**: Large language models maintain optimal attention across variables, control flows, and invariants when files are under 300–350 lines. Beyond 700 lines, hallucinations and forgotten imports increase significantly.
2. **Clean Diffs**: Small files generate isolated git diffs, making multi-agent parallel execution safe and predictable.
3. **Single Responsibility Principle (SRP)**: Any file exceeding 350 lines almost invariably conflates presentation, business logic, state mutations, and data transformation.

## Refactoring Strategy: The Facade Pattern

When decomposing an oversized file (e.g. `src/modules/billing.ts` with 750 lines):

1. Create a subdirectory: `src/modules/billing/`.
2. Extract components into dedicated files:
   - `src/modules/billing/types.ts`
   - `src/modules/billing/calculator.ts`
   - `src/modules/billing/invoices.ts`
   - `src/modules/billing/webhooks.ts`
3. Convert the original `src/modules/billing.ts` into a re-export Facade:
   ```typescript
   export * from './billing/types';
   export * from './billing/calculator';
   export * from './billing/invoices';
   export * from './billing/webhooks';
   ```
4. All existing imports across the application (`import { calculateTax } from '@/modules/billing'`) continue working without requiring changes elsewhere!
