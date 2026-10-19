# Model Context Protocol (MCP) Integration for Antigravity

Antigravity natively supports MCP servers via `mcp_config.json` or within plugin definitions. This enables the agent to interact with live external services, browser environments, and databases.

## Recommended MCP Servers

### 1. Context7 MCP
- **Package**: `@upstash/context7-mcp`
- **Purpose**: Real-time queries for current library documentation and framework APIs. Eliminates deprecated syntax.

### 2. Chrome DevTools MCP
- **Package**: `@modelcontextprotocol/server-puppeteer`
- **Purpose**: Controls a headless or visible Chrome browser to inspect client-side console errors, network latency, hydration bugs, and DOM layout.

### 3. PostgreSQL MCP
- **Package**: `@modelcontextprotocol/server-postgres`
- **Purpose**: Direct inspection of database schemas, indexes, query execution plans, and row counts.

### 4. Sentry MCP
- **Package**: `@modelcontextprotocol/server-sentry`
- **Purpose**: Real-time retrieval of production stack traces, error frequencies, and affected users.

## Setup
Copy `templates/mcp/mcp_config.json.template` to your project root or `~/.gemini/antigravity/mcp_config.json` and provide necessary environment variables.
