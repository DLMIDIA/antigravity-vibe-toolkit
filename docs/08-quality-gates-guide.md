# O Guia Definitivo dos Quality Gates (`agy-vibe verify`)

Este guia explica exatamente o que são os **Quality Gates**, quem os executa e o que cada uma das validações comprova.

---

## ❓ O que é o "Quality Gate" e o que ele faz?

No desenvolvimento tradicional com IA, é comum o assistente gerar código com pequenos erros de digitação de tipos, imports errados ou quebras de sintaxe que você só descobre quando tenta rodar o projeto.

O **Quality Gate** é uma **esteira automatizada de 5 barreiras de proteção** executada pelo comando:
```bash
agy-vibe verify
```

Ele não apenas executa os checks, mas **emite um relatório formal de evidência (Evidence Report)** comprovando que o código funciona de verdade.

---

## 👤 Eu (usuário) preciso rodar isso manualmente?

**Não, você não é obrigado a rodar nada manualmente!**

Você tem **duas formas** de usar:

### Forma 1: O Agente roda para você (Totalmente Automático)
No chat com o Antigravity, você só precisa dizer:
> *"Implemente a funcionalidade X e rode os quality gates antes de terminar."*  
> ou  
> *"Verifique se o projeto está 100% pronto."*

O próprio Antigravity ativa a skill **`evidence-first`**, executa o comando `agy-vibe verify` no terminal em segundo plano e traz para você o relatório com os testes já executados.

### Forma 2: Você roda no terminal do Mac (Quando quiser)
Se você mesmo quiser conferir o estado de um projeto antes de fazer um commit ou subir código:
```bash
cd /caminho/do/seu/projeto
agy-vibe verify
```

---

## 🛡️ As 5 Barreiras de Proteção do Quality Gate

| Barreira | O que ela verifica | Por que é crucial? |
| :--- | :--- | :--- |
| **1. Teto Modular (<= 350 linhas)** | Varre todos os arquivos de código-fonte (`.ts`, `.tsx`, `.py`, etc.) procurando arquivos com mais de 350 linhas. | Arquivos com mais de 350 linhas degradam a atenção da IA e aumentam a taxa de alucinações e bugs sutis. |
| **2. Verificação de Tipos (Typecheck)** | Roda `npx tsc --noEmit` (TypeScript) ou compilador de sintaxe Python. | Garante que nenhuma função recebeu parâmetros errados, nenhum objeto teve campo esquecido e nenhum import aponta para arquivo inexistente. |
| **3. Linter de Código (Lint)** | Executa `npm run lint` ou o linter padrão do projeto (ESLint, Biome, Ruff). | Garante estilo limpo, remove variáveis mortas/não utilizadas e detecta padrões propensos a falhas. |
| **4. Testes Automatizados** | Roda a suíte de testes (`npm test`, `vitest`, `jest` ou `pytest`). | Prova que as novas mudanças não quebraram nenhuma funcionalidade que já estava funcionando anteriormente. |
| **5. Compilação de Produção (Build)** | Executa `npm run build`. | Simula o build real que acontecerá quando o projeto for para produção (Vercel, Docker, etc.), garantindo que o bundle compila com sucesso. |

---

## 📋 Como é o Relatório de Evidência?

Quando o comando termina, ele exibe um relatório transparente:

```text
=== Antigravity Quality Gates Verification ===

--- EVIDENCE REPORT ---
✔ Modularity (<=350 lines)     [PASS] -> All source files within modular bounds.
✔ Typecheck                    [PASS] -> 0 type errors found.
✔ Linter                       [PASS] -> Clean lint report.
✔ Automated Tests              [PASS] -> All test suites passing.
✔ Production Build             [PASS] -> Build completed successfully.

Conclusion:
✅ All active quality gates passed. Safe to deliver!
```

Se qualquer etapa falhar (por exemplo, um erro de tipo no TypeScript), o Quality Gate aponta exatamente o arquivo, a linha e o erro, impedindo que o código defeituoso seja dado por concluído!
