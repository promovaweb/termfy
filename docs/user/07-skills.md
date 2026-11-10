# Skills

Skills são pastas com um `SKILL.md` (instruções para o agente) e uma pasta
`references/` (material de apoio). Um agente de IA que trabalha no projeto
lê o `AGENTS.md`, escolhe a skill compatível com a tarefa e segue os passos.

## As cinco skills

| Skill | Quando o agente usa |
| --- | --- |
| `termfy-iniciar` | personalizar o starter kit para um binário novo e preparar o primeiro commit |
| `termfy-cli` | criar ou alterar comandos, opções, saída, códigos de saída e OpenCLI |
| `termfy-tui` | criar ou alterar telas, componentes, tema e teclas |
| `termfy-mcp` | criar ou alterar tools, resources e prompts; testar com o Inspector |
| `termfy-config` | declarar chaves de configuração, consumir credenciais, revisar o cofre |

Cada `SKILL.md` segue a mesma forma: o que ler antes, regras que não mudam,
passos, marcos de progresso e o que relatar ao final. As regras repetem o
contrato do framework (toda opção documentada, segredos fora de argumentos,
stdout só para dados), para que o agente não dependa de ter lido o guia.

## As referências

`references/` traz o que a skill cita:

- `termfy-cli`: contrato de comando, saída texto/JSON e o JSON Schema oficial
  da OpenCLI 0.1.
- `termfy-tui`: o guia de design modern unix, o guia de testes por frame e
  39 páginas da documentação oficial do OpenTUI 0.8.3.
- `termfy-mcp`: contrato de tool, guia de testes, princípio de economia de
  tokens do OpenMCP, documentação do MCP TypeScript SDK 1.x e páginas da
  especificação MCP (conceitos de servidor, transporte stdio, tools,
  resources, prompts, segurança local, Inspector e depuração).
- `termfy-config`: modelo de segurança do cofre e declaração de chaves.
- `termfy-iniciar`: checklist do bootstrap.

Pastas com documentação copiada de outros projetos levam um marcador
`.terceiros`. Validadores de texto de instrução ignoram essas pastas, porque o
texto não foi escrito aqui. As licenças originais acompanham as cópias.

## Como chegam ao projeto

O starter kit já traz as skills instaladas pela ferramenta `skills`
(`npx skills add promovaweb/termfy`). Elas ficam em `.agents/skills/`, a
pasta universal, com links em `.claude/skills/` e nas pastas dos demais
agentes escolhidos. `skills-lock.json` registra origem, caminho e hash de
cada uma.

```bash
bun run skills:update     # traz a versão mais recente do framework
bun run skills:instalar   # reinstala do zero
bun run skills:check      # confere que as cinco estão presentes e no lock
```

`bun run validar` inclui a conferência. Skills não são editadas no projeto
derivado; uma mudança acontece no framework, ganha versão e chega pelo
`update`.

## Compatibilidade

As skills citam caminhos do starter kit (`src/cli/registro.ts`,
`template/comando/exemplo.ts`). Cada versão do framework declara a faixa do
starter kit que cobre no `README.md` e na seção "Compatibilidade" de cada
`SKILL.md`. Quando o starter kit muda a estrutura, as skills são atualizadas
na mesma janela e as duas versões sobem juntas.

## Escrever uma skill nova

Quando um projeto derivado tem um domínio próprio (uma API, um formato de
arquivo, um fluxo de aprovação), vale escrever uma skill do projeto, em
`skills/` do próprio repositório ou em um repositório de skills da equipe.
Siga a mesma forma: frontmatter com `name` e `description`, leitura prévia,
regras, passos, marcos e saída. Texto em prosa direta, verbos no imperativo,
sem clichês de abertura ou fechamento. Valide a estrutura com um script como
`scripts/validar-skills.ts` do framework.
