---
name: skill-orchestrator
description: >-
  Master orchestration skill that scans the current project, detects its language stack and architecture,
  evaluates all installed skills on the machine for compatibility, and executes or schedules the optimal
  skills automatically (e.g. security audits, 350-line modular refactoring, quality gates, and cron automations).
metadata:
  icon: auto_awesome
---

# Antigravity Skill Orchestrator & Auto-Pilot (ASEM)

> **Principle**: Zero manual guesswork. The AI inspects the codebase, matches all locally available skills against actual project needs, executes the most impactful skills in priority order, and schedules recurring health checks.

---

## 1. When to Use

Activate this skill whenever:
- Entering a new codebase or opening a project for the first time.
- The user requests: *"analisar skills"*, *"qual skill usar"*, *"rodar autopilot"*, or types `@autopilot` / `@skill-orchestrator`.
- Setting up automated periodic checks (every 30 minutes, daily, or via cron).
- Auditing which skills on the machine are compatible and beneficial for the active workspace.

---

## 2. Core Execution Workflow

### Step 1: Codebase Diagnostics & Stack Profiling
Inspect the current working directory to identify:
- **Languages**: JS/TS (`package.json`, `tsconfig.json`), Python (`requirements.txt`, `pyproject.toml`), PHP (`composer.json`, `*.php`), HTML/CSS.
- **Oversized Files**: Scan for files exceeding the 350-line limit:
  ```bash
  agy-vibe sanitize
  ```
- **Security Surface**: Scan for hardcoded credentials, `.env` leakage, SQL/DB queries, public API endpoints.
- **Documentation Gaps**: Check if `PRODUCT.md`, `AGENTS.md`, and `GEMINI.md` exist.
- **Frontend / UI**: Check for browser views, CSS, or DOM rendering.

### Step 2: Skill Compatibility Matrix
Match all 9 native Antigravity skills against project findings:

| Skill | Activation Trigger in Codebase | Recommended Action |
| :--- | :--- | :--- |
| **`modular-350-refactor`** | Source files > 350 lines detected | Decompose monolithic files using the Facade pattern. |
| **`security-auditor`** | API routes, authentication, DB queries, `.env` | Run vulnerability & credential leakage audit. |
| **`evidence-first`** | Pending changes, tests, or before PR commit | Execute full terminal Quality Gate with verifiable proof. |
| **`chrome-devtools`** | Frontend web UI (`.html`, React, Vue, CSS) | Inspect DOM, console logs, CSS layouts, and network events. |
| **`project-bootstrap`** | Missing `PRODUCT.md` or `AGENTS.md` | Scaffold architectural manifests and governance docs. |
| **`context7-docs`** | Complex external libraries or unpinned APIs | Fetch and verify up-to-date documentation. |
| **`parallel-waves`** | 3+ independent refactoring/feature tasks | Spawn parallel subagents without race conditions. |
| **`subagent-review`** | Mission-critical PR or major release | Run multi-perspective review (Architect, Security, QA). |
| **`skill-orchestrator`** | Initial discovery or scheduled automation | Re-evaluate project health and schedule next run. |

### Step 3: Priority Execution Plan
Execute the compatible skills in strict dependency order:
1. **Security Auditor**: Fix vulnerabilities first.
2. **Project Bootstrap**: Ensure architectural manifests exist.
3. **Modular Refactor**: Decompose files > 350 lines.
4. **Evidence-First Quality Gate**: Run tests, linters, and typechecks.

---

## 3. Scheduled & Recurring Automations

The orchestrator can schedule itself for continuous quality enforcement:

### Option A: In-Session Schedule (e.g., Every 30 Minutes)
Use the Antigravity `schedule` tool to trigger an automatic re-scan during active pairing:
```json
{
  "DurationSeconds": 1800,
  "Prompt": "Execute skill-orchestrator: run agy-vibe sanitize and verify if any new files exceeded 350 lines or security leaks were introduced."
}
```

### Option B: Daily / Hourly Cron Sidecar (Background Automation)
Configure a native Antigravity background sidecar in `~/.gemini/config/sidecars/vibe-autopilot/sidecar.json`:
```json
{
  "builtin": "schedule",
  "args": [
    "CRON_TZ=America/Sao_Paulo 0 9 * * *",
    "Run daily Antigravity Vibe Auto-Pilot: audit current active projects for security vulnerabilities, 350-line modular compliance, and update the dashboard on :4242."
  ],
  "display_name": "Antigravity Daily Auto-Pilot"
}
```

### Option C: CLI One-Liner
Run from any terminal:
```bash
agy-vibe autopilot
```
Or for scheduled monitoring:
```bash
agy-vibe autopilot --schedule "30m"
```
