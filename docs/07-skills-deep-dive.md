# Guia Aprofundado das 8 Skills do Antigravity

Este documento detalha o propósito, funcionamento interno, comandos de ativação e casos de uso de cada uma das 8 skills incluídas no **Antigravity Vibe Toolkit**.

---

## 1. `evidence-first` (O Selo de Garantia)

### O que é?
É a skill responsável por garantir que o agente de IA nunca encerre uma tarefa com um simples "fiz as alterações". Ela obriga o agente a comprovar que o código compila, passa nos testes e não introduziu regressões.

### Como o Antigravity ativa?
- **Gatilho automático**: Sempre que você pedir para implementar uma feature, corrigir um bug ou refatorar algo e disser *"teste antes de me avisar"*, *"mostre as evidências"* ou *"verifique se está tudo pronto"*.
- **Comando explícito no chat**: *"Rode a skill evidence-first neste projeto"*.

### O que acontece por baixo dos panos?
1. O agente abre uma sessão de terminal em background.
2. Roda o comando `agy-vibe verify`.
3. Captura os códigos de saída (`exit code 0` ou `1`) e as saídas do linter/testes.
4. Gera um relatório formatado em Markdown com a prova da execução anexada na resposta final.

---

## 2. `modular-350-refactor` (O Arquiteto de Código Limpo)

### O que é?
Impede a criação de "arquivos monólitos" (arquivos de 500 a 1.500 linhas que misturam banco de dados, regras de negócio e interface visual). Arquivos longos confundem as IAs e geram bugs frequentes.

### Como o Antigravity ativa?
- **Gatilho automático**: Quando você pede: *"Esse arquivo está muito grande, divida ele"* ou *"Refatore para manter os arquivos curtos"*.
- **Comando explícito**: *"Use a skill modular-350-refactor para refatorar src/pages/Dashboard.tsx"*.

### O que acontece por baixo dos panos?
1. O agente executa `agy-vibe sanitize` para listar os arquivos com mais de 350 linhas.
2. Identifica os blocos internos: Tipos/Interfaces, Funções Utilitárias, Regras de Negócio e Componentes Visuais.
3. Cria submódulos coesos em uma pasta dedicada.
4. Aplica o **Facade Pattern** no arquivo original (re-exportando tudo), garantindo que nenhum import no restante do projeto quebre.
5. Roda a verificação de tipos para comprovar que o sistema continua 100% íntegro.

---

## 3. `security-auditor` (O Auditor de Segurança e Privacidade)

### O que é?
Executa uma auditoria completa de segurança em modo **somente-leitura**, sem modificar os arquivos sem autorização.

### Como o Antigravity ativa?
- **Gatilho automático**: *"Faça uma revisão de segurança desse código"*, *"Verifique se tem alguma credencial exposta"*, *"Audite esse pull request"*.
- **Comando explícito**: *"Ative a skill security-auditor no projeto"*.

### O que acontece por baixo dos panos?
1. **Varredura de Segredos**: Procura chaves de API, senhas, tokens JWT e certificados `.pem`/`.key` acidentalmente versionados.
2. **Fronteiras de Confiança**: Verifica se formulários e rotas de API possuem validação com esquemas tipados (ex: Zod, Pydantic).
3. **Injeção de Código**: Garante que não existam queries SQL concatenadas dinamicamente.
4. **Vulnerabilidades de Pacotes**: Executa `npm audit --production` ou `pip-audit`.
5. Emite um **Relatório de Risco Privado** classificando as falhas por severidade (Crítica, Alta, Média, Baixa) com as linhas exatas e sugestões de correção.

---

## 4. `subagent-review` (O Comitê de Revisão com 3 Especialistas)

### O que é?
Em vez de depender da opinião de um único agente geral, essa skill orquestra **3 subagentes especialistas trabalhando ao mesmo tempo** via `invoke_subagent`.

### Como o Antigravity ativa?
- **Gatilho automático**: *"Faça um code review completo com subagentes"*, *"Passe esse código pela banca de revisão"*.
- **Comando explícito**: *"Rode a skill subagent-review"*.

