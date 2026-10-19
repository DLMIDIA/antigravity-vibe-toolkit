#!/bin/bash
# Antigravity Vibe Toolkit Global Installer for macOS / Linux
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "🚀 Installing Antigravity Vibe Toolkit..."

# 1. Install CLI symlink
mkdir -p "$HOME/.local/bin"
ln -sf "$DIR/bin/agy-vibe" "$HOME/.local/bin/agy-vibe"

# Also try /usr/local/bin if writable
if [ -w "/usr/local/bin" ]; then
  ln -sf "$DIR/bin/agy-vibe" "/usr/local/bin/agy-vibe"
  echo "✔ Symlinked agy-vibe to /usr/local/bin/agy-vibe"
else
  echo "✔ Symlinked agy-vibe to $HOME/.local/bin/agy-vibe"
  echo "  (Make sure $HOME/.local/bin is in your PATH)"
fi

# 2. Install Skills into Antigravity
"$DIR/bin/agy-vibe" install-skills

echo ""
echo "🎉 Installation completed!"
echo "You can now run 'agy-vibe --help' anywhere on your Mac."
