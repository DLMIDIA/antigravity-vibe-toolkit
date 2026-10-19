#!/usr/bin/env python3
"""
Scan project files and flag any source file exceeding the 350-line limit.
"""
import os
import sys

MAX_LINES = 350
IGNORED_DIRS = {
    "node_modules", ".git", "dist", "build", ".next", ".agents",
    "brain", "__pycache__", ".venv", "venv", ".idea", ".vscode"
}
VALID_EXTS = {
    ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".php",
    ".vue", ".svelte", ".rb", ".java", ".c", ".cpp", ".cs"
}

def scan(root_dir):
    oversized = []
    total_files = 0

    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in VALID_EXTS:
                total_files += 1
                full_path = os.path.join(root, file)
                try:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        lines = sum(1 for _ in f)
                    if lines > MAX_LINES:
                        rel = os.path.relpath(full_path, root_dir)
                        oversized.append((rel, lines))
                except Exception:
                    pass

    return oversized, total_files

def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "."
    oversized, total = scan(target)

    print(f"\n📊 Scanned {total} source files in '{target}'")
    if not oversized:
        print("\033[32m✔ All files comply with the 350-line limit!\033[0m\n")
        sys.exit(0)
    else:
        print(f"\033[33m⚠ Found {len(oversized)} file(s) exceeding {MAX_LINES} lines:\033[0m")
        oversized.sort(key=lambda x: x[1], reverse=True)
        for rel, lines in oversized:
            print(f"  \033[31m{lines:>5} lines\033[0m -> \033[1m{rel}\033[0m")
        print("\n\033[33m💡 Break large files into cohesive submodules.\033[0m\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
