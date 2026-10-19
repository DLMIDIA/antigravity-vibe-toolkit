# Antigravity Vibe Monitor: Dashboard Local & Docker

O **Antigravity Vibe Monitor** é uma central de comando visual inspirada nas ferramentas analíticas de desenvolvimento assistido por IA (como *Claude Code Analytics, CCFlare e Obsidian Memory Engines*).

---

## 🎯 O que o Monitor Faz?

1. **Economia de Tokens em Tempo Real**:
   Calcula a economia real de tokens e custos financeiros gerada por manter arquivos abaixo do teto de 350 linhas e pelo reuso do cofre de contexto.
2. **Saúde de Todos os seus Projetos no Mac**:
   Varre seus projetos locais, avalia a pontuação de conformidade (Compliance Score de 0 a 8) e o status nos Quality Gates.
3. **Cofre de Memória Estilo Obsidian (Markdown Vault)**:
   Exibe em interface gráfica as notas persistentes de arquitetura (`PRODUCT.md`, `AGENTS.md`, `docs/architecture.md`, etc.), eliminando a necessidade de reexplicar o projeto para a IA toda vez.
4. **Catálogo Visual de Skills**:
   Apresenta todas as 8 skills nativas com ilustrações dedicadas, cabeçalhos YAML e comandos de acionamento.
5. **Quality Gate Runner**:
   Botão interativo que executa `agy-vibe verify` e transmite a saída dos testes em um console estilizado.

---

## 🚀 Como Iniciar o Monitor

### Método 1: Ícone de 1 Clique na Área de Trabalho (Recomendado no Mac)
Basta dar dois cliques no aplicativo **`Antigravity Monitor.app`** localizado diretamente na sua Área de Trabalho:
* Se o servidor não estiver rodando, ele sobe em segundo plano automaticamente.
* Abre o navegador na URL `http://localhost:4242`.

### Método 2: Pelo Terminal via CLI `agy-vibe`
```bash
agy-vibe dashboard
# ou
agy-vibe monitor
```

### Método 3: Via Docker (Container Isolado)
Se você utiliza Docker ou OrbStack:
```bash
# Subir o container em segundo plano
docker compose up -d

# Acessar no navegador
open http://localhost:4242

# Parar o container
docker compose down
```

---

## 🐳 Estrutura Docker
* **`Dockerfile`**: Imagem ultra-leve baseada em `node:20-alpine` (~50MB) com healthcheck integrado.
* **`docker-compose.yml`**: Mapeamento da porta `4242:4242` e montagem de volume para leitura segura dos projetos locais em modo somente-leitura (`:ro`).
