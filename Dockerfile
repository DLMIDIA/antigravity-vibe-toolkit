# Antigravity Vibe Monitor & Dashboard
# Production Lightweight Docker Container

FROM node:20-alpine

LABEL maintainer="Daniel Junior Barbosa da Silva <contato@dlmidia.com.br>"
LABEL description="Antigravity Vibe Monitor: Token economy, quality gates & Obsidian memory dashboard"

WORKDIR /app

# Copy application files
COPY package.json ./
COPY bin/ ./bin/
COPY scripts/ ./scripts/
COPY docs/ ./docs/
COPY rules/ ./rules/
COPY skills/ ./skills/
COPY templates/ ./templates/
COPY assets/ ./assets/
COPY PRODUCT.md AGENTS.md GEMINI.md ./

# Make CLI executable
RUN chmod +x ./bin/agy-vibe ./scripts/*.sh ./scripts/*.py 2>/dev/null || true

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4242

# Expose Dashboard Port
EXPOSE 4242

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4242/ || exit 1

# Launch Server
CMD ["node", "scripts/dashboard-server.js"]
