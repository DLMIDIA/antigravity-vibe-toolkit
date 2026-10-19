#!/usr/bin/env node

/**
 * Antigravity Vibe Monitor & Live Companion Server
 * Local web server tracking token economy, modular health, project compliance,
 * Obsidian-style memory vault, Multi-Model Telemetry, and Active Project Observability.
 *
 * Runs locally on port 4242 (or process.env.PORT) and inside Docker.
 * Supports Full Mission Control view and Compact Side-by-Side (Docked) Companion mode.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

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

  const modelStats = {};
  const recentActions = [];
  let currentObjective = 'Otimizar código, modularização 350 linhas e telemetria ao vivo.';
  const detectedWorkspaces = new Set();

  if (latestConv && fs.existsSync(latestConv.path)) {
    try {
      const content = fs.readFileSync(latestConv.path, 'utf8');
      const lines = content.trim().split('\n');
      totalSteps = lines.length;

      let currentStepModel = 'Gemini 3.8 Flash (High)';

      for (const line of lines) {
        try {
          const d = JSON.parse(line);

          // Track dynamic model switches
          if (d.type === 'USER_INPUT' && d.content && typeof d.content === 'string' && d.content.includes('Model Selection` from')) {
            const m = d.content.match(/Model Selection\` from .*? to (.*?)\.\s*No need/);
            if (m && m[1]) {
              currentStepModel = m[1].trim();
              activeModel = currentStepModel;
            }
          }

          // Track latest user instruction (Current Objective)
          if (d.type === 'USER_INPUT' && d.source === 'USER_EXPLICIT' && d.content) {
            const cleanPrompt = d.content.replace(/<[^>]+>/g, '').trim();
            if (cleanPrompt.length > 0) {
              currentObjective = cleanPrompt.length > 220 ? cleanPrompt.slice(0, 220) + '...' : cleanPrompt;
            }
          }

          // Extract workspace URIs from session
          if (d.workspaceUris && Array.isArray(d.workspaceUris)) {
            for (const u of d.workspaceUris) {
              if (u.startsWith('file://')) {
                const p = decodeURIComponent(u.replace('file://', ''));
                if (fs.existsSync(p) && fs.statSync(p).isDirectory() && p !== HOME && p !== DESKTOP) {
                  detectedWorkspaces.add(p);
                }
              }
            }
          }

          // Track working directories in tool calls
          if (d.tool_calls && Array.isArray(d.tool_calls)) {
            for (const tc of d.tool_calls) {
              if (tc.args && tc.args.Cwd) {
                const cleanCwd = (tc.args.Cwd || '').replace(/^"|"$/g, '').trim();
                if (cleanCwd && fs.existsSync(cleanCwd) && fs.statSync(cleanCwd).isDirectory() && cleanCwd !== HOME && cleanCwd !== DESKTOP) {
                  detectedWorkspaces.add(cleanCwd);
                }
              }
              if (tc.args && (tc.args.toolSummary || tc.args.toolAction)) {
                recentActions.push({
                  tool: tc.name,
                  summary: (tc.args.toolSummary || '').replace(/^"|"$/g, ''),
                  action: (tc.args.toolAction || '').replace(/^"|"$/g, ''),
                  step: d.step_index
                });
              }
            }
          }

          // Accumulate tokens per model
          if (d.input_tokens !== undefined) {
            inputTokens += d.input_tokens;
            cacheReadTokens += (d.cache_read_tokens || 0);
            outputTokens += (d.output_tokens || 0);
            contextTokens = d.input_tokens + (d.cache_read_tokens || 0);

            if (!modelStats[currentStepModel]) {
              modelStats[currentStepModel] = { steps: 0, inputTokens: 0, cacheReadTokens: 0, outputTokens: 0 };
            }
            modelStats[currentStepModel].steps++;
            modelStats[currentStepModel].inputTokens += d.input_tokens;
            modelStats[currentStepModel].cacheReadTokens += (d.cache_read_tokens || 0);
            modelStats[currentStepModel].outputTokens += (d.output_tokens || 0);
          }
        } catch (err) {}
      }
    } catch (e) {}
  }

  // Model breakdown analysis & cost comparison
  const totalModelSteps = Object.values(modelStats).reduce((acc, m) => acc + m.steps, 0) || 1;
  let totalCostEstimated = 0;
  let totalCostIfAllPro = 0;

  const modelsBreakdown = Object.entries(modelStats).map(([name, s]) => {
    const isFlash = name.toLowerCase().includes('flash');
    const costIn = (s.inputTokens / 1000000) * (isFlash ? 0.075 : 1.25);
    const costOut = (s.outputTokens / 1000000) * (isFlash ? 0.30 : 5.00);
    const costCache = (s.cacheReadTokens / 1000000) * (isFlash ? 0.01875 : 0.3125);
    const costEst = costIn + costOut + costCache;

    const costIfPro = (s.inputTokens / 1000000) * 1.25 + (s.outputTokens / 1000000) * 5.00 + (s.cacheReadTokens / 1000000) * 0.3125;
    const savings = Math.max(0, costIfPro - costEst);

    totalCostEstimated += costEst;
    totalCostIfAllPro += costIfPro;

    return {
      name,
      steps: s.steps,
      stepsPct: parseFloat(((s.steps / totalModelSteps) * 100).toFixed(1)),
      inputTokens: s.inputTokens,
      cacheReadTokens: s.cacheReadTokens,
      outputTokens: s.outputTokens,
      totalTokens: s.inputTokens + s.cacheReadTokens + s.outputTokens,
      costEstimated: '$' + costEst.toFixed(3),
      costIfPro: '$' + costIfPro.toFixed(3),
      savings: '$' + savings.toFixed(3),
      isFlash
    };
  });

  const totalHybridSavings = Math.max(0, totalCostIfAllPro - totalCostEstimated);

  // Context Satiation Analysis
  const contextPctNum = parseFloat(((contextTokens / contextLimit) * 100).toFixed(1));
  const remainingTokens = Math.max(0, contextLimit - contextTokens);

  let alertLevel = 'NORMAL';
  let alertMessage = 'Contexto Saudável: Ampla capacidade livre para raciocínio e execução.';
  let alertColor = '#10b981';

  if (contextPctNum >= 80) {
    alertLevel = 'CRITICAL';
    alertMessage = '⚠️ ALERTA DE CONTEXTO (>80%): Janela quase cheia! Use /compact no chat para resumir e liberar tokens.';
    alertColor = '#ef4444';
  } else if (contextPctNum >= 60) {
    alertLevel = 'WARNING';
    alertMessage = 'Atenção ao Contexto (>60%): Janela ficando densa. Considere usar /compact em breve.';
    alertColor = '#f59e0b';
  }

  // Determine primary active project
  const activeWorkspacesList = Array.from(detectedWorkspaces);
  let activeProjectPath = activeWorkspacesList[0] || PKG_ROOT;
  // If gerador-contratos-pesca exists in detected, prioritize user's active client workspace
  for (const wp of activeWorkspacesList) {
    if (wp.includes('gerador-contratos-pesca')) {
      activeProjectPath = wp;
      break;
    }
  }

  const activeProjectSummary = createProjectSummary(path.basename(activeProjectPath), activeProjectPath);

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
    cacheSavingsMultiplier: cacheReadTokens > 0 ? (cacheReadTokens / Math.max(1, inputTokens)).toFixed(1) : '1.0',
    totalHybridSavings: '$' + totalHybridSavings.toFixed(2),
    modelsBreakdown,
    activeProject: {
      name: path.basename(activeProjectPath),
      path: activeProjectPath,
      objective: currentObjective,
      stats: activeProjectSummary,
    },
    recentActions: recentActions.slice(-8).reverse(),
    quotas: {
      activeModel,
      contextPct: contextPctNum,
      tpmAllowance: activeModel.toLowerCase().includes('flash') ? '4.000.000 TPM (Flash Tier)' : '1.000.000 TPM (Pro Tier)',
      tpmStatus: 'Folga Ampla',
      contextRemainingFmt: remainingTokens.toLocaleString() + ' tokens'
    }
  };
}

// ---------------------------------------------------------------------------
// 2. PROJECT AUDITING & SCANNING (Safe & Fast)
// ---------------------------------------------------------------------------
function scanProjectFiles(dir, maxLines = 350) {
  const ignore = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'brain', '__pycache__', '.venv', 'backup', 'backups', 'vendor']);
  const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.php', '.vue', '.html', '.css']);
  let totalFiles = 0;
  let compliantFiles = 0;
  let totalLines = 0;
  const oversized = [];

  function walk(current, depth = 0) {
    if (depth > 5) return;
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
        walk(full, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (exts.has(ext)) {
          try {
            const st = fs.statSync(full);
            if (st.size > 450000) continue; // Skip large files / assets
            totalFiles++;
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

  walk(dir, 0);
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

function createProjectSummary(name, pPath) {
  const compliance = getProjectCompliance(pPath);
  const { totalFiles, compliantFiles, totalLines, oversized } = scanProjectFiles(pPath);

  const baselineTokensPerFile = 2200;
  const optimizedTokensPerFile = 750;
  const tokensSaved = compliantFiles * (baselineTokensPerFile - optimizedTokensPerFile);
  const estimatedCostSaved = (tokensSaved / 1000000) * 1.5;

  return {
    name,
    path: pPath,
    complianceScore: compliance,
    totalFiles,
    compliantFiles,
    oversizedFiles: oversized.length,
    oversizedList: oversized.slice(0, 5),
    totalLines,
    tokensSaved,
    estimatedCostSaved: estimatedCostSaved.toFixed(3),
    isCompliant: compliance >= 6 && oversized.length === 0,
  };
}

function discoverProjects() {
  const projects = [];
  const visited = new Set();

  // 1. Toolkit repository
  const toolkitPath = PKG_ROOT;
  visited.add(toolkitPath);
  projects.push(createProjectSummary('antigravity-vibe-toolkit', toolkitPath));

  // 2. Discover from live Antigravity sessions
  const brainDir = path.join(HOME, '.gemini', 'antigravity', 'brain');
  if (fs.existsSync(brainDir)) {
    try {
      const dirs = fs.readdirSync(brainDir);
      for (const d of dirs) {
        const tPath = path.join(brainDir, d, '.system_generated', 'logs', 'transcript.jsonl');
        if (fs.existsSync(tPath)) {
          try {
            const raw = fs.readFileSync(tPath, 'utf8');
            const matches = raw.match(/file:\/\/[^"\\\s]+/g) || [];
            for (const m of matches) {
              const decoded = decodeURIComponent(m.replace('file://', ''));
              if (fs.existsSync(decoded) && fs.statSync(decoded).isDirectory() && decoded !== HOME && decoded !== DESKTOP && !visited.has(decoded)) {
                visited.add(decoded);
                projects.push(createProjectSummary(path.basename(decoded), decoded));
              }
            }
          } catch(e) {}
        }
      }
    } catch(e) {}
  }

  // 3. Search directory roots
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
// 3. FRONTEND SINGLE PAGE APPLICATION (Full & Side-by-Side Companion)
// ---------------------------------------------------------------------------
function renderHTML() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Antigravity Vibe Monitor & Live Companion</title>
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
      transition: all 0.3s ease;
    }
    header {
      background: linear-gradient(180deg, #131c2e 0%, rgba(19, 28, 46, 0.6) 100%);
      border-bottom: 1px solid var(--card-border);
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      backdrop-filter: blur(12px);
      z-index: 50;
    }
    .logo-box { display: flex; align-items: center; gap: 12px; }
    .logo-core {
      width: 38px; height: 38px; border-radius: 10px;
      background: linear-gradient(135deg, var(--cyan), var(--purple));
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 20px; color: #fff;
      box-shadow: 0 0 16px rgba(6, 182, 212, 0.4);
    }
    .logo-title h1 { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
    .logo-title p { font-size: 11px; color: var(--text-dim); }

    .header-actions { display: flex; align-items: center; gap: 10px; }
    .nav-tabs { display: flex; gap: 6px; }
    .tab-btn {
      background: transparent; border: 1px solid transparent; color: var(--text-dim);
      padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600;
      transition: all 0.2s;
    }
    .tab-btn:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .tab-btn.active {
      color: #fff; background: #1e293b; border-color: var(--cyan);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
    }

    .btn-mode-toggle {
      background: rgba(139, 92, 246, 0.15); border: 1px solid var(--purple); color: #c084fc;
      padding: 6px 12px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 700;
      display: flex; align-items: center; gap: 6px; transition: all 0.2s;
    }
    .btn-mode-toggle:hover { background: rgba(139, 92, 246, 0.25); color: #fff; }

    .container { max-width: 1240px; margin: 24px auto; padding: 0 20px; transition: all 0.3s ease; }

    /* Telemetry Card */
    .telemetry-card {
      background: linear-gradient(135deg, #131c2e 0%, #0d1527 100%);
      border: 1px solid #2b3954; border-radius: 16px;
      padding: 22px; margin-bottom: 24px; position: relative; overflow: hidden;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
    }
    .telemetry-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
    }
    .telemetry-model-box { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .model-badge {
      background: rgba(6, 182, 212, 0.15); border: 1px solid var(--cyan);
      color: #38bdf8; padding: 5px 12px; border-radius: 999px;
      font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;
    }
    .project-badge {
      background: rgba(16, 185, 129, 0.15); border: 1px solid var(--emerald);
      color: #34d399; padding: 5px 12px; border-radius: 999px;
      font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px;
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
      padding: 10px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
      display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px;
    }
    .btn-quick-compact {
      background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: #fff;
      padding: 3px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; text-decoration: none; font-weight: 700;
    }
    .btn-quick-compact:hover { background: rgba(255,255,255,0.25); }

    /* Progress bar */
    .progress-track {
      width: 100%; height: 12px; background: #0b0f19; border-radius: 999px;
      overflow: hidden; margin: 8px 0; border: 1px solid #1f293d;
    }
    .progress-fill {
      height: 100%; width: 0%; border-radius: 999px;
      background: linear-gradient(90deg, var(--cyan), var(--purple));
      transition: width 0.5s ease-in-out;
    }

    .telemetry-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px; margin-top: 18px;
    }
    .telemetry-stat {
      background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px; padding: 12px; text-align: left;
    }
    .telemetry-stat-label { font-size: 11px; color: var(--text-dim); text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
    .telemetry-stat-val { font-size: 18px; font-weight: 800; color: #fff; }

    /* Model Breakdown & Quota Stack */
    .model-breakdown-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 18px; margin-bottom: 24px;
    }
    .model-bar-stack {
      display: flex; height: 14px; border-radius: 999px; overflow: hidden; margin: 12px 0; background: #0b0f19;
    }
    .model-bar-segment { height: 100%; transition: width 0.5s ease; }

    /* Active Project Focus & Live Feed */
    .project-live-feed {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 20px; margin-bottom: 24px;
    }
    .objective-box {
      background: rgba(6, 182, 212, 0.08); border-left: 4px solid var(--cyan);
      padding: 12px 16px; border-radius: 0 10px 10px 0; margin: 12px 0 18px 0;
      font-size: 13px; color: #e2e8f0; line-height: 1.5;
    }
    .action-timeline { display: flex; flex-direction: column; gap: 8px; }
    .action-row {
      display: flex; align-items: center; justify-content: space-between;
      background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
      padding: 8px 12px; border-radius: 8px; font-size: 12px;
    }
    .action-left { display: flex; align-items: center; gap: 10px; }
    .tool-badge {
      font-family: monospace; font-size: 10px; padding: 2px 6px; border-radius: 4px;
      background: rgba(139, 92, 246, 0.2); color: #c084fc; font-weight: 700;
    }

    /* Metric Cards */
    .grid-metrics {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 18px; margin-bottom: 28px;
    }
    .metric-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 20px; position: relative; overflow: hidden;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    .metric-card::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 3px; }
    .metric-cyan::before { background: var(--cyan); }
    .metric-emerald::before { background: var(--emerald); }
    .metric-purple::before { background: var(--purple); }
    .metric-amber::before { background: var(--amber); }

    .metric-label { font-size: 11px; font-weight: 600; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px; }
    .metric-val { font-size: 26px; font-weight: 800; color: #fff; }
    .metric-desc { font-size: 12px; color: var(--text-dim); margin-top: 4px; }

    /* Sections & Tables */
    .tab-content { display: none; }
    .tab-content.active { display: block; }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
    
    .card-table {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th {
      background: #162032; padding: 12px 16px; font-size: 11px;
      font-weight: 700; color: var(--text-dim); text-transform: uppercase;
      border-bottom: 1px solid var(--card-border);
    }
    td { padding: 14px 16px; border-bottom: 1px solid var(--card-border); font-size: 13px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(255,255,255,0.02); }

    .badge {
      display: inline-block; padding: 3px 8px; border-radius: 999px;
      font-size: 10px; font-weight: 700; text-transform: uppercase;
    }
    .badge-pass { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
    .badge-warn { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

    /* Skills Grid */
    .skills-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }
    .skill-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; overflow: hidden; display: flex; flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .skill-card:hover { transform: translateY(-3px); border-color: var(--cyan); }
    .skill-thumb {
      width: 100%; height: 130px; background: #0b0f19;
      display: flex; align-items: center; justify-content: center;
      position: relative; overflow: hidden;
    }
    .skill-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .skill-info { padding: 16px; flex: 1; display: flex; flex-direction: column; }
    .skill-info h3 { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .skill-info p { font-size: 12px; color: var(--text-dim); line-height: 1.4; flex: 1; }

    /* Memory Vault */
    .vault-layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; min-height: 500px; }
    .vault-sidebar {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 14px;
    }
    .vault-item {
      padding: 10px 12px; border-radius: 8px; cursor: pointer; font-size: 13px;
      color: var(--text-dim); margin-bottom: 4px; transition: all 0.2s;
    }
    .vault-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
    .vault-item.active { background: #1e293b; color: var(--cyan); font-weight: 600; border: 1px solid rgba(6, 182, 212, 0.3); }
    .vault-content {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 14px; padding: 24px; overflow-y: auto; max-height: 700px;
    }
    .markdown-body { font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .markdown-body h1 { color: #fff; border-bottom: 1px solid var(--card-border); padding-bottom: 8px; margin-bottom: 16px; font-size: 20px; }
    .markdown-body pre { background: #0b0f19; padding: 14px; border-radius: 8px; overflow-x: auto; font-family: monospace; margin: 14px 0; border: 1px solid var(--card-border); }

    /* ------------------------------------------------------------- */
    /* DOCKED / SIDE-BY-SIDE COMPANION MODE STYLES                   */
    /* ------------------------------------------------------------- */
    body.mode-docked {
      background-color: #0b0f19;
      padding-bottom: 30px;
    }
    body.mode-docked header {
      padding: 10px 14px;
    }
    body.mode-docked .logo-title p,
    body.mode-docked .nav-tabs {
      display: none;
    }
    body.mode-docked .container {
      max-width: 480px;
      margin: 12px auto;
      padding: 0 10px;
    }
    body.mode-docked .telemetry-card {
      padding: 14px;
      margin-bottom: 14px;
      border-radius: 12px;
    }
    body.mode-docked .telemetry-grid {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    body.mode-docked .telemetry-stat {
      padding: 8px;
    }
    body.mode-docked .telemetry-stat-val {
      font-size: 15px;
    }
    body.mode-docked .grid-metrics {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 14px;
    }
    body.mode-docked .metric-card {
      padding: 12px;
    }
    body.mode-docked .metric-val {
      font-size: 20px;
    }
    body.mode-docked .full-only {
      display: none !important;
    }
  </style>
</head>
<body>

  <!-- HEADER -->
  <header>
    <div class="logo-box">
      <div class="logo-core">⚛</div>
      <div class="logo-title">
        <h1>Antigravity Vibe Monitor</h1>
        <p>Live Telemetry, Token Economy &amp; Multi-Model Companion</p>
      </div>
    </div>

    <div class="header-actions">
      <nav class="nav-tabs">
        <button class="tab-btn active" onclick="switchTab('overview')">Visão Geral</button>
        <button class="tab-btn" onclick="switchTab('models')">Modelos &amp; Cotas</button>
        <button class="tab-btn" onclick="switchTab('projects')">Projetos</button>
        <button class="tab-btn" onclick="switchTab('memory')">Memória Vault</button>
        <button class="tab-btn" onclick="switchTab('skills')">Skills (8)</button>
      </nav>
      <button class="btn-mode-toggle" id="btn-toggle-mode" onclick="toggleLayoutMode()" title="Alternar entre modo tela cheia e painel lateral docked">
        <span>🖥️</span> <span id="mode-label">Modo Lateral</span>
      </button>
    </div>
  </header>

  <div class="container">

    <!-- 1. LIVE TELEMETRY BANNER -->
    <div class="telemetry-card">
      <div class="telemetry-header">
        <div class="telemetry-model-box">
          <div class="model-badge">
            <span class="pulse-dot"></span>
            <span id="telemetry-model">🤖 Carregando modelo...</span>
          </div>
          <div class="project-badge">
            <span>📁</span>
            <span id="telemetry-project">Carregando projeto...</span>
          </div>
        </div>
        <div id="telemetry-conv-id" style="font-family:monospace; font-size:11px; color:var(--text-dim);"></div>
      </div>

      <!-- Satiation Alert Box -->
      <div id="telemetry-alert-box" class="alert-banner" style="background: rgba(16, 185, 129, 0.12); color:#34d399; border:1px solid rgba(16, 185, 129, 0.3);">
        <span id="telemetry-alert-text">Monitorando consumo de contexto...</span>
        <button class="btn-quick-compact" onclick="copyCompactCmd()">Copiar /compact</button>
      </div>

      <!-- Context Progress Bar -->
      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-dim);">
        <span>Saturação da Janela de Contexto (1M Tokens)</span>
        <span id="telemetry-pct-label" style="font-weight:800; color:#fff;">0%</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" id="telemetry-progress-fill"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-dim); margin-top:2px;">
        <span id="telemetry-context-stats">0 / 1.000.000 tokens</span>
        <span id="telemetry-quota-tpm">TPM Status: Alta Folga</span>
      </div>

      <!-- Telemetry Stats Grid -->
      <div class="telemetry-grid">
        <div class="telemetry-stat">
          <div class="telemetry-stat-label">Tokens em Cache</div>
          <div class="telemetry-stat-val" id="telemetry-cache" style="color:#38bdf8;">0</div>
        </div>
        <div class="telemetry-stat">
          <div class="telemetry-stat-label">Economia Roteamento</div>
          <div class="telemetry-stat-val" id="telemetry-hybrid-savings" style="color:#34d399;">$0.00</div>
        </div>
        <div class="telemetry-stat">
          <div class="telemetry-stat-label">Multiplicador Cache</div>
          <div class="telemetry-stat-val" id="telemetry-multiplier" style="color:#c084fc;">1.0x</div>
        </div>
        <div class="telemetry-stat">
          <div class="telemetry-stat-label">Passos da Sessão</div>
          <div class="telemetry-stat-val" id="telemetry-steps" style="color:#f59e0b;">0</div>
        </div>
      </div>
    </div>

    <!-- 2. ACTIVE PROJECT & LIVE ACTIVITY STREAM -->
    <div class="project-live-feed">
      <div class="section-title">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>🎯</span>
          <span>Projeto Ativo &amp; Atividade do Agente em Tempo Real</span>
        </div>
        <span id="feed-project-name" class="badge badge-pass" style="font-size:11px;">Carregando...</span>
      </div>

      <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Objetivo Atual Sendo Resolvido:</div>
      <div class="objective-box" id="agent-current-objective">
        Aguardando instruções...
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-size:11px; color:var(--text-dim); text-transform:uppercase; font-weight:700;">Últimas Ações do Agente neste Projeto:</div>
        <button onclick="runQualityGate()" style="background:rgba(6,182,212,0.15); border:1px solid var(--cyan); color:#38bdf8; font-size:11px; padding:3px 10px; border-radius:6px; cursor:pointer; font-weight:700;">⚡ Rodar Quality Gate</button>
      </div>
      <div class="action-timeline" id="agent-recent-actions">
        <!-- Injected dynamically -->
      </div>
    </div>

    <!-- 3. MODEL BREAKDOWN & QUOTA USAGE CARD -->
    <div class="model-breakdown-card">
      <div class="section-title">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>⚖️</span>
          <span>Distribuição dos Modelos Utilizados (Flash vs Pro / 4.0)</span>
        </div>
        <span style="font-size:12px; color:var(--emerald); font-weight:700;" id="model-savings-badge">Economia Inteligente Ativa</span>
      </div>

      <div class="model-bar-stack" id="model-progress-stack">
        <!-- Injected dynamically -->
      </div>

      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-dim); margin-bottom:14px;" id="model-legend">
        <!-- Legend injected dynamically -->
      </div>

      <div class="card-table full-only">
        <table>
          <thead>
            <tr>
              <th>Modelo</th>
              <th>Passos</th>
              <th>% Uso</th>
              <th>Tokens Input</th>
              <th>Tokens Cache</th>
              <th>Custo Real</th>
              <th>Custo se Pro</th>
              <th>Economia ($)</th>
            </tr>
          </thead>
          <tbody id="models-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- 4. GENERAL METRICS (FULL ONLY) -->
    <div class="grid-metrics full-only">
      <div class="metric-card metric-cyan">
        <div class="metric-label">Economia por Modularidade</div>
        <div class="metric-val" id="metric-tokens">0 tokens</div>
        <div class="metric-desc">Poupados pela regra dos 350 linhas nos projetos</div>
      </div>
      <div class="metric-card metric-emerald">
        <div class="metric-label">Arquivos Aderentes (≤350L)</div>
        <div class="metric-val" id="metric-modular">0 / 0</div>
        <div class="metric-desc">Conformidade com a arquitetura leve</div>
      </div>
      <div class="metric-card metric-purple">
        <div class="metric-label">Economia Financeira Total</div>
        <div class="metric-val" id="metric-cost">$0.00</div>
        <div class="metric-desc">Cache reaproveitado + modularidade</div>
      </div>
      <div class="metric-card metric-amber">
        <div class="metric-label">Skills Nativas Antigravity</div>
        <div class="metric-val" id="metric-skills">8</div>
        <div class="metric-desc">Instaladas e ativas globalmente no Mac</div>
      </div>
    </div>

    <!-- TAB 1: OVERVIEW -->
    <div id="tab-overview" class="tab-content active full-only">
      <div class="section-title">
        <span>Visão Geral dos Projetos Auditados</span>
      </div>
      <div class="card-table">
        <table>
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Arquivos Totais</th>
              <th>≤ 350 Linhas</th>
              <th>Acima do Limite</th>
              <th>Tokens Economizados</th>
              <th>Economia Estimada</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="overview-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: MODELS & QUOTAS -->
    <div id="tab-models" class="tab-content full-only">
      <div class="section-title">
        <span>Inteligência de Modelos, Cotas e Roteamento Híbrido</span>
      </div>
      <div class="card-table">
        <div style="padding: 20px; font-size: 13px; color: var(--text-dim); line-height: 1.6;">
          <p><strong>Por que alternar entre Flash e Pro/4?</strong></p>
          <p style="margin-top:6px;">Tarefas repetitivas de análise de código, execução de testes e comandos consomem muito contexto. O <code>Gemini 3.8 Flash</code> é até <strong>16x mais econômico</strong> que o <code>Gemini 3.8 Pro</code> ou <code>Gemini 4</code> e possui uma janela de 1 milhão de tokens idêntica com latência ultrarrápida. Use o Flash para fluxos de desenvolvimento contínuo e suba para o Pro/4 quando precisar de raciocínio profundo de arquitetura.</p>
        </div>
      </div>
    </div>

    <!-- TAB 3: PROJECTS -->
    <div id="tab-projects" class="tab-content full-only">
      <div class="section-title">
        <span>Detalhamento dos Projetos</span>
      </div>
      <div class="card-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Caminho</th>
              <th>Linhas Totais</th>
              <th>Arquivos Críticos (>350L)</th>
              <th>Conformidade</th>
            </tr>
          </thead>
          <tbody id="projects-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 4: MEMORY VAULT -->
    <div id="tab-memory" class="tab-content full-only">
      <div class="section-title">
        <span>Base de Decisões e Governança (.agents / docs)</span>
      </div>
      <div class="vault-layout">
        <div class="vault-sidebar" id="memory-list">
          <!-- Note links -->
        </div>
        <div class="vault-content">
          <div id="vault-doc-title" style="font-weight:700; font-size:16px; margin-bottom:12px; color:var(--cyan);"></div>
          <div class="markdown-body" id="vault-doc-body">
            Selecione um documento ao lado para ler.
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 5: SKILLS -->
    <div id="tab-skills" class="tab-content full-only">
      <div class="section-title">
        <span>Catálogo Visual das 8 Skills Nativas do Antigravity</span>
      </div>
      <div class="skills-grid" id="skills-grid">
        <!-- Skill cards -->
      </div>
    </div>

  </div>

  <script>
    let currentTab = 'overview';
    let vaultNotes = [];
    let isDockedMode = localStorage.getItem('antigravity_monitor_mode') === 'docked' || window.location.search.includes('mode=docked');

    if (isDockedMode) {
      document.body.classList.add('mode-docked');
      document.getElementById('mode-label').innerText = 'Modo Completo';
    }

    function toggleLayoutMode() {
      isDockedMode = !isDockedMode;
      if (isDockedMode) {
        document.body.classList.add('mode-docked');
        document.getElementById('mode-label').innerText = 'Modo Completo';
        localStorage.setItem('antigravity_monitor_mode', 'docked');
      } else {
        document.body.classList.remove('mode-docked');
        document.getElementById('mode-label').innerText = 'Modo Lateral';
        localStorage.setItem('antigravity_monitor_mode', 'full');
      }
    }

    function switchTab(tabId) {
      currentTab = tabId;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      const targetBtn = Array.from(document.querySelectorAll('.tab-btn')).find(b => b.getAttribute('onclick') && b.getAttribute('onclick').includes(tabId));
      if (targetBtn) targetBtn.classList.add('active');

      const el = document.getElementById('tab-' + tabId);
      if (el) el.classList.add('active');
    }

    function copyCompactCmd() {
      navigator.clipboard.writeText('/compact');
      const btn = document.querySelector('.btn-quick-compact');
      const originalText = btn.innerText;
      btn.innerText = 'Copiado!';
      setTimeout(() => { btn.innerText = originalText; }, 2000);
    }

    async function runQualityGate() {
      const btn = event.target;
      btn.innerText = 'Verificando...';
      try {
        const res = await fetch('/api/verify', { method: 'POST' }).then(r => r.json());
        alert(res.success ? '✅ Quality Gate Aprovado com sucesso!' : '⚠️ Avisos encontrados no Quality Gate:\n\n' + res.output.slice(0, 300));
      } catch (e) {
        alert('Erro ao disparar verificação: ' + e.message);
      } finally {
        btn.innerText = '⚡ Rodar Quality Gate';
      }
    }

    function selectNote(index) {
      document.querySelectorAll('.vault-item').forEach((el, i) => {
        el.classList.toggle('active', i === index);
      });
      const note = vaultNotes[index];
      if (note) {
        document.getElementById('vault-doc-title').innerText = note.title;
        document.getElementById('vault-doc-body').innerHTML = '<pre>' + escapeHtml(note.content) + '</pre>';
      }
    }

    function escapeHtml(str) {
      return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        document.getElementById('telemetry-project').innerText = liveRes.activeProject ? liveRes.activeProject.name : 'N/A';
        document.getElementById('feed-project-name').innerText = liveRes.activeProject ? liveRes.activeProject.name : 'N/A';
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
        if (liveRes.quotas) {
          document.getElementById('telemetry-quota-tpm').innerText = liveRes.quotas.tpmAllowance;
        }

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
        document.getElementById('telemetry-hybrid-savings').innerText = liveRes.totalHybridSavings || '$0.00';
        document.getElementById('telemetry-multiplier').innerText = (liveRes.cacheSavingsMultiplier || '1.0') + 'x';
        document.getElementById('telemetry-steps').innerText = liveRes.totalSteps;

        // 2. Active Project & Recent Actions
        if (liveRes.activeProject && liveRes.activeProject.objective) {
          document.getElementById('agent-current-objective').innerText = liveRes.activeProject.objective;
        }
        const actionsContainer = document.getElementById('agent-recent-actions');
        actionsContainer.innerHTML = '';
        if (liveRes.recentActions && liveRes.recentActions.length > 0) {
          liveRes.recentActions.forEach(act => {
            const row = document.createElement('div');
            row.className = 'action-row';
            row.innerHTML = \`
              <div class="action-left">
                <span class="tool-badge">\${act.tool}</span>
                <span style="font-weight:600; color:#f3f4f6;">\${act.summary || act.action}</span>
              </div>
              <span style="font-family:monospace; font-size:10px; color:var(--text-dim);">Passo #\${act.step}</span>
            \`;
            actionsContainer.appendChild(row);
          });
        } else {
          actionsContainer.innerHTML = '<div style="font-size:12px; color:var(--text-dim); padding:6px;">Nenhuma ação recente registrada ainda.</div>';
        }

        // 3. Models Breakdown & Distribution Stack
        const stackEl = document.getElementById('model-progress-stack');
        const legendEl = document.getElementById('model-legend');
        const tbModels = document.getElementById('models-table-body');
        stackEl.innerHTML = '';
        legendEl.innerHTML = '';
        tbModels.innerHTML = '';

        if (liveRes.modelsBreakdown && liveRes.modelsBreakdown.length > 0) {
          const colorsList = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b'];
          liveRes.modelsBreakdown.forEach((m, idx) => {
            const segColor = colorsList[idx % colorsList.length];
            
            // Bar segment
            const seg = document.createElement('div');
            seg.className = 'model-bar-segment';
            seg.style.width = m.stepsPct + '%';
            seg.style.background = segColor;
            seg.title = \`\${m.name}: \${m.stepsPct}% (\${m.steps} passos)\`;
            stackEl.appendChild(seg);

            // Legend item
            const legItem = document.createElement('div');
            legItem.innerHTML = \`<span style="color:\${segColor}; font-weight:700;">● \${m.name}:</span> \${m.stepsPct}% (\${m.steps} passos)\`;
            legendEl.appendChild(legItem);

            // Table row
            const tr = document.createElement('tr');
            tr.innerHTML = \`
              <td style="font-weight:700; color:\${segColor};">\${m.name}</td>
              <td>\${m.steps}</td>
              <td>\${m.stepsPct}%</td>
              <td>\${(m.inputTokens || 0).toLocaleString()}</td>
              <td style="color:#38bdf8;">\${(m.cacheReadTokens || 0).toLocaleString()}</td>
              <td style="font-weight:700;">\${m.costEstimated}</td>
              <td style="color:var(--text-dim);">\${m.costIfPro}</td>
              <td style="color:#34d399; font-weight:700;">\${m.savings}</td>
            \`;
            tbModels.appendChild(tr);
          });
        }

        // 4. General Stats
        document.getElementById('metric-tokens').innerText = (statsRes.totalTokensSaved || 0).toLocaleString() + ' tokens';
        document.getElementById('metric-modular').innerText = statsRes.totalCompliantFiles + ' / ' + statsRes.totalFiles;
        document.getElementById('metric-cost').innerText = '$' + (statsRes.totalCostSaved || '0.00');
        document.getElementById('metric-skills').innerText = skillsRes.length;

        // 5. Overview Table
        const tbOverview = document.getElementById('overview-table-body');
        tbOverview.innerHTML = '';
        projectsRes.forEach(p => {
          const row = document.createElement('tr');
          row.innerHTML = \`
            <td style="font-weight: 700; color: #fff;">\${p.name}</td>
            <td>\${p.totalFiles}</td>
            <td style="color: #34d399;">\${p.compliantFiles}</td>
            <td style="color: \${p.oversizedFiles > 0 ? '#f87171' : 'var(--text-dim)'};">\${p.oversizedFiles}</td>
            <td style="font-family: monospace; color: #38bdf8;">\${p.tokensSaved.toLocaleString()}</td>
            <td style="font-weight: 700; color: #34d399;">$\${p.estimatedCostSaved}</td>
            <td>
              <span class="badge \${p.isCompliant ? 'badge-pass' : 'badge-warn'}">
                \${p.isCompliant ? 'Compliant' : 'Needs Review'}
              </span>
            </td>
          \`;
          tbOverview.appendChild(row);
        });

        // 6. Projects Table
        const tbProjects = document.getElementById('projects-table-body');
        tbProjects.innerHTML = '';
        projectsRes.forEach(p => {
          const row = document.createElement('tr');
          row.innerHTML = \`
            <td style="font-weight: 700; color: #fff;">\${p.name}</td>
            <td style="font-family: monospace; font-size: 11px; color: var(--text-dim);">\${p.path}</td>
            <td>\${p.totalLines.toLocaleString()}</td>
            <td style="color: \${p.oversizedFiles > 0 ? '#f87171' : 'var(--text-dim)'};">\${p.oversizedFiles} arquivos</td>
            <td>\${p.complianceScore} / 8 checks</td>
          \`;
          tbProjects.appendChild(row);
        });

        // 7. Memory Notes
        vaultNotes = memoryRes;
        const listEl = document.getElementById('memory-list');
        listEl.innerHTML = '';
        memoryRes.forEach((n, idx) => {
          const item = document.createElement('div');
          item.className = 'vault-item' + (idx === 0 ? ' active' : '');
          item.innerText = n.title;
          item.onclick = () => selectNote(idx);
          listEl.appendChild(item);
        });
        if (memoryRes.length > 0) {
          selectNote(0);
        }

        // 8. Skills
        const skillsEl = document.getElementById('skills-grid');
        skillsEl.innerHTML = '';
        skillsRes.forEach(s => {
          const card = document.createElement('div');
          card.className = 'skill-card';
          const thumbHtml = s.hasImage
            ? \`<img src="\${s.imageUrl}" alt="\${s.name}" loading="lazy">\`
            : \`<div style="font-size: 32px;">⚡</div>\`;

          card.innerHTML = \`
            <div class="skill-thumb">\${thumbHtml}</div>
            <div class="skill-info">
              <h3>\${s.name}</h3>
              <p>\${s.description}</p>
            </div>
          \`;
          skillsEl.appendChild(card);
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
      }
    }

    // Auto refresh every 3 seconds for instant companion telemetry!
    loadAllData();
    setInterval(loadAllData, 3000);
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
  console.log(`\n🚀 Antigravity Vibe Monitor & Live Companion rodando em: http://localhost:${PORT}`);
  console.log(`   (Pressione Ctrl+C para encerrar)\n`);
});
