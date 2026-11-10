# Skills

Skills são pastas com um `SKILL.md` (instruções para o agente) e uma pasta
`references/` (material de apoio). Um agente de IA que trabalha no projeto
lê o `AGENTS.md`, escolhe a skill compatível com a tarefa e segue os passos.

## As seis skills

| Skill | Quando o agente usa |
| --- | --- |
| `termfy-spec` | entrevistar a pessoa e montar o `CLISPEC.md`: propósito, públicos, commands, screens, tools, configuração e credenciais |
| `termfy-init` | personalizar o starter kit para um binário novo e preparar o primeiro commit |
| `termfy-cli` | criar ou alterar comandos, opções, saída, códigos de saída e OpenCLI |
| `termfy-tui` | criar ou alterar telas, componentes, tema e teclas |
| `termfy-mcp` | criar ou alterar tools, resources e prompts; testar com o Inspector |
| `termfy-config` | declarar chaves de configuração, consumir credenciais, revisar o cofre |

Cada `SKILL.md` segue a mesma forma: o que ler antes, regras que não mudam,
passos, marcos de progresso e o que relatar ao final. As regras repetem o
contrato do framework (toda opção documentada, segredos fora de argumentos,
stdout só para dados), para que o agente não dependa de ter lido o guia.

## O CLISPEC.md

Antes de implementar, o agente precisa saber o que construir. A skill
`termfy-spec` entrevista a pessoa em blocos curtos (identidade, propósito e
públicos, modos, commands, TUI, MCP, configuração e credenciais, fora de
escopo, checagens de aceite) e grava o resultado em `CLISPEC.md`, na raiz do
projeto, no contrato descrito em `docs/spec.md` do starter kit: front matter
YAML validado por schema (`commands`, `screens`, `mcp`, `settings`,
`credentials`, cada um com os nomes do código), cinco seções fixas
(`Purpose`, `Audiences`, `Out of scope`, `Checklist`, `Notes`) e uma
checklist com `{#id}` por entrega e a tag da skill responsável.

O binário lê a própria spec: `<bin> spec show` imprime front matter, seções
e progresso; `<bin> spec check` valida o contrato e cruza com o código
(command, option, exit code, screen, tool e setting citados precisam
existir, inclusive em `draft`; commands, screens, tools e settings do
código ausentes da spec geram avisos, que também fazem a checagem falhar
com `--strict`); `<bin> spec progress` conta a checklist. A tool MCP `spec`
devolve o mesmo conteúdo a um agente. `bun run spec:check` entra em
`bun run validate` e ainda confere que todo `getCredential("<name>")` do
código aparece em `credentials` da spec.

As skills `termfy-cli`, `termfy-tui`, `termfy-mcp` e `termfy-config` leem a
entrada da spec antes de tocar no código e, ao concluir cada entrega, marcam
o item da checklist pelo `{#id}` e avançam `updatedAt`. `AGENTS.md` do
starter kit manda rodar `termfy-spec` quando a spec não cobrir o pedido.
A entrevista não marca implementações como prontas. Referências futuras
podem ficar na spec planejada, mas fazem `spec check` sair com 3 até a
implementação. O binário compilado lê a spec embutida no build; para
conferir uma edição local, rode pelo código-fonte com `bun run dev`.

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
- `termfy-init`: checklist do bootstrap.
- `termfy-spec`: contrato do `CLISPEC.md` com exemplo e roteiro em nove
  blocos.

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
bun run skills:install   # reinstala do zero
bun run skills:check      # confere que as seis estão presentes e no lock
```

`bun run validate` inclui a conferência. Skills não são editadas no projeto
derivado; uma mudança acontece no framework, ganha versão e chega pelo
`update`.

## Compatibilidade

As skills citam caminhos do starter kit (`src/cli/registry.ts`,
`template/command/example.ts`). Cada versão do framework declara a faixa do
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
`scripts/validate-skills.ts` do framework.
