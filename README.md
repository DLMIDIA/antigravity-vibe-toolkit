<p align="center">
  <img src="assets/hero-banner.png" alt="Antigravity Vibe Toolkit — Google Antigravity Edition" width="100%" />
</p>

# Antigravity Vibe Toolkit 🚀

[Português (Brasil)](README.pt-BR.md) · **English**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Google Antigravity Ready](https://img.shields.io/badge/Google%20Antigravity-Native%20Skills-4285F4.svg)](https://deepmind.google)
[![Architecture: Subagents & MCP](https://img.shields.io/badge/Architecture-Subagents%20%26%20MCP-green.svg)](docs/03-subagent-orchestration.md)
[![Quality: Evidence--First](https://img.shields.io/badge/Quality-Evidence--First-orange.svg)](docs/02-evidence-first.md)

**The definitive autonomous software engineering harness, subagent orchestration engine, and quality gate toolkit for Google Antigravity.**

Inspired by and building upon [Matheus Gomes' vibe-coding-toolkit](https://github.com/soumatheusgomes/vibe-coding-toolkit), this repository is a **specialized, production-grade edition tailored for the Google Antigravity (DeepMind) ecosystem**. It combines:
* **8 Native Antigravity Skills (`SKILL.md`)** with progressive on-demand disclosure.
* **Evidence-First Quality Pipeline**: Never accept "looks good" without terminal proof of types, lint, tests, and builds.
* **Parallel Wave Subagent Orchestration** with collision-free file-write locking.
* **Zero-Dependency CLI (`agy-vibe`)** for macOS and Linux developer automation.

---

## ⚡ Installation & Quickstart

<p align="center">
  <img src="assets/installation-flow.svg" alt="Installation and Activation Flow" width="100%" />
</p>

### 1. One-Click Global Installation (Mac / Linux)
Open your terminal in the cloned repository folder and run:
```bash
./scripts/install-global.sh
```

#### What happens behind the scenes?
1. **Registers the `agy-vibe` CLI**: Symlinks the tool into `~/.local/bin/agy-vibe` (or `/usr/local/bin/agy-vibe`), making it immediately accessible anywhere in your shell.
2. **Registers Skills into Antigravity**: Recursively copies all 8 skills into Antigravity's internal directory at `~/.gemini/antigravity/builtin/skills/`.
3. **Instant Activation**: Antigravity automatically discovers and exposes the skills across all your current and future coding sessions without requiring a restart!

### 2. Scaffold Antigravity Foundations in Any Project
Navigate to the root of any new or existing project and run:
```bash
agy-vibe init .
```
This generates the canonical foundation:
* `PRODUCT.md`: Problem statement, MVP scope, and acceptance criteria.
* `AGENTS.md` & `GEMINI.md`: Agent behavior rules and build commands.
* `docs/`: Architecture boundaries, quality standards, and setup manuals.
* `.agents/rules/`: Rules for Evidence-First verification, 350-line file limits, and subagents.

### 3. Verify Quality Gates (Evidence-First)
```bash
agy-vibe verify
```
Automatically executes TypeScript/Python syntax checking, linters, the 350-line file scan, automated test suites, and production builds, generating a Markdown Evidence Report.

---

## 🔬 How the Google Antigravity Skills System Actually Works

<p align="center">
  <img src="assets/skills-architecture.svg" alt="Google Antigravity Skills Architecture" width="100%" />
</p>

Unlike basic AI coding assistants that dump massive static prompts into the conversation, **Google Antigravity** employs an intelligent progressive discovery model:

### 1. Progressive Disclosure (Zero Context Bloat)
At the start of every turn, Antigravity **does NOT inject the full text of skills** into the model's context window. Instead, it injects only the lightweight YAML frontmatter (`name` and `description` — approximately 30 tokens per skill).
* **Massive Token Savings**: Over 90% of the context window remains strictly dedicated to your codebase and the model's analytical reasoning.
* **On-Demand Activation**: The agent only reads and executes the complete `SKILL.md` when the active task matches that skill's description (e.g. *"Perform a security audit"* dynamically pulls `security-auditor`).

### 2. Resolution & Precedence Order
Antigravity discovers and resolves conflicting skills hierarchically:
1. **`.agents/skills/` (Workspace Project)**: Highest priority. Allows an individual repository to override a global skill with project-specific rules.
2. **`skills.json`**: Explicitly declared workspace registrations.
3. **`~/.gemini/antigravity/builtin/skills/` (Global Machine-Local)**: Where our installer registers skills for machine-wide access.
4. **Builtin System Skills**: Mounted by name by the agent engine.

### 3. Anatomy of a Canonical Antigravity Skill
Each skill directory in `skills/<name>/` contains:
```text
skills/evidence-first/
├── SKILL.md          # Required: YAML frontmatter + step-by-step agent instructions
├── scripts/          # Optional: Automated executable helper scripts (Bash, Python, Node)
├── references/       # Optional: In-depth technical manuals and schemas
└── examples/         # Optional: Concrete input/output reference cases
```

---

## 🧠 Included Skills Catalog

| Skill | Trigger / When Antigravity Activates | Core Capability |
| :--- | :--- | :--- |
| **[`evidence-first`](skills/evidence-first/SKILL.md)** | Concluding any feature or bugfix | Runs typecheck, lint, tests, and build before declaring complete. |
| **[`modular-350-refactor`](skills/modular-350-refactor/SKILL.md)** | Source files exceeding 350 lines | Decomposes code using the Facade pattern without breaking existing imports. |
| **[`security-auditor`](skills/security-auditor/SKILL.md)** | Security reviews and PR audits | Scans for leaked secrets (`.env`), injection vectors, and trust boundaries. |
| **[`subagent-review`](skills/subagent-review/SKILL.md)** | In-depth code review | Dispatches 3 parallel subagents (Architect, Security, QA) via `invoke_subagent`. |
| **[`parallel-waves`](skills/parallel-waves/SKILL.md)** | Complex multi-tier features | Orchestrates ordered waves (DB -> Backend + Frontend in parallel -> Tests). |
| **[`context7-docs`](skills/context7-docs/SKILL.md)** | API and framework documentation | Queries official, up-to-date documentation to eliminate hallucinated syntax. |
| **[`chrome-devtools`](skills/chrome-devtools/SKILL.md)** | Frontend and UI inspection | Audits browser console errors, hydration mismatches, and network telemetry. |
| **[`project-bootstrap`](skills/project-bootstrap/SKILL.md)** | Starting a project from scratch | Scaffolds a complete Next.js / TypeScript / Python stack from a 2-line prompt. |

---

## 🛠️ The `agy-vibe` CLI Reference

The [`bin/agy-vibe`](bin/agy-vibe) tool is written in pure Node.js with zero external dependencies:

```bash
# Scaffold the Antigravity base in the current directory
agy-vibe init .

# Run the Quality Gate verification pipeline and output evidence
agy-vibe verify

# Scan all project files and flag those exceeding 350 lines
agy-vibe sanitize

# Reinstall or update global Antigravity skills (~/.gemini/antigravity/...)
agy-vibe install-skills

# Check project compliance score against Antigravity standards
agy-vibe status
```

---

## 🤝 Credits & Attribution

Created by **Daniel Junior Barbosa da Silva** as a dedicated evolutionary edition for **Google Antigravity**, built upon and deeply inspired by the foundational work of [Matheus Gomes (vibe-coding-toolkit)](https://github.com/soumatheusgomes/vibe-coding-toolkit).

We express our sincere appreciation to Matheus Gomes for curating the initial Vibe Coding methodologies. This edition expands those principles to leverage Google DeepMind Antigravity's native subagents, hierarchical rules, and progressive skill disclosure.

---

## 📄 License

Licensed under the [MIT License](LICENSE).