### O que acontece por baixo dos panos?
O Antigravity cria três instâncias paralelas:
* **Subagente 1 (Arquiteto)**: Avalia fronteiras de módulos, limite de 350 linhas e padrões de projeto.
* **Subagente 2 (Segurança)**: Procura vulnerabilidades, sanitização e vazamentos.
* **Subagente 3 (QA & Edge Cases)**: Procura erros de valores nulos/indefinidos, exceções assíncronas não tratadas e falta de testes.

O agente coordenador coleta os 3 relatórios, remove redundâncias e apresenta um resumo executivo para você.

---

## 5. `parallel-waves` (O Gerente de Obras em Ondas Paralelas)

### O que é?
Permite criar funcionalidades completas (Fullstack) usando múltiplos agentes sem que eles editem os mesmos arquivos ao mesmo tempo (o que causaria colisões e perda de código).

### Como o Antigravity ativa?
- **Gatilho automático**: *"Implemente o sistema de pagamentos dividindo em ondas paralelas"*, *"Crie essa funcionalidade usando subagentes sem conflito"*.
- **Comando explícito**: *"Ative parallel-waves para construir a feature X"*.

### O que acontece por baixo dos panos?
Organiza o desenvolvimento em ondas estritas:
* **Onda 1 (Fundação)**: Cria os contratos, esquemas do banco e tipos TypeScript compartilhados. O coordenador valida a compilação antes de prosseguir.
* **Onda 2 (Execução Paralela)**:
  - *Agente A*: Programa as rotas de backend em `src/server/` ou `src/api/`.
  - *Agente B*: Programa as telas de frontend em `src/components/` ou `src/app/`.
  *(Cada agente possui permissão exclusiva sobre sua respectiva pasta).*
* **Onda 3 (Integração & Qualidade)**: O coordenador reúne tudo e roda os Quality Gates.

---

## 6. `context7-docs` (O Pesquisador de Documentação Atualizada)

### O que é?
Elimina o problema crônico de IAs alucinarem sintaxes de versões antigas de frameworks (ex: misturar sintaxe de Next.js Pages Router com App Router, ou usar versões defasadas do Tailwind/Drizzle).

### Como o Antigravity ativa?
- **Gatilho automático**: *"Como que faz isso na versão atual do Drizzle?"*, *"Consulte a documentação do Next 15 antes de implementar"*.
- **Comando explícito**: *"Use context7-docs para pesquisar a API da biblioteca X"*.

### O que acontece por baixo dos panos?
1. O agente lê o `package.json` para saber a versão exata instalada no seu projeto.
2. Faz uma busca direcionada na documentação oficial ou via servidor Context7 MCP.
3. Garante que os exemplos de código importados correspondam exatamente à versão em uso.

---

## 7. `chrome-devtools` (O Testador de Interface no Navegador)

### O que é?
Conecta o Antigravity diretamente ao navegador Google Chrome via MCP (Puppeteer/DevTools) para testar a aplicação visualmente.

### Como o Antigravity ativa?
- **Gatilho automático**: *"Abra o site no navegador e veja se tem algum erro no console"*, *"Teste se a tela de login está com erro de hydration"*.
- **Comando explícito**: *"Ative chrome-devtools para inspecionar localhost:3000"*.

### O que acontece por baixo dos panos?
1. O agente abre a URL local no Chrome em segundo plano.
2. Lê a aba de **Console** à procura de advertências ou erros JavaScript.
3. Inspeciona a aba de **Rede (Network)** para identificar chamadas de API que retornaram erro (404, 500).
4. Verifica acessibilidade e responsividade da interface.

---

## 8. `project-bootstrap` (O Criador Instantâneo de Projetos Profissionais)

### O que é?
Permite criar um projeto novo completo a partir de apenas 2 linhas de prompt em linguagem natural.

### Como o Antigravity ativa?
- **Gatilho automático**: *"Crie um projeto do zero para uma loja virtual"*, *"Inicie um projeto Next.js com essa ideia: [descrição]"*.
- **Comando explícito**: *"Execute project-bootstrap neste diretório"*.

### O que acontece por baixo dos panos?
1. Inicializa o manifesto canônico (`PRODUCT.md`, `AGENTS.md`, `GEMINI.md`, `docs/`).
2. Configura a stack escolhida (Next.js, TypeScript, Tailwind, ESLint, Vitest, ou Python).
3. Roda a primeira validação de qualidade (`agy-vibe verify`) para provar que a base nasceu 100% funcional.
