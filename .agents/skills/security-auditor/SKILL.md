---
name: security-auditor
description: >-
  Use this skill to perform rigorous, evidence-based security reviews of code changes,
  diffs, or entire repositories, focusing on secret leaks, injection flaws, authentication,
  authorization boundaries, and dependency vulnerabilities.
---

# Security Review & Trust Boundary Audit

This skill guides a non-destructive, read-only security assessment of your codebase.

## Audit Checklist

### 1. Secrets & Credentials Scan
- Verify that `.env`, `.env.local`, `.pem`, `.key`, and API tokens are not committed to git.
- Check `.gitignore` for mandatory inclusions:
  ```gitignore
  .env*
  *.pem
  *.key
  id_rsa*
  credentials.json
  ```
- Run a pattern search across recent diffs or commits:
  ```bash
  git log -p -n 10 | grep -Ei "(api_key|secret|password|bearer|auth_token)"
  ```

### 2. Input Validation & Trust Boundaries
- All user-facing endpoints (Server Actions, API routes, controller functions) must validate incoming payloads with schemas (e.g. Zod, Valibot, Pydantic).
- Ensure zero dynamic SQL concatenation (use parameterized queries or type-safe ORMs like Drizzle/Prisma).

### 3. Dependency Vulnerability Audit
Execute dependency vulnerability checks:
```bash
npm audit --production || pip-audit
```

### 4. Reporting Protocol
- Produce a **Private Security Assessment** structured as follows:
  1. **Severity Classification**: CRITICAL, HIGH, MEDIUM, LOW, INFORMATIONAL.
  2. **Reachable Vector**: Exact file path, line numbers, and trigger mechanism.
  3. **Verified Evidence**: Code snippet illustrating the issue.
  4. **Remediation**: Recommended patch or architectural fix.
