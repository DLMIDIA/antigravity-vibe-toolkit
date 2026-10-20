# Antigravity Rule: Skill Orchestrator & Auto-Pilot

> **Trigger**: When the user requests an overall project audit, types `@autopilot`, `@skill-orchestrator`, `/autopilot`, or asks *"qual skill usar"*, *"analisar projeto"*, or *"rodar autopilot"*.

---

## 1. Automated Skill Compatibility & Dispatch Protocol

When this rule is activated, the Antigravity agent must execute the following sequence:

1. **Stack & Surface Diagnosis**:
   - Inspect files in the current workspace to detect:
     - Programming languages & build tools (`package.json`, `composer.json`, `requirements.txt`).
     - Files exceeding 350 lines via `agy-vibe sanitize`.
     - Presence of `.env` files, database queries, authentication code, or API routes.
     - Presence of architecture documents (`PRODUCT.md`, `AGENTS.md`, `GEMINI.md`).
     - Frontend UI assets (`.html`, CSS, React, Vue).

2. **Skill Compatibility Evaluation**:
   Evaluate all 9 registered skills against the project:
   - If files > 350 lines: Activate **`modular-350-refactor`**.
   - If security surfaces (secrets, auth, API routes, DB): Activate **`security-auditor`**.
   - If missing architectural manifests: Activate **`project-bootstrap`**.
   - If web frontend/DOM present: Activate **`chrome-devtools`**.
   - If external APIs/unpinned libraries: Activate **`context7-docs`**.
   - If multiple independent refactoring tasks: Activate **`parallel-waves`**.
   - If major release or mission-critical verification: Activate **`subagent-review`**.
   - Always verify completed work with **`evidence-first`**.

3. **Autonomous Execution Plan**:
   Present a clear table of compatible skills with reasons, and ask or proceed to execute the top priority skill.

---

## 2. In-Session & Recurring Scheduling

When the user asks for continuous or recurring monitoring:
- Use the Antigravity `schedule` tool to set an in-session notification (e.g. 30 minutes, 1 hour).
- Offer to configure a background sidecar (`~/.gemini/config/sidecars/daily-vibe-autopilot/sidecar.json`) for daily automated health checks.
