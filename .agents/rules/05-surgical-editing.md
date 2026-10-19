# Antigravity Rule: Surgical Code Editing (ASEM)

> **Principle**: Minimize token consumption, eliminate unintended regressions, and preserve existing code integrity through strict surgical editing.

## Mandatory Rules for Antigravity

1. **Targeted Inspection Before Modification**:
   Never edit a file without first viewing the specific line range (`view_file` with `StartLine`/`EndLine`). Understand the function signatures, dependencies, and expected types before touching any code.

2. **Atomic Contiguous Diffs (`replace_file_content`)**:
   - Always perform localized, contiguous modifications using `replace_file_content`.
   - Never use whole-file overwrites (`write_to_file` with `Overwrite: true`) on existing source files unless explicitly requested by the user.
   - Preserve all existing comments, docstrings, formatting, and unrelated logic.

3. **Enforce the 350-Line Limit (Facade Pattern)**:
   - If modifying a file would push it beyond 350 lines, or if the file already exceeds 350 lines, do not add more code directly into it.
   - Extract the new logic into a dedicated sibling module (service, helper, sub-component) and use the main file as a clean facade.

4. **Mandatory Post-Edit Verification**:
   Immediately after modifying code, execute a syntax check or unit test in the terminal:
   - JavaScript/Node: `node -c <file>`
   - TypeScript: `npx tsc --noEmit`
   - Python: `python3 -m py_compile <file>`
   Never report a task as complete without verifiable terminal proof.

5. **Decision Persistence**:
   Document significant architectural or structural decisions in `.agents/decisions/` so context is preserved across sessions.
