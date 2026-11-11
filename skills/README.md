# Skills do Termfy

Dezoito skills cobrem o ciclo de um binário derivado do starter kit, da
frase da pessoa à release. Cada pasta tem `SKILL.md` (instruções) e
`references/` (material de apoio, incluindo documentação oficial copiada do
OpenTUI, da OpenCLI, do MCP TypeScript SDK e da especificação MCP, em pastas
marcadas com `.terceiros`).

## Para que serve cada uma e como funciona

| Skill | Para que serve | Como funciona |
| --- | --- | --- |
| [`termfy`](termfy/SKILL.md) | porta de entrada do vibecoding: a pessoa descreve a ferramenta em uma frase | diagnostica o estágio, confirma identidade e públicos em uma mensagem, chama as outras skills na ordem e para só na aprovação da spec e antes da release |
| [`termfy-init`](termfy-init/SKILL.md) | preparar o projeto e manter suas skills | conduz o setup e as verificações; no modo de manutenção, instala, atualiza ou repara somente as skills |
| [`termfy-brand`](termfy-brand/SKILL.md) | ajustar como o binário se apresenta | altera o bloco `termfy` do `package.json`, créditos em `src/app/manifest.ts` e paleta em `src/tui/theme.ts`; confere `--version`, `about`, aba About, OpenCLI e MCP |
| [`termfy-clispec`](termfy-clispec/SKILL.md) | descrever o binário como um todo | entrevista sobre problema, públicos, modos, capacidades e limites, grava a visão macro única em `CLISPEC.md`, em Markdown puro, e cria os arquivos das specs iniciais em `specs/` |
| [`termfy-spec`](termfy-spec/SKILL.md) | registrar cada evolução | entrevista por evolução e grava à mão `specs/NNNN-slug.md` com status, Goal, Behavior, Design, Surface, Tasks e Tests; a conferência manual compara com o código e o fechamento aplica a Surface ao `CLISPEC.md` |
| [`termfy-api-import`](termfy-api-import/SKILL.md) | transformar a documentação de uma API em CLI | lê OpenAPI, Postman, página ou texto, propõe commands por recurso, tools, settings e credenciais, e grava na seção Surface de uma spec para `termfy-api` e `termfy-command-set` implementarem |
| [`termfy-config`](termfy-config/SKILL.md) | settings e credenciais | declara keys no `SETTINGS_SCHEMA`, consome credenciais com `getCredential()`, cuida da master key e da rotação |
| [`termfy-api`](termfy-api/SKILL.md) | integrar um serviço externo | cria o client HTTP com timeout, retries limitados, token do cofre e base URL tipada; testa com `Bun.serve` local |
| [`termfy-database`](termfy-database/SKILL.md) | guardar dados entre execuções, só quando a pessoa pede | SQLite em `~/.<bin>/data.db` com `bun:sqlite`, migrations embutidas no binário, repositórios usados por CLI, MCP e TUI e testes com banco em memória |
| [`termfy-cli`](termfy-cli/SKILL.md) | criar e alterar commands | copia o stub, preenche o registry, implementa `run`, registra, testa em subprocesso, regenera o OpenCLI e marca as tarefas da spec aberta |
| [`termfy-command-set`](termfy-command-set/SKILL.md) | gerar uma família `recurso verbo` de uma vez | commands, tools MCP espelhadas e screen de lista a partir da entrada da spec, com funções compartilhadas e testes nos três modos |
| [`termfy-mcp`](termfy-mcp/SKILL.md) | expor tools, resources e prompts | usa receitas tipadas, schemas de entrada e saída, paginação, cancelamento e tratamento de erros; confere catálogo e testa com o `Client` em memória e por stdio |
| [`termfy-tui`](termfy-tui/SKILL.md) | criar e alterar screens | copia o stub, monta com os componentes (`panel`, `listPanel`) e o tema, registra a aba, testa por frame com o renderer de teste |
| [`termfy-test`](termfy-test/SKILL.md) | cobrir os três modos com testes | padrões copiáveis para CLI em subprocesso, MCP com o `Client` do SDK, TUI com `createTestRenderer` e config em pasta temporária |
| [`termfy-review`](termfy-review/SKILL.md) | auditar uma entrega sem editar | confere spec, testes, descriptions, exit codes, segredos, stdout do MCP, cores, docs e idioma; relata por gravidade com `arquivo:linha` |
| [`termfy-docs`](termfy-docs/SKILL.md) | melhorar a documentação embutida | lê o `--skill` como um agente leria, corrige a cobertura apontada por `docs:check`, reescreve seções fracas e regenera o OpenCLI |
| [`termfy-release`](termfy-release/SKILL.md) | publicar uma versão | SemVer a partir do changelog, `validate`, commit, tag imutável, push, release do workflow com binários e checksums, binário conferido |
| [`termfy-mcp-client`](termfy-mcp-client/SKILL.md) | ligar o binário aos agentes | configura Claude Code, Codex, Cursor, OpenCode e Gemini CLI, valida com `mcp --list` e o Inspector, sem credenciais na configuração |

## Sequência de uso

O guia do framework tem um capítulo só sobre isso
(`docs/user/09-workflow.md`). Em resumo:

1. `termfy` quando a pessoa descreve a ferramenta em uma frase; ela
   chama as demais na ordem abaixo.
2. `termfy-init` uma vez, ao criar o repositório; `termfy-brand` quando a
   identidade mudar.
3. `termfy-clispec` para a visão macro em `CLISPEC.md`, uma vez e de novo
   quando propósito, públicos ou limites mudarem.
4. `termfy-spec` a cada evolução, com uma spec em `specs/`;
   `termfy-api-import` quando o ponto de partida é a documentação de uma API.
5. `termfy-config`, `termfy-api`, `termfy-database` (só quando a spec pede
   armazenamento), `termfy-cli` ou `termfy-command-set`, `termfy-mcp` e
   `termfy-tui`, uma entrega por vez, com `termfy-test` cobrindo cada uma.
6. `termfy-review` e `termfy-docs` ao fechar a spec; com todos os itens
   marcados, a `termfy-spec` aplica a Surface ao `CLISPEC.md` e marca a
   spec como `done`.
7. `termfy-release` e, para uso com agentes, `termfy-mcp-client`.

## Forma comum

Frontmatter com `name` igual ao nome da pasta e `description` em uma linha
sem dois-pontos. Seções: leitura prévia, regras, passos, marcos, saída e
compatibilidade. Caminhos citados apontam para o starter kit, onde a skill é
executada; `bun run skills:check-paths` confere os caminhos contra ele.

## Instalação

O starter kit já vem com as skills instaladas. Para setup ou manutenção,
use `termfy-init` no modo correspondente. Em outro projeto, peça ao agente
para instalar as skills de `https://github.com/promovaweb/termfy` e abrir
`termfy-init`. Os scripts de instalação e atualização são ferramentas
internas executadas pelo agente.

Validação da estrutura, do frontmatter e dos links: `bun run skills:validate`.
