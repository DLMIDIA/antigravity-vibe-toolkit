#!/usr/bin/env node

/**
 * Antigravity Vibe Monitor & Dashboard Server
 * Local web server tracking token economy, modular health, project compliance,
 * Obsidian-style memory vault, and live Antigravity Agent & Model Telemetry.
 *
 * Runs locally on port 4242 (or process.env.PORT) and inside Docker.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

const PORT = parseInt(process.env.PORT || '4242', 10);
const PKG_ROOT = path.resolve(__dirname, '..');
const HOME = os.homedir();
const DESKTOP = path.join(HOME, 'Desktop');

// Common search locations for user projects
const SEARCH_DIRS = [
  path.join(DESKTOP, '01 - Projetos & Sistemas'),
  DESKTOP,
  path.join(HOME, 'Projects'),
  path.join(HOME, 'Developer'),
  path.join(HOME, 'code'),
];

// ---------------------------------------------------------------------------
// 1. LIVE ANTIGRAVITY TELEMETRY (Tokens, Model Tracking, Context Satiation)
// ---------------------------------------------------------------------------
function getAntigravityLiveTelemetry() {
  const brainDir = path.join(HOME, '.gemini', 'antigravity', 'brain');
  let latestConv = null;
  let latestMtime = 0;

  if (fs.existsSync(brainDir)) {
    try {
      const dirs = fs.readdirSync(brainDir);
      for (const d of dirs) {
        const tPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(tPath)) {
          const stat = fs.statSync(tPath);
          if (stat.mtimeMs > latestMtime) {
            latestMtime = stat.mtimeMs;
            latestConv = { id: d, path: tPath };
          }
        }
      }
    } catch (e) {}
  }

  let activeModel = 'Gemini 3.8 Flash (High)';
  let contextTokens = 0;
  let inputTokens = 0;
  let cacheReadTokens = 0;
  let outputTokens = 0;
  let totalSteps = 0;
  const contextLimit = 1000000; // 1M tokens limit for Gemini standard

  if (latestConv && fs.existsSync(latestConv.path)) {
    try {
      const content = fs.readFileSync(latestConv.path, 'utf8');
      const lines = content.trim().split('\n');
      totalSteps = lines.length;

      for (const line of lines) {
        try {
          const d = JSON.parse(line);
          if (d.type === 'USER_INPUT' && d.content && d.content.includes('Model Selection` from')) {
            const m = d.content.match(/Model Selection\` from .*? to (.*?)\.\s*No need/);
            if (m && m[1]) activeModel = m[1].trim();
          }
          if (d.input_tokens !== undefined) {
            inputTokens += d.input_tokens;
            cacheReadTokens += (d.cache_read_tokens || 0);
            outputTokens += (d.output_tokens || 0);
            contextTokens = d.input_tokens + (d.cache_read_tokens || 0);
          }
        } catch (err) {}
      }
    } catch (e) {}
  }

  const contextPctNum = parseFloat(((contextTokens / contextLimit) * 100).toFixed(1));
  const remainingTokens = Math.max(0, contextLimit - contextTokens);

  let alertLevel = 'NORMAL';
  let alertMessage = 'Contexto Saudável: Ampla capacidade livre para raciocínio e execução.';
  let alertColor = '#10b981';

  if (contextPctNum >= 80) {
    alertLevel = 'CRITICAL';
    alertMessage = '⚠️ ALERTA DE CONTEXTO: Janela acima de 80%! Recomendado usar /compact para resumir e liberar tokens.';
    alertColor = '#ef4444';
  } else if (contextPctNum >= 60) {
    alertLevel = 'WARNING';
    alertMessage = 'Atenção ao Contexto: Mais de 60% da janela ocupada. Considere usar /compact em breve.';
    alertColor = '#f59e0b';
  }

  return {
    conversationId: latestConv ? latestConv.id : 'N/A',
    activeModel,
    contextTokens,
    contextLimit,
    contextPct: contextPctNum,
    remainingTokens,
    alertLevel,
    alertMessage,
    alertColor,
    inputTokens,
    cacheReadTokens,
    outputTokens,
    totalSteps,
    cacheSavingsMultiplier: cacheReadTokens > 0 ? (cacheReadTokens / Math.max(1, inputTokens)).toFixed(1) : '1.0'
  };
}

// ---------------------------------------------------------------------------
// 2. PROJECT AUDITING & SCANNING
// ---------------------------------------------------------------------------
function scanProjectFiles(dir, maxLines = 350) {
  const ignore = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'brain', '__pycache__', '.venv']);
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.php', '.vue']);
  let totalFiles = 0;
  let compliantFiles = 0;
  let totalLines = 0;
  const oversized = [];

  function walk(current) {
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.') && entry.name !== '.agents') continue;
      if (ignore.has(entry.name)) continue;

      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (exts.has(ext)) {
          totalFiles++;
          try {
            const content = fs.readFileSync(full, 'utf8');
            const lines = content.split('\n').length;
            totalLines += lines;
            if (lines <= maxLines) {
              compliantFiles++;
            } else {
              oversized.push({ file: path.relative(dir, full), lines });
            }
          } catch (e) {}
        }
      }
    }
  }

  walk(dir);
  return { totalFiles, compliantFiles, totalLines, oversized };
}

function getProjectCompliance(dir) {
  const checks = [
    'PRODUCT.md',
    'AGENTS.md',
    'GEMINI.md',
    'docs/architecture.md',
    'docs/quality.md',
    'docs/setup.md',
    '.agents/rules',
    '.agents/skills',
  ];
  let score = 0;
  for (const c of checks) {
    if (fs.existsSync(path.join(dir, c))) score++;
  }
  return score;
}

function discoverProjects() {
  const projects = [];
  const visited = new Set();

  const toolkitPath = PKG_ROOT;
  visited.add(toolkitPath);
  projects.push(createProjectSummary('antigravity-vibe-toolkit', toolkitPath));

  for (const parent of SEARCH_DIRS) {
    if (!fs.existsSync(parent)) continue;
    let entries = [];
    try {
      entries = fs.readdirSync(parent, { withFileTypes: true });
    } catch (e) {
      continue;
    }

    for (const ent of entries) {
      if (ent.isDirectory() && !ent.name.startsWith('.') && !['01 - Projetos & Sistemas', '02 - Orçamentos & Contratos', '03 - Fotos, Vídeos & Drone', '04 - Design & Artes', '05 - Documentos & PDFs', '06 - Capturas e Gravações de Tela', '07 - Backups & Arquivos'].includes(ent.name)) {
        const pPath = path.join(parent, ent.name);
        if (visited.has(pPath)) continue;

        if (
          fs.existsSync(path.join(pPath, 'package.json')) ||
          fs.existsSync(path.join(pPath, '.git')) ||
          fs.existsSync(path.join(pPath, 'requirements.txt')) ||
          fs.existsSync(path.join(pPath, 'AGENTS.md')) ||
          fs.existsSync(path.join(pPath, 'PRODUCT.md'))
        ) {
          visited.add(pPath);
          projects.push(createProjectSummary(ent.name, pPath));
        }
      }
    }
  }

  return projects;
}

function createProjectSummary(name, pPath) {
  const compliance = getProjectCompliance(pPath);
  const { totalFiles, compliantFiles, totalLines, oversized } = scanProjectFiles(pPath);

  const excessLines = oversized.reduce((acc, f) => acc + (f.lines - 350), 0);
  const tokensSaved = Math.max(0, (compliantFiles * 850) - (excessLines * 4));
  const estimatedCostSaved = (tokensSaved / 1000000) * 1.5;

  return {
    name,
    path: pPath,
    complianceScore: compliance,
    totalFiles,
    compliantFiles,
    oversizedFiles: oversized.length,
    totalLines,
    tokensSaved,
    estimatedCostSaved: estimatedCostSaved.toFixed(3),
    isCompliant: compliance >= 6 && oversized.length === 0,
  };
}

function getSkillsData() {
  const skillsDir = path.join(PKG_ROOT, 'skills');
  if (!fs.existsSync(skillsDir)) return [];

  const folders = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  return folders.map(name => {
    const skillPath = path.join(skillsDir, name, 'SKILL.md');
    let description = '';
    let content = '';
    if (fs.existsSync(skillPath)) {
      content = fs.readFileSync(skillPath, 'utf8');
      const match = content.match(/description:\s*>?-?\s*([\s\S]*?)---/);
      if (match) {
        description = match[1].replace(/\n/g, ' ').trim();
      }
    }

    const imgPath = path.join(PKG_ROOT, 'assets', 'skills', `${name}.png`);
    const hasImage = fs.existsSync(imgPath);

    return {
      name,
      description,
      hasImage,
      imageUrl: hasImage ? `/assets/skills/${name}.png` : null,
      content,
    };
  });
}

function getMemoryVault() {
  const notes = [];
  const projectDocs = [
    { title: 'PRODUCT.md (Escopo & Aceite)', path: path.join(PKG_ROOT, 'PRODUCT.md') },
    { title: 'AGENTS.md (Regras do Agente)', path: path.join(PKG_ROOT, 'AGENTS.md') },
    { title: 'GEMINI.md (Ponte Antigravity)', path: path.join(PKG_ROOT, 'GEMINI.md') },
    { title: 'architecture.md (Arquitetura)', path: path.join(PKG_ROOT, 'docs', 'architecture.md') },
    { title: 'quality.md (Padrões de Qualidade)', path: path.join(PKG_ROOT, 'docs', 'quality.md') },
    { title: 'setup.md (Ambiente & Fontes)', path: path.join(PKG_ROOT, 'docs', 'setup.md') },
    { title: '07-skills-deep-dive.md (Guia de Skills)', path: path.join(PKG_ROOT, 'docs', '07-skills-deep-dive.md') },
    { title: '08-quality-gates-guide.md (Guia Quality Gates)', path: path.join(PKG_ROOT, 'docs', '08-quality-gates-guide.md') },
  ];

  for (const doc of projectDocs) {
    if (fs.existsSync(doc.path)) {
      notes.push({
        title: doc.title,
        filename: path.basename(doc.path),
        content: fs.readFileSync(doc.path, 'utf8'),
      });
    }
  }

  return notes;
}

// ---------------------------------------------------------------------------
// 3. FRONTEND SINGLE PAGE APPLICATION
// ---------------------------------------------------------------------------
function renderHTML() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Vibe Monitor & Live Telemetry</title>
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #111827;
      --card-border: #1f293d;
      --text: #f3f4f6;
      --text-dim: #9ca3af;
      --cyan: #06b6d4;
      --emerald: #10b981;
      --purple: #8b5cf6;
      --amber: #f59e0b;
      --red: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding-bottom: 60px;
    }
    header {
      background: linear-gradient(180deg, #131c2e 0%, rgba(19, 28, 46, 0.4) 100%);
      border-bottom: 1px solid var(--card-border);
      padding: 18px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      backdrop-filter: blur(12px);
      z-index: 50;
    }
    .logo-box { display: flex; align-items: center; gap: 14px; }
    .logo-core {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, var(--cyan), var(--purple));
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 22px; color: #fff;
      box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
    }
    .logo-title h1 { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
    .logo-title p { font-size: 12px; color: var(--text-dim); }

    .nav-tabs { display: flex; gap: 8px; }
    .tab-btn {
      background: transparent; border: 1px solid transparent; color: var(--text-dim);
      padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .tab-btn.active {
      color: #fff; background: #1e293b; border-color: var(--cyan);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
    }

    .container { max-width: 1240px; margin: 28px auto; padding: 0 24px; }

    /* Live Telemetry Banner */
    .telemetry-card {
      background: linear-gradient(135deg, #131c2e 0%, #0d1527 100%);
      border: 1px solid #2b3954; border-radius: 16px;
      padding: 24px; margin-bottom: 28px; position: relative; overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }
    .telemetry-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;
    }
    .telemetry-model-box { display: flex; align-items: center; gap: 12px; }
    .model-badge {
      background: rgba(6, 182, 212, 0.15); border: 1px solid var(--cyan);
      color: #38bdf8; padding: 6px 14px; border-radius: 999px;
      font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #34d399;
      box-shadow: 0 0 10px #34d399; animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(52, 211, 153, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
    }

    .alert-banner {
      padding: 12px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
      display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
    }

    /* Progress bar */
    .progress-track {
      width: 100%; height: 12px; background: #0b0f19; border-radius: 999px;
      overflow: hidden; margin: 10px 0; border: 1px solid #1f293d;
    }
    .progress-fill {
      height: 100%; width: 0%; border-radius: 999px;
      background: linear-gradient(90deg, var(--cyan), var(--purple));
      transition: width 0.5s ease-in-out;
    }

    .telemetry-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px; margin-top: 20px;
    }
    .telemetry-stat {
      background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px; padding: 14px; text-align: left;
    }
    .telemetry-stat-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
    .telemetry-stat-val { font-size: 20px; font-weight: 800; color: #fff; }

    /* Metric Cards */
    .grid-metrics {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px; margin-bottom: 32px;
    }
    .metric-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 22px; position: relative; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .metric-card::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px;
    }
    .metric-cyan::before { background: var(--cyan); }
    .metric-emerald::before { background: var(--emerald); }
    .metric-purple::before { background: var(--purple); }
    .metric-amber::before { background: var(--amber); }

    .metric-label { font-size: 12px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; }
    .metric-val { font-size: 30px; font-weight: 800; color: #fff; }
    .metric-desc { font-size: 12px; color: var(--text-dim); margin-top: 6px; }

    /* Sections */
    .tab-content { display: none; }
    .tab-content.active { display: block; }

    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
    
    /* Project Table */
    .card-table {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th {
      background: #162032; padding: 14px 18px; font-size: 12px;
      font-weight: 700; color: var(--text-dim); text-transform: uppercase;
      border-bottom: 1px solid var(--card-border);
    }
    td { padding: 16px 18px; border-bottom: 1px solid var(--card-border); font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }

    .badge {
      display: inline-block; padding: 4px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 700; text-transform: uppercase;
    }
    .badge-pass { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-warn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

    /* Skills Grid */
    .skills-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }
    .skill-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .skill-card:hover { transform: translateY(-4px); border-color: var(--cyan); }
    .skill-thumb {
      width: 100%; height: 140px; background: #0b0f19;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .skill-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .skill-info { padding: 18px; flex: 1; display: flex; flex-direction: column; }
    .skill-info h3 { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .skill-info p { font-size: 12px; color: var(--text-dim); line-height: 1.4; flex: 1; }

    /* Memory / Obsidian Viewer */
    .memory-layout { display: grid; grid-template-columns: 280px 1fr; gap: 24px; }
    .memory-sidebar {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 16px;
    }
    .memory-list { list-style: none; margin-top: 12px; }
    .memory-item {
      padding: 10px 14px; border-radius: 8px; font-size: 13px;
      cursor: pointer; color: var(--text-dim); margin-bottom: 4px;
      transition: all 0.2s;
    }
    .memory-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .memory-item.active { background: #1e293b; color: var(--cyan); font-weight: 700; }
    .memory-content {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 28px; font-size: 14px;
      overflow-x: auto; white-space: pre-wrap; font-family: monospace;
      color: #cbd5e1; max-height: 650px;
    }

    /* Terminal Console */
    .terminal-box {
      background: #030712; border: 1px solid var(--card-border);
      border-radius: 12px; padding: 20px; font-family: "SF Mono", Menlo, Consolas, monospace;
      font-size: 13px; color: #34d399; min-height: 250px; max-height: 400px;
      overflow-y: auto; white-space: pre-wrap;
    }
    .btn-run {
      background: linear-gradient(135deg, var(--cyan), #2563eb);
      color: #fff; border: none; padding: 10px 20px; border-radius: 8px;
      font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity 0.2s;
    }
    .btn-run:hover { opacity: 0.9; }

    /* Explainer Box */
    .explainer-box {
      background: #101726; border: 1px solid #1e293b; border-radius: 14px;
      padding: 24px; margin-top: 32px;
    }
    .explainer-box h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; color: var(--cyan); }
    .explainer-box p { font-size: 13px; color: var(--text-dim); line-height: 1.6; margin-bottom: 10px; }
  </style>
</head>
<body>

  <header>
    <div class="logo-box">
      <div class="logo-core">⚡</div>
      <div class="logo-title">
        <h1>Antigravity Vibe Monitor</h1>
        <p>Live Token Telemetry &amp; Multi-Project Quality Dashboard</p>
      </div>
    </div>
    <div class="nav-tabs">
      <button class="tab-btn active" onclick="showTab('overview')">📊 Overview &amp; Tokens</button>
      <button class="tab-btn" onclick="showTab('projects')">📁 Projetos</button>
      <button class="tab-btn" onclick="showTab('memory')">🧠 Obsidian Memory Vault</button>
      <button class="tab-btn" onclick="showTab('skills')">⚡ Skills Catalog</button>
      <button class="tab-btn" onclick="showTab('verifier')">🛡️ Quality Gate Runner</button>
    </div>
  </header>

  <div class="container">

    <!-- TAB 1: OVERVIEW -->
    <div id="tab-overview" class="tab-content active">

      <!-- LIVE ANTIGRAVITY TELEMETRY CARD -->
      <div class="telemetry-card">
        <div class="telemetry-header">
          <div class="telemetry-model-box">
            <span class="pulse-dot"></span>
            <div style="font-size:14px; font-weight:700; color:#fff;">Sessão Ativa do Google Antigravity</div>
            <div class="model-badge" id="telemetry-model">🤖 Carregando modelo...</div>
          </div>
          <div id="telemetry-conv-id" style="font-family:monospace; font-size:11px; color:var(--text-dim);"></div>
        </div>

        <div id="telemetry-alert-box" class="alert-banner" style="background: rgba(16, 185, 129, 0.12); color:#34d399; border:1px solid rgba(16, 185, 129, 0.3);">
          <span>🟢</span>
          <span id="telemetry-alert-text">Monitorando consumo de contexto...</span>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
            <span style="font-weight:700; color:var(--text-dim);">Ocupação da Janela de Contexto (Tokens Ativos)</span>
            <span id="telemetry-pct-label" style="font-weight:800; color:#fff;">0%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" id="telemetry-progress-fill"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-top:4px;">
            <span>0</span>
            <span id="telemetry-context-stats">0 / 1.000.000 tokens</span>
            <span>1.0M Max</span>
          </div>
        </div>

        <div class="telemetry-grid">
          <div class="telemetry-stat">
            <div class="telemetry-stat-label">Tokens Reaproveitados (Cache)</div>
            <div class="telemetry-stat-val" id="telemetry-cache" style="color:#38bdf8;">0</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">Prompt Caching do Gemini</div>
          </div>
          <div class="telemetry-stat">
            <div class="telemetry-stat-label">Tokens de Entrada (Input)</div>
            <div class="telemetry-stat-val" id="telemetry-input">0</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">Novas mensagens e dados</div>
          </div>
          <div class="telemetry-stat">
            <div class="telemetry-stat-label">Tokens Gerados (Output)</div>
            <div class="telemetry-stat-val" id="telemetry-output">0</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">Respostas e comandos</div>
          </div>
          <div class="telemetry-stat">
            <div class="telemetry-stat-label">Passos da Conversa</div>
            <div class="telemetry-stat-val" id="telemetry-steps" style="color:#c084fc;">0</div>
            <div style="font-size:11px; color:var(--text-dim); margin-top:2px;">Turnos e chamadas de ferramenta</div>
          </div>
        </div>
      </div>

      <!-- METRICS GRID -->
      <div class="grid-metrics">
        <div class="metric-card metric-cyan">
          <div class="metric-label">Economia Estimada de Tokens</div>
          <div class="metric-val" id="metric-tokens">Calculando...</div>
          <div class="metric-desc">Tokens poupados pela regra das 350 linhas &amp; indexação</div>
        </div>
        <div class="metric-card metric-emerald">
          <div class="metric-label">Arquivos no Teto Modular</div>
          <div class="metric-val" id="metric-modular">0 / 0</div>
          <div class="metric-desc">Arquivos com &le; 350 linhas com máxima precisão de IA</div>
        </div>
        <div class="metric-card metric-purple">
          <div class="metric-label">Economia Estimada ($)</div>
          <div class="metric-val" id="metric-cost">$0.00</div>
          <div class="metric-desc">Estimado com base em custos de contexto de LLMs</div>
        </div>
        <div class="metric-card metric-amber">
          <div class="metric-label">Skills Nativas Ativas</div>
          <div class="metric-val" id="metric-skills">8</div>
          <div class="metric-desc">Descoberta progressiva e on-demand no Antigravity</div>
        </div>
      </div>

      <div class="section-title">
        <span>Resumo de Saúde dos Projetos</span>
      </div>
      <div class="card-table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Compliance Score</th>
              <th>Arquivos Totais</th>
              <th>&le; 350 Linhas</th>
              <th>Arquivos Longos</th>
              <th>Tokens Poupados</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="overview-table-body">
            <tr><td colspan="7" style="text-align:center; padding:24px;">Carregando projetos...</td></tr>
          </tbody>
        </table>
      </div>

      <!-- EXPLAINER BOX -->
      <div class="explainer-box">
        <h3>🔍 Como o Monitor Rastreia os Modelos e os Tokens do Antigravity?</h3>
        <p><strong>1. Rastreamento em Tempo Real dos Logs:</strong> O Antigravity armazena cada turno de pensamento, execução e contagem de tokens no diretório local <code>~/.gemini/antigravity/brain/&lt;conversation-id&gt;/.system_generated/logs/transcript.jsonl</code>. Nosso monitor lê esse arquivo diretamente no disco e extrai os campos exatos de <code>input_tokens</code>, <code>cache_read_tokens</code> e <code>output_tokens</code>.</p>
        <p><strong>2. Detecção do Modelo Ativo:</strong> Quando você altera o modelo no Antigravity (ex: de <em>Gemini 4 Argon</em> para <em>Gemini 3.8 Flash (High)</em>), o evento <code>&lt;USER_SETTINGS_CHANGE&gt;</code> é registrado. O monitor captura essa mudança instantaneamente e atualiza o badge no topo.</p>
        <p><strong>3. Sistema de Alerta de Saturação:</strong> Modelos modernos possuem janelas massivas (1.000.000 tokens), mas conversas muito longas aumentam a latência e o custo. O monitor calcula a porcentagem utilizada: se passar de <strong>60%</strong> emite um aviso amarelo, e se passar de <strong>80%</strong> emite um alerta vermelho recomendando o uso do comando slash <code>/compact</code>.</p>
        <p><strong>4. Eficiência de Prompt Caching:</strong> O Google Antigravity reutiliza o cache do contexto em cada turno. No gráfico acima, veja como o número de <em>Tokens Reaproveitados</em> ultrapassa os milhões, custando apenas uma fração mínima em relação a enviar o contexto do zero toda vez.</p>
      </div>
    </div>

    <!-- TAB 2: PROJECTS -->
    <div id="tab-projects" class="tab-content">
      <div class="section-title">
        <span>Projetos Monitorados no seu Mac</span>
        <button class="btn-run" onclick="loadAllData()">Atualizar Agora</button>
      </div>
      <div class="card-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Localização</th>
              <th>Compliance Score</th>
              <th>Linhas Totais</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="projects-table-body"></tbody>
        </table>
      </div>
    </div>

    <!-- TAB 3: OBSIDIAN MEMORY VAULT -->
    <div id="tab-memory" class="tab-content">
      <div class="section-title">
        <span>Cofre de Memória Persistente (Estilo Obsidian / Markdown)</span>
      </div>
      <div class="memory-layout">
        <div class="memory-sidebar">
          <div style="font-size:12px; font-weight:700; color:var(--text-dim); text-transform:uppercase;">Notas do Projeto</div>
          <ul class="memory-list" id="memory-list"></ul>
        </div>
        <div class="memory-content" id="memory-viewer">Selecione uma nota ao lado para visualizar seu conteúdo...</div>
      </div>
    </div>

    <!-- TAB 4: SKILLS CATALOG -->
    <div id="tab-skills" class="tab-content">
      <div class="section-title">
        <span>Catálogo de Skills Nativas do Antigravity</span>
      </div>
      <div class="skills-grid" id="skills-grid"></div>
    </div>

    <!-- TAB 5: QUALITY GATE RUNNER -->
    <div id="tab-verifier" class="tab-content">
      <div class="section-title">
        <span>Execução Interativa dos Quality Gates (Evidence-First)</span>
        <button class="btn-run" id="btn-exec-verify" onclick="executeVerify()">▶ Rodar agy-vibe verify</button>
      </div>
      <div class="terminal-box" id="terminal-output">Clique no botão acima para rodar a esteira de validação em tempo real...</div>
    </div>

  </div>

  <script>
    let vaultNotes = [];

    function showTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');
      event.target.classList.add('active');
    }

    async function loadAllData() {
      try {
        const [statsRes, projectsRes, skillsRes, memoryRes, liveRes] = await Promise.all([
          fetch('/api/stats').then(r => r.json()),
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/skills').then(r => r.json()),
          fetch('/api/memory').then(r => r.json()),
          fetch('/api/antigravity/live').then(r => r.json())
        ]);

        // 1. Live Antigravity Telemetry
        document.getElementById('telemetry-model').innerText = '🤖 ' + liveRes.activeModel;
        document.getElementById('telemetry-conv-id').innerText = 'Sessão: ' + liveRes.conversationId.slice(0, 8) + '...';
        
        // Progress bar
        const fill = document.getElementById('telemetry-progress-fill');
        fill.style.width = Math.min(100, liveRes.contextPct) + '%';
        if (liveRes.alertLevel === 'CRITICAL') {
          fill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
        } else if (liveRes.alertLevel === 'WARNING') {
          fill.style.background = 'linear-gradient(90deg, #06b6d4, #f59e0b)';
        } else {
          fill.style.background = 'linear-gradient(90deg, #06b6d4, #8b5cf6)';
        }

        document.getElementById('telemetry-pct-label').innerText = liveRes.contextPct + '% (' + liveRes.contextTokens.toLocaleString() + ' tokens)';
        document.getElementById('telemetry-context-stats').innerText = liveRes.contextTokens.toLocaleString() + ' / ' + liveRes.contextLimit.toLocaleString() + ' tokens (' + liveRes.remainingTokens.toLocaleString() + ' livres)';
        
        // Alert box
        const alertBox = document.getElementById('telemetry-alert-box');
        const alertText = document.getElementById('telemetry-alert-text');
        alertText.innerText = liveRes.alertMessage;
        if (liveRes.alertLevel === 'CRITICAL') {
          alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
          alertBox.style.color = '#f87171';
          alertBox.style.border = '1px solid rgba(239, 68, 68, 0.4)';
        } else if (liveRes.alertLevel === 'WARNING') {
          alertBox.style.background = 'rgba(245, 158, 11, 0.15)';
          alertBox.style.color = '#fbbf24';
          alertBox.style.border = '1px solid rgba(245, 158, 11, 0.4)';
        } else {
          alertBox.style.background = 'rgba(16, 185, 129, 0.12)';
          alertBox.style.color = '#34d399';
          alertBox.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        }

        document.getElementById('telemetry-cache').innerText = (liveRes.cacheReadTokens || 0).toLocaleString();
        document.getElementById('telemetry-input').innerText = (liveRes.inputTokens || 0).toLocaleString();
        document.getElementById('telemetry-output').innerText = (liveRes.outputTokens || 0).toLocaleString();
        document.getElementById('telemetry-steps').innerText = liveRes.totalSteps;

        // 2. Stats
        document.getElementById('metric-tokens').innerText = (statsRes.totalTokensSaved || 0).toLocaleString() + ' tokens';
        document.getElementById('metric-modular').innerText = statsRes.totalCompliantFiles + ' / ' + statsRes.totalFiles;
        document.getElementById('metric-cost').innerText = '$' + (statsRes.totalCostSaved || '0.00');
        document.getElementById('metric-skills').innerText = skillsRes.length;

        // 3. Overview Table
        const tbOverview = document.getElementById('overview-table-body');
        tbOverview.innerHTML = '';
        projectsRes.forEach(p => {
          const row = document.createElement('tr');
          const badgeClass = p.isCompliant ? 'badge-pass' : 'badge-warn';
          const badgeText = p.isCompliant ? '100% Protegido' : 'Revisão Recomendada';
          row.innerHTML = \`
            <td><strong>\${p.name}</strong></td>
            <td>\${p.complianceScore}/8</td>
            <td>\${p.totalFiles}</td>
            <td><span style="color:#34d399;">\${p.compliantFiles}</span></td>
            <td><span style="color:\${p.oversizedFiles > 0 ? '#fbbf24' : '#9ca3af'};">\${p.oversizedFiles}</span></td>
            <td>+\${(p.tokensSaved || 0).toLocaleString()}</td>
            <td><span class="badge \${badgeClass}">\${badgeText}</span></td>
          \`;
          tbOverview.appendChild(row);
        });

        // 4. Projects Table
        const tbProjects = document.getElementById('projects-table-body');
        tbProjects.innerHTML = '';
        projectsRes.forEach(p => {
          const row = document.createElement('tr');
          row.innerHTML = \`
            <td><strong>\${p.name}</strong></td>
            <td style="color:var(--text-dim); font-family:monospace; font-size:12px;">\${p.path}</td>
            <td>\${p.complianceScore}/8 pontos</td>
            <td>\${(p.totalLines || 0).toLocaleString()} linhas</td>
            <td><span class="badge \${p.isCompliant ? 'badge-pass' : 'badge-warn'}">\${p.isCompliant ? 'Protegido' : 'Parcial'}</span></td>
          \`;
          tbProjects.appendChild(row);
        });

        // 5. Memory Notes
        vaultNotes = memoryRes;
        const listEl = document.getElementById('memory-list');
        listEl.innerHTML = '';
        vaultNotes.forEach((n, idx) => {
          const li = document.createElement('li');
          li.className = 'memory-item' + (idx === 0 ? ' active' : '');
          li.innerText = n.title;
          li.onclick = () => selectNote(idx);
          listEl.appendChild(li);
        });
        if (vaultNotes.length > 0) {
          selectNote(0);
        }

        // 6. Skills
        const skillsEl = document.getElementById('skills-grid');
        skillsEl.innerHTML = '';
        skillsRes.forEach(s => {
          const card = document.createElement('div');
          card.className = 'skill-card';
          const thumbContent = s.imageUrl
            ? \`<img src="\${s.imageUrl}" alt="\${s.name}" onerror="this.parentElement.innerHTML='<div class=\\'skill-thumb-placeholder\\'>⚡</div>'" />\`
            : \`<div class="skill-thumb-placeholder">⚡</div>\`;

          card.innerHTML = \`
            <div class="skill-thumb">\${thumbContent}</div>
            <div class="skill-info">
              <h3>\${s.name}</h3>
              <p>\${s.description}</p>
            </div>
          \`;
          skillsEl.appendChild(card);
        });

      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    }

    function selectNote(idx) {
      document.querySelectorAll('.memory-item').forEach((el, i) => {
        el.classList.toggle('active', i === idx);
      });
      document.getElementById('memory-viewer').innerText = vaultNotes[idx].content;
    }

    async function executeVerify() {
      const btn = document.getElementById('btn-exec-verify');
      const term = document.getElementById('terminal-output');
      btn.disabled = true;
      btn.innerText = '⏳ Executando...';
      term.innerText = 'Iniciando agy-vibe verify no repositório...\\n';

      try {
        const res = await fetch('/api/verify', { method: 'POST' });
        const data = await res.json();
        term.innerText = data.output;
      } catch (e) {
        term.innerText = 'Erro ao executar verificação: ' + e.message;
      } finally {
        btn.disabled = false;
        btn.innerText = '▶ Rodar agy-vibe verify';
        loadAllData();
      }
    }

    // Auto refresh every 5 seconds for live telemetry!
    loadAllData();
    setInterval(loadAllData, 5000);
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// 4. SERVER ROUTING & API ENDPOINTS
// ---------------------------------------------------------------------------
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Static Assets (e.g. /assets/skills/...)
  if (pathname.startsWith('/assets/')) {
    const filePath = path.join(PKG_ROOT, pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // API: Live Antigravity Telemetry
  if (pathname === '/api/antigravity/live') {
    const liveData = getAntigravityLiveTelemetry();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(liveData));
    return;
  }

  // API: General Stats
  if (pathname === '/api/stats') {
    const projects = discoverProjects();
    const totalFiles = projects.reduce((a, b) => a + b.totalFiles, 0);
    const totalCompliantFiles = projects.reduce((a, b) => a + b.compliantFiles, 0);
    const totalTokensSaved = projects.reduce((a, b) => a + b.tokensSaved, 0);
    const totalCostSaved = ((totalTokensSaved / 1000000) * 1.5).toFixed(2);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ totalFiles, totalCompliantFiles, totalTokensSaved, totalCostSaved }));
    return;
  }

  // API: Projects List
  if (pathname === '/api/projects') {
    const projects = discoverProjects();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(projects));
    return;
  }

  // API: Skills Metadata
  if (pathname === '/api/skills') {
    const skills = getSkillsData();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(skills));
    return;
  }

  // API: Memory Vault Notes
  if (pathname === '/api/memory') {
    const notes = getMemoryVault();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(notes));
    return;
  }

  // API: Run Quality Gate Verification
  if (pathname === '/api/verify' && req.method === 'POST') {
    try {
      const output = execSync(`"${path.join(PKG_ROOT, 'bin', 'agy-vibe')}" verify "${PKG_ROOT}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, output }));
    } catch (e) {
      const output = (e.stdout || '') + '\n' + (e.stderr || '');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, output }));
    }
    return;
  }

  // Serve Main Dashboard Page
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderHTML());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

// Start Server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Antigravity Vibe Monitor rodando em: http://localhost:${PORT}`);
  console.log(`   (Pressione Ctrl+C para encerrar)\n`);
});
