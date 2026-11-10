# Skills do Termfy

Dezesseis skills cobrem o ciclo de um binário derivado do starter kit, da
frase da pessoa à release. Cada pasta tem `SKILL.md` (instruções) e
`references/` (material de apoio, incluindo documentação oficial copiada do
OpenTUI, da OpenCLI, do MCP TypeScript SDK e da especificação MCP, em pastas
marcadas com `.terceiros`).

## Para que serve cada uma e como funciona

| Skill | Para que serve | Como funciona |
| --- | --- | --- |
| [`termfy-build`](termfy-build/SKILL.md) | porta de entrada do vibecoding: a pessoa descreve a ferramenta em uma frase | diagnostica o estágio, confirma identidade e públicos em uma mensagem, chama as outras skills na ordem e para só na aprovação da spec e antes da release |
| [`termfy-init`](termfy-init/SKILL.md) | criar o binário a partir do template | roda `bun run init`, atualiza as skills, chama `termfy-spec`, confere os três modos, valida e prepara o primeiro commit |
| [`termfy-brand`](termfy-brand/SKILL.md) | ajustar como o binário se apresenta | altera o bloco `termfy` do `package.json`, créditos em `src/app/manifest.ts` e paleta em `src/tui/theme.ts`; confere `--version`, `about`, aba About, OpenCLI e MCP |
| [`termfy-spec`](termfy-spec/SKILL.md) | registrar o que será construído | entrevista em nove blocos e grava `CLISPEC.md` no contrato de `docs/spec.md`; `spec check` valida contra o código e `spec sync` traz o que o código já tem |
| [`termfy-api-import`](termfy-api-import/SKILL.md) | transformar a documentação de uma API em CLI | lê OpenAPI, Postman, página ou texto, propõe commands por recurso, tools, settings e credenciais, e grava na spec para `termfy-api` e `termfy-command-set` implementarem |
| [`termfy-config`](termfy-config/SKILL.md) | settings e credenciais | declara keys no `SETTINGS_SCHEMA`, consome credenciais com `getCredential()`, cuida da master key e da rotação |
| [`termfy-api`](termfy-api/SKILL.md) | integrar um serviço externo | cria o client HTTP com timeout, retries limitados, token do cofre e base URL tipada; testa com `Bun.serve` local |
| [`termfy-cli`](termfy-cli/SKILL.md) | criar e alterar commands | copia o stub, preenche o registry, implementa `run`, registra, testa em subprocesso, regenera o OpenCLI e marca a checklist da spec |
| [`termfy-command-set`](termfy-command-set/SKILL.md) | gerar uma família `recurso verbo` de uma vez | commands, tools MCP espelhadas e screen de lista a partir da entrada da spec, com funções compartilhadas e testes nos três modos |
| [`termfy-mcp`](termfy-mcp/SKILL.md) | expor tools, resources e prompts | copia o stub, declara schema Zod, registra no catalog, testa com o `Client` do SDK e o Inspector |
| [`termfy-tui`](termfy-tui/SKILL.md) | criar e alterar screens | copia o stub, monta com os componentes (`panel`, `listPanel`) e o tema, registra a aba, testa por frame com o renderer de teste |
| [`termfy-test`](termfy-test/SKILL.md) | cobrir os três modos com testes | padrões copiáveis para CLI em subprocesso, MCP com o `Client` do SDK, TUI com `createTestRenderer` e config em pasta temporária |
| [`termfy-review`](termfy-review/SKILL.md) | auditar uma entrega sem editar | confere spec, testes, descriptions, exit codes, segredos, stdout do MCP, cores, docs e idioma; relata por gravidade com `arquivo:linha` |
| [`termfy-docs`](termfy-docs/SKILL.md) | melhorar a documentação embutida | lê o `--skill` como um agente leria, corrige a cobertura apontada por `docs:check`, reescreve seções fracas e regenera o OpenCLI |
| [`termfy-release`](termfy-release/SKILL.md) | publicar uma versão | SemVer a partir do changelog, `validate`, commit, tag imutável, push, release do workflow com binários e checksums, binário conferido |
| [`termfy-mcp-client`](termfy-mcp-client/SKILL.md) | ligar o binário aos agentes | configura Claude Code, Codex, Cursor, OpenCode e Gemini CLI, valida com `mcp --list` e o Inspector, sem credenciais na configuração |

## Sequência de uso

O guia do framework tem um capítulo só sobre isso
(`docs/user/09-workflow.md`). Em resumo:

1. `termfy-build` quando a pessoa descreve a ferramenta em uma frase; ela
   chama as demais na ordem abaixo.
2. `termfy-init` uma vez, ao criar o repositório; `termfy-brand` quando a
   identidade mudar.
3. `termfy-spec` antes de cada rodada; `termfy-api-import` quando o ponto de
   partida é a documentação de uma API.
4. `termfy-config`, `termfy-api`, `termfy-cli` ou `termfy-command-set`,
   `termfy-mcp` e `termfy-tui`, uma entrega por vez, com `termfy-test`
   cobrindo cada uma.
5. `termfy-review` e `termfy-docs` ao fechar a rodada.
6. `termfy-release` e, para uso com agentes, `termfy-mcp-client`.

## Forma comum

Frontmatter com `name` igual ao nome da pasta e `description` em uma linha
sem dois-pontos. Seções: leitura prévia, regras, passos, marcos, saída e
compatibilidade. Caminhos citados apontam para o starter kit, onde a skill é
executada; `bun run skills:check-paths` confere os caminhos contra ele.

## Instalação

```bash
npx skills add https://github.com/promovaweb/termfy
```

O starter kit já vem com as skills instaladas e os scripts
`skills:install`, `skills:update` e `skills:check`.

Validação da estrutura, do frontmatter e dos links: `bun run skills:validate`.
