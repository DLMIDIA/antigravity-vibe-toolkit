---
name: subagent-review
description: >-
  Use this skill to orchestrate multiple specialized subagents in parallel to perform
  an independent, multi-perspective code review (Architect, Security, QA/Edge cases)
  before merging or delivering substantial changes.
---

# Multi-Agent Code Review Protocol

This skill leverages Google Antigravity's native `invoke_subagent` capability to execute thorough, multi-perspective code reviews without cluttering the primary conversation context.

## Subagent Composition

When initiating a multi-agent review, spawn 3 read-only reviewer subagents concurrently:

### 1. Architecture Reviewer
- **Role**: `Architecture Reviewer`
- **Focus**: Modularity, contract preservation, dependency boundaries, compliance with `docs/architecture.md`, and the 350-line limit.

### 2. Security Auditor
- **Role**: `Security Reviewer`
- **Focus**: Injection vulnerabilities, unvalidated inputs, authorization checks, credential leaks, and OWASP Top 10 risks.

### 3. QA & Edge-Case Specialist
- **Role**: `QA Edge-Case Reviewer`
- **Focus**: Null/undefined dereferences, boundary conditions, unhandled async exceptions, race conditions, and test coverage gaps.

## Execution Example (Antigravity Tool Call)

```json
{
  "Subagents": [
    {
      "TypeName": "research",
      "Role": "Architecture Reviewer",
      "Model": "inherit",
      "Prompt": "Review recent changes in src/. Check adherence to modular boundaries and ensure no file exceeds 350 lines. Report findings with exact file paths."
    },
    {
      "TypeName": "research",
      "Role": "Security Reviewer",
      "Model": "inherit",
      "Prompt": "Perform a read-only security audit on recent diffs. Trace input validation and verify zero sensitive data leaks. Report findings ranked by severity."
    },
    {
      "TypeName": "research",
      "Role": "QA Edge-Case Reviewer",
      "Model": "inherit",
      "Prompt": "Inspect error handling, nullability, and race conditions in new code. Verify that tests cover failure paths adequately."
    }
  ]
}
```

## Coordinator Synthesis
After the subagents complete their evaluations:
1. Aggregate the findings into a single structured table.
2. Filter out duplicates or speculative notes.
3. Apply critical fixes before declaring the review finalized.
