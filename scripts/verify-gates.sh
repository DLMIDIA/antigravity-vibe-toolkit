#!/bin/bash
# Antigravity Quality Gate Runner
set -e

echo "=== Running Antigravity Quality Gates ==="

# 1. 350-line check
python3 "$(dirname "$0")/scan-lines.py" .

# 2. Typecheck
if [ -f "tsconfig.json" ]; then
  echo "--> Running TypeScript check..."
  npx tsc --noEmit
fi

# 3. Linter
if [ -f "package.json" ]; then
  if grep -q '"lint"' package.json; then
    echo "--> Running Linter..."
    npm run lint
  fi
fi

# 4. Tests
if [ -f "package.json" ]; then
  if grep -q '"test"' package.json && ! grep -q 'no test specified' package.json; then
    echo "--> Running Test Suite..."
    npm test
  fi
fi

echo "✔ All Quality Gates Passed!"
