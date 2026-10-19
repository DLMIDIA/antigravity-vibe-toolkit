# Antigravity Vibe Toolkit CLI Reference (`agy-vibe`)

The `agy-vibe` CLI is a zero-dependency automation tool engineered to enforce quality gates and bootstrap projects.

## Installation
Run the installer to add `agy-vibe` to your system path and register skills:
```bash
./scripts/install-global.sh
```

## Commands

### `agy-vibe init [directory]`
Scaffolds the Antigravity Vibe Coding foundation in an existing or new project.
- Generates `PRODUCT.md`, `AGENTS.md`, and `GEMINI.md`.
- Generates `docs/architecture.md`, `docs/quality.md`, `docs/setup.md`, etc.
- Configures `.agents/rules/` and `.agents/skills/`.

### `agy-vibe verify`
Executes the automated quality gate pipeline:
1. **Modularity**: Scans for files exceeding 350 lines.
2. **Type Safety**: Runs `tsc --noEmit` or python compile checks.
3. **Linter**: Runs `npm run lint` or equivalent.
4. **Tests**: Runs `npm test` or `pytest`.
5. **Build**: Runs `npm run build`.

### `agy-vibe sanitize`
Scans the codebase for files exceeding the 350-line ceiling and prints a line-by-line breakdown with refactoring recommendations.

### `agy-vibe install-skills`
Copies all skills from the toolkit into `~/.gemini/antigravity/builtin/skills/`, making them immediately available across all Antigravity sessions on your Mac.

### `agy-vibe status`
Inspects the current project and scores its compliance with Antigravity Vibe Coding standards.
