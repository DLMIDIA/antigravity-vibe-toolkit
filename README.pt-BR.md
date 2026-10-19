<p align="center">
  <img src="assets/hero-banner.png" alt="Antigravity Vibe Toolkit — Google Antigravity Edition" width="100%" />
</p>

# Antigravity Vibe Toolkit 🚀

[English](README.md) · **Português (Brasil)**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Google Antigravity Ready](https://img.shields.io/badge/Google%20Antigravity-Native%20Skills-4285F4.svg)](https://deepmind.google)
[![Architecture: Subagents & MCP](https://img.shields.io/badge/Architecture-Subagents%20%26%20MCP-green.svg)](docs/03-subagent-orchestration.md)
[![Quality: Evidence--First](https://img.shields.io/badge/Quality-Evidence--First-orange.svg)](docs/02-evidence-first.md)

**A esteira definitiva de engenharia de software autônoma, orquestração de subagentes e quality gates para o Google Antigravity.**

Inspirado e construído a partir da curadoria original do [vibe-coding-toolkit de Matheus Gomes](https://github.com/soumatheusgomes/vibe-coding-toolkit), este projeto é uma **edição especializada e expandida para o ecossistema do Google Antigravity (Google DeepMind)**. Ele reúne:
* **8 Skills Nativas (`SKILL.md`)** com descoberta progressiva (*Progressive Disclosure*).
* **Esteira Evidence-First**: Nunca aceite "parece pronto" sem prova de compilação, tipos, lint e testes.
* **Orquestração de Subagentes em Ondas Paralelas** com bloqueio de concorrência por arquivo.
* **Utilitário CLI (`agy-vibe`)** de zero dependências para automação e validação no Mac/Linux.

---

## ⚡ Instalação e Início Rápido

<p align="center">
  <img src="assets/installation-flow.svg" alt="Fluxo de Instalação e Ativação" width="100%" />
</p>

### 1. Instalação Global de 1 Clique (Mac / Linux)
Abra o seu terminal na pasta do repositório clonado e execute:
```bash
./scripts/install-global.sh
```

#### O que esse instalador faz por baixo dos panos?
1. **Registra o CLI `agy-vibe`**: Cria um symlink em `~/.local/bin/agy-vibe` (ou `/usr/local/bin/agy-vibe`), tornando o comando acessível em qualquer terminal do seu computador.
2. **Instala as Skills no Antigravity**: Copia todas as 8 skills para o diretório interno do Antigravity em `~/.gemini/antigravity/builtin/skills/`.
3. **Ativação Imediata**: O Google Antigravity reconhece as skills automaticamente em todas as suas sessões e projetos, sem precisar reiniciar o sistema!

### 2. Inicializar a Base em Qualquer Projeto
Entre na raiz de qualquer projeto novo ou existente e rode:
```bash
agy-vibe init .
```
Isso gera a fundação canônica:
* `PRODUCT.md`: Escopo, MVP e critérios de aceite.
* `AGENTS.md` e `GEMINI.md`: Regras de conduta do agente.
* `docs/`: Arquitetura, qualidade, setup e onboarding.
* `.agents/rules/`: Regras de Evidence-First, teto de 350 linhas e subagentes.

### 3. Rodar a Esteira de Qualidade (Evidence-First)
```bash
agy-vibe verify
```
Testa tipos, lint, limite de 350 linhas por arquivo, suites de teste e compilação de produção, gerando um relatório em Markdown com prova de execução!

---

## 🔬 Como Realmente Funciona o Sistema de Skills no Google Antigravity?

<p align="center">
  <img src="assets/skills-architecture.svg" alt="Arquitetura do Sistema de Skills no Antigravity" width="100%" />
</p>

Diferente de sistemas que apenas colam prompts gigantescos no chat, o **Google Antigravity** possui uma arquitetura de extensão elegante baseada em três pilares:

### 1. Progressive Disclosure (Carregamento Sob Demanda)
No início de cada conversa, o Antigravity **NÃO injeta o conteúdo completo das skills** na janela de contexto. Ele lê apenas o cabeçalho YAML (`name` e `description` — cerca de 30 tokens por skill).
* **Zero poluição de contexto**: Mais de 90% da janela de contexto fica 100% livre para o seu código e para o raciocínio do modelo.
* **Ativação Dinâmica**: O agente só carrega o arquivo `SKILL.md` integral se a sua tarefa exigir explicitamente aquele procedimento (ex: *"Audite a segurança desse código"* ativa `security-auditor`).

### 2. Hierarquia de Precedência e Resolução
O Antigravity descobre e prioriza as customizações na seguinte ordem:
1. **`.agents/skills/` (Workspace Local)**: Prioridade máxima. Permite que um projeto específico sobrescreva uma skill com regras próprias do repositório.
2. **`skills.json`**: Registros declarados explicitamente no workspace.
3. **`~/.gemini/antigravity/builtin/skills/` (Global da Máquina)**: Onde o nosso instalador registra as skills para funcionarem em todo o seu Mac.
4. **Skills Nativas do Sistema**: Montadas por nome pelo Antigravity.

### 3. Anatomia de uma Skill no Antigravity
Cada skill dentro de `skills/<nome>/` segue o padrão canônico:
```text
skills/evidence-first/
├── SKILL.md          # Obrigatório: Frontmatter YAML + Instruções passo a passo
├── scripts/          # Opcional: Scripts executáveis (Python, Bash, Node)
├── references/       # Opcional: Manuais detalhados que o agente consulta se precisar
└── examples/         # Opcional: Casos de uso e formatos esperados
```

---

## 🧠 Catálogo de Skills Incluídas

| Skill | Gatilho / Quando o Antigravity Ativa | O que faz na prática |
| :--- | :--- | :--- |
| **[`evidence-first`](skills/evidence-first/SKILL.md)** | Ao concluir qualquer implementação | Roda typecheck, lint, testes e build antes de dar o trabalho por pronto. |
| **[`modular-350-refactor`](skills/modular-350-refactor/SKILL.md)** | Arquivos com mais de 350 linhas | Decompõe o código usando o padrão Facade sem quebrar imports externos. |
| **[`security-auditor`](skills/security-auditor/SKILL.md)** | Revisões de segurança ou PRs | Varre vazamento de secrets (`.env`), injeções e valida fronteiras de dados. |
| **[`subagent-review`](skills/subagent-review/SKILL.md)** | Code review profundo | Dispara 3 subagentes paralelos (Arquiteto, Segurança e QA) via `invoke_subagent`. |
| **[`parallel-waves`](skills/parallel-waves/SKILL.md)** | Novas funcionalidades | Organiza o desenvolvimento em ondas (Banco -> Backend + UI em paralelo -> Testes). |
| **[`context7-docs`](skills/context7-docs/SKILL.md)** | Dúvidas de bibliotecas/APIs | Busca APIs atualizadas de bibliotecas para eliminar código legado alucinado. |
| **[`chrome-devtools`](skills/chrome-devtools/SKILL.md)** | Frontend e UI | Inspeciona erros de console, rede e layout no navegador via MCP. |
| **[`project-bootstrap`](skills/project-bootstrap/SKILL.md)** | Novo projeto do zero | Cria um projeto Next.js/TypeScript/Python completo a partir de 2 linhas de prompt. |

---

## 🛠️ Comandos do Utilitário `agy-vibe`

O binário [`bin/agy-vibe`](bin/agy-vibe) é escrito em Node.js puro, sem `node_modules` adicionais:

```bash
# Inicializa a base do Antigravity no projeto atual
agy-vibe init .

# Executa todos os Quality Gates e gera o relatório de evidência
agy-vibe verify

# Varre todos os arquivos do projeto e alerta os que excedem 350 linhas
agy-vibe sanitize

# Reinstala ou atualiza as skills globais no Antigravity (~/.gemini/antigravity/...)
agy-vibe install-skills

# Checa o status e a pontuação de conformidade do projeto
agy-vibe status
```

---

## 🤝 Créditos e Reconhecimento

Este projeto foi concebido e estruturado por **Daniel Junior Barbosa da Silva** como uma evolução dedicada ao **Google Antigravity**, tendo como base fundamental o trabalho pioneiro de [Matheus Gomes (vibe-coding-toolkit)](https://github.com/soumatheusgomes/vibe-coding-toolkit).

Agradecemos imensamente ao Matheus Gomes por curar a metodologia inicial de Vibe Coding. Nossa edição adapta e expande essa base para a arquitetura nativa de subagentes, discovery de regras e progressive disclosure do Google DeepMind Antigravity.

---

## 📄 Licença

Distribuído sob a [Licença MIT](LICENSE).
