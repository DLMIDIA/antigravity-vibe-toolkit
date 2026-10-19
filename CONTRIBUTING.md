# Contributing to Antigravity Vibe Toolkit

Contributions are welcome! This toolkit is dedicated to standardizing and empowering autonomous, high-quality engineering workflows on **Google Antigravity**.

## Guidelines

1. **Evidence-First**: Any pull request must include terminal evidence of passing tests, linter checks, and builds.
2. **Modularity**: Every single file must stay strictly under 350 lines.
3. **Compatibility**: Customizations must follow Google Antigravity's native conventions (`SKILL.md` frontmatter, `.agents/` workspace hierarchy, `GEMINI.md`/`AGENTS.md`).

## Development Workflow
```bash
# Clone and inspect status
git clone https://github.com/danieljuniorbarbosa/antigravity-vibe-toolkit.git
cd antigravity-vibe-toolkit

# Test the CLI tool
./bin/agy-vibe status

# Run Quality Verification
./bin/agy-vibe verify
```
