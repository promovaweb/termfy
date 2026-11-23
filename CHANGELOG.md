# Changelog

Formato baseado em Keep a Changelog. Versões seguem SemVer.

## [0.15.3] - 2026-11-23

- Passa a distribuir o projeto sob a GNU AGPL 3.0, com o arquivo `LICENSE` na raiz e o campo `license` em `AGPL-3.0-only`. O README deixa de descrever o repositório como privado.

## [0.15.2] - 2026-11-22

- Atualiza a identidade visual do projeto e sua apresentação no README.

## [0.15.1] - 2026-11-22

- Documenta a atualização das tarefas do ClickUp para pronto após o commit e publicado após o push.

## [0.15.0] - 2026-11-16

### Alterado

- `termfy-tui`: o design passa a ser o de cartões arejados. A referência
  `modern-unix-design.md` descreve a estrutura da tela e a tabela de tokens
  de espaçamento (`ctx.space`). A skill e o checklist de qualidade exigem
  margens, paddings e gaps vindos dos tokens.
- Frame da TUI no capítulo "Começar" regenerado do Starter Kit 0.13.0.
- Compatibilidade da `termfy-tui`: Starter Kit a partir da v0.13.0.
- Ebook 0.15.0.

## [0.14.1] - 2026-11-16

### Alterado

- `termfy-tui`: `scrollPanel` entra nos componentes, com a regra de que
  nenhum texto cai sobre a borda nem sobrepõe outro. O checklist de
  qualidade confere transbordo, barra inteira e proporção no layout largo.
- Frame da TUI no capítulo "Começar" regenerado do Starter Kit 0.12.1.
- Ebook 0.14.1.

## [0.14.0] - 2026-11-16

### Adicionado

- `termfy-tui/references/screen-patterns.md`: cinco padrões de tela (lista
  e detalhe, painel de status, formulário por diálogos, visualizador de
  documento e tela de progresso), com componentes, teclas, composição em
  `wide`, `medium` e `compact` e testes.
- `termfy-tui/references/quality-checklist.md`: checklist de qualidade de
  TUI (foco visível, estados vazio, carregando e erro, layout compacto,
  paleta, confirmação, toasts, status, contraste, segredos fora do frame,
  `watch` e timers parados).
- Regras da `termfy-tui` para `ctx.layout()`, diálogos, paleta de
  comandos, foco por `Tab`, `watch()`, `onPause` e `onResume`,
  `tui.motion` e os componentes `table`, `stateView`, `spinner`,
  `progressBar` e `link`.

### Alterado

- `termfy-command-set`: a screen da família segue o padrão lista e
  detalhe, com criação por `ctx.prompt` e remoção confirmada.
- `termfy-review` aplica o checklist de qualidade. `termfy-test` cobre
  frames em 60×16, 80×24 e 120×32, diálogos, paleta e segredos fora do
  frame.
- `termfy-brand` cuida do título da janela e do logotipo opcional em ASCII
  art na aba About.
- Contrato de tela em `screen-contract.md` com layout, diálogos, status,
  `watch` e pausa.
- Guia: capítulos 01, 04, 06 e 14 e as páginas das skills `termfy-tui` e
  `termfy-command-set` com a interface nova, as abas Settings,
  Credentials e Docs e a paleta.
- Compatibilidade de `termfy-tui`, `termfy-command-set`, `termfy-review`,
  `termfy-test` e `termfy-brand`: Starter Kit a partir da v0.12.0.
- Ebook 0.14.0.

### Corrigido

- URL solta em `termfy-cli/references/opencli.md`.

## [0.13.0] - 2026-11-16

### Adicionado

- Teclado e mouse em toda a TUI como regra de todo binário Termfy. A
  `termfy-tui` exige que cada comando de uma tela seja uma `ScreenAction`
  com tecla, que todo elemento clicável chame a mesma função de uma ação,
  que as abas mostrem número e ícone e que os ícones venham de `ctx.icons`.
- `termfy-test` cobre o caminho de mouse com `setup.mockMouse`.
- `termfy-review` confere tecla em cada ação, clique ligado a uma ação e
  ausência de glifo fixo fora de `src/tui/icons.ts`.
- Guia: mouse, teclado, abas numeradas, ícones e as settings `tui.icons` e
  `tui.mouse` nos capítulos 04, 06 e 14, verbetes "action" e "Nerd Font" e
  soluções para ícone em quadrado e para seleção de texto com o mouse.

### Alterado

- `termfy-command-set`, `termfy-brand` e as referências de contrato de
  tela, teclado, desenho, layout e problemas comuns seguem o modelo de
  ações.
- Frame da TUI no capítulo "Começar" regenerado do binário real, com abas
  numeradas, ícones e a barra de ações.
- Compatibilidade de `termfy-tui`, `termfy-test`, `termfy-review` e
  `termfy-command-set`: Starter Kit a partir da v0.11.0.
- Ebook 0.13.0.

## [0.12.0] - 2026-11-16

### Adicionado

- Tema `terminal` como padrão de todo binário Termfy. A `termfy-tui` exige
  que `tui.theme` continue `terminal` nos projetos derivados. Cada token
  desse tema aponta para um slot ANSI ou para o texto e fundo padrão do
  terminal, então a TUI herda o tema do Ghostty, do Omarchy, do Termius,
  do Herdr e de outros terminais.
- `termfy-review`: verificação de que o tema `terminal` usa só
  `RGBA.fromIndex`, `RGBA.defaultForeground` e `RGBA.defaultBackground`.
- Glossário do guia com o verbete "tema `terminal`".

### Alterado

- `termfy-brand`: no tema `terminal`, a cor da marca é a escolha do slot
  ANSI em `DEFAULT_TERMINAL_SLOTS`. O hex da marca entra em `night` e
  `day`.
- `termfy-tui`, `termfy-test` e as referências de telas, gráficos e
  desenho conferem os temas `terminal`, `night` e `day`. Token novo
  existe nas três paletas.
- `termfy-config` alinha `tui.theme` a `THEME_NAMES`.
- Compatibilidade de `termfy-tui`, `termfy-brand`, `termfy-config`,
  `termfy-test` e `termfy-review`: Starter Kit a partir da v0.10.0.
- Guia do usuário (capítulos 04, 06, 10 e 14 e as páginas das skills
  `termfy-tui`, `termfy-brand` e `termfy-clispec`) com os três temas.
- Ebook 0.12.0.

## [0.11.2] - 2026-11-14

### Corrigido

- Revisada a redação do guia do usuário em `docs/user/`, com explicações mais precisas e correções de linguagem.
- Atualizados os formatos portáteis da documentação a partir das fontes revisadas.

## [0.11.1] - 2026-11-13

### Corrigido

- `docs/user/08-publishing.md`: o comando que instala os pacotes nativos de
  todos os alvos passa a ser
  `bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"`. Com
  `@opentui/core` no comando, o Bun 1.4 deixa
  `@opentui/core-linux-arm64-musl` de fora e o alvo linux-arm64 falha.
- `docs/user/14-glossary-and-troubleshooting.md`: a linha de falha no build
  cita o comando completo, com lockfile e `--libc`.
- Workflows do CI e da release usam `actions/checkout@v5`, que roda no
  Node.js 24 e remove o aviso de Node.js 20 descontinuado.
- Ebook regenerado na edição 0.11.1.

## [0.11.0] - 2026-11-13

### Adicionado

- Nova identidade visual: ícone e logotipo "terminal com conector", uma
  janela de terminal com o prompt e um conector lima na lateral, que
  representa o servidor MCP ao lado da TUI e da CLI.
- Kit de marca em `brand/`: variações do logo para fundo claro e escuro,
  favicons, paleta com acento lima (`#A3E635` no escuro, `#4D7C0F` no
  claro), tokens, `global.css`, tema Tailwind, tipografia, fontes Inter e
  Manrope, relatório de contraste, manifesto com hashes e guia visual.

### Alterado

- README abre com o logo do Termfy e a linha "Um projeto da Promovaweb".
- Capa do ebook usa o logo do Termfy no lugar do logo da Promovaweb, com a
  Promovaweb citada nos dados da edição. Ebook 0.11.0.
- `.markdownlint.json` libera os elementos HTML do cabeçalho do README.

## [0.10.0] - 2026-11-12

### Adicionado

- Guia reescrito em três partes, com exemplos no texto. Fundamentos traz a
  visão geral, o começo com saídas reais do starter kit, os três modos, as
  skills e a sequência. Construir cobre especificar (entrevista,
  `CLISPEC.md`, spec e ciclo), integrar uma API com o exemplo da uazapi
  (admintoken no cofre, instância por `--instance`), guardar dados em
  SQLite e testar, revisar e publicar. Referência traz CLI, TUI, MCP,
  configuração, publicação e o novo glossário com problemas comuns.
- Uma página por skill em `docs/user/skills/`: quando usar, como pedir, o
  que faz, exemplo, regras, entrega e próxima skill.
- Ebook 0.10.0.

### Corrigido

- Visão geral dizia "seis skills"; são 18.
- `08-publishing.md` mandava `git push origin main --tags`; agora envia só
  a tag da versão, como a `termfy-release` exige.
- `termfy-release`: categorias do changelog em português (Adicionado,
  Alterado, Corrigido), como no starter kit.
- `termfy-database`: nome do arquivo de migration em kebab-case e `name`
  em snake_case, como no stub.
- `termfy-tui`: OpenTUI 0.8.4 e contrato da screen a partir da v0.9.0.
- `termfy-mcp-client`: compatibilidade a partir da v0.9.0.

## [0.9.3] - 2026-11-11

### Corrigido

- O primeiro `CLISPEC.md` de um projeto derivado passa a registrar em
  Surface o que o esqueleto já entrega (commands, screens, tools,
  resources, prompts e settings lidos do código). Sem isso, a conferência
  manual acusava o esqueleto inteiro como não declarado. Ajustados
  `termfy-clispec`, o contrato em `spec-contract.md`, o fluxo de `termfy`
  e o capítulo 9 do guia.
- Ebook 0.9.1.

## [0.9.2] - 2026-11-11

### Corrigido

- O job de validação do CI pulava a instalação do Bun por uma condição que
  pertence só ao job de compatibilidade.

## [0.9.1] - 2026-11-11

### Corrigido

- O workflow de release chamava `bun run validar`, script inexistente, e não publicava a GitHub Release desde a 0.8.1. Agora roda `skills:validate` e `ebook:verify`.
- O CI falhava sem o secret `STARTER_KIT_TOKEN`. A conferência com o starter kit privado passa a ser pulada com aviso quando o secret não existe.

## [0.9.0] - 2026-11-11

### Alterado

- `CLISPEC.md` e `specs/NNNN-slug.md` passam a ser Markdown puro, sem front
  matter YAML nem `{#id}`, criados e editados pelo agente. O contrato fica
  em `skills/termfy-spec/references/spec-contract.md`, com a seção
  `## Surface` no lugar de `changes` e conferência manual no lugar de
  `spec check`.
- Todas as skills e o guia deixam de citar o command `spec`, as tools MCP
  de spec, a aba Specs e `spec:check`. Compatível com o starter kit 0.9.0.
- Ebook 0.9.0.

### Removido

- Status `blocked` das specs; a pausa fica registrada em Notes.

## [0.8.1] - 2026-11-11

### Alterado

- Bun 1.4.4 como mínimo e TypeScript 7 nas dependências de desenvolvimento.
- Guia e skills citam o Bun 1.4.4; compatível com o starter kit 0.8.2.
- Ebook 0.8.1.

### Removido

- Tabela de compatibilidade entre versões do framework e do starter kit no
  `README.md`. A faixa coberta continua na seção "Compatibilidade" de cada
  `SKILL.md`.

## [0.8.0] - 2026-11-10

### Adicionado

- `termfy-clispec`: entrevista a pessoa para entender o que o binário
  precisa fazer e mantém o `CLISPEC.md`, a visão macro única (propósito,
  públicos, limites, superfície entregue e índice das specs). Monta com a
  pessoa a lista de specs iniciais.
- `termfy-database`: SQLite somente quando a pessoa pede, com o banco em
  `~/.<bin>/data.db`, schema gerido por migrations embutidas no binário
  (uma por arquivo, nunca editadas depois da release), repositórios
  compartilhados por CLI, MCP e TUI e testes com banco em memória.

### Alterado

- `termfy-build` passa a se chamar `termfy`: o nome do framework marca a
  skill de entrada, a primeira a chamar em qualquer projeto.
- As skills editam specs pelo binário: `spec start`, `spec task add`,
  `spec test add` e `spec done`, sem YAML ou checkbox à mão.
- `termfy-database` e `termfy-spec` declaram as tabelas em
  `storage.tables`, conferidas contra as migrations; o stub de banco faz
  backup antes de migrar.
- `termfy-spec` exige que cada entrada de `changes` seja citada por uma
  tarefa ou um teste, e adota código existente com `spec sync --spec`.
- `termfy-spec` passa a escrever uma spec por evolução em
  `specs/NNNN-slug.md`, em entrevista: `changes` da superfície, Behavior
  (como o binário vai funcionar), Design (como o código deve ser feito),
  Tasks e Tests. Referências novas: `spec-contract.md` e
  `behavior-design.md`.
- As skills de implementação leem a spec aberta, seguem Behavior e Design,
  marcam os itens na spec e fecham o ciclo com `spec close`.
- Compatibilidade com o starter kit 0.8.x (contrato CLISPEC 2.0.0).
- `termfy-tui` ampliada com contrato de screen, layout e conteúdo, teclado e
  formulários, operações assíncronas e ciclo de vida, gráficos, solução de
  problemas, fontes do OpenTUI e exemplo de screen assíncrona.
- `termfy-mcp` ampliada com stdio e ciclo de vida, resources e prompts,
  paginação e resultados, segurança e efeitos, compatibilidade, solução de
  problemas e exemplos de servidor, tools e testes.
- Guia: a atualização das skills nos projetos derivados passa pela
  manutenção conduzida por `termfy-init`, no lugar de `skills:update`.
- Ebook 0.8.0.

## [0.7.1] - 2026-11-10

### Corrigido

- Seção "Compatibilidade" das skills novas alinhada ao starter kit 0.7.x.

## [0.7.0] - 2026-11-10

### Adicionado

- `termfy-build`: porta de entrada do vibecoding; a pessoa descreve a
  ferramenta e a skill conduz init, brand, spec, implementação, docs e
  release com dois checkpoints.
- `termfy-api-import`: converte a documentação de uma API (OpenAPI,
  Postman, página ou texto) em entradas do `CLISPEC.md`.
- `termfy-api`: client HTTP de serviço externo com token do cofre, base URL
  tipada, timeout, retries limitados e testes com `Bun.serve`.
- `termfy-command-set`: família `recurso verbo` com tools MCP e screen de
  lista de uma vez.
- `termfy-test`: padrões de teste para CLI, MCP, TUI e config.
- `termfy-review`: auditoria de entrega por gravidade, sem editar.
- `termfy-release`: versão, changelog, tag imutável e release conferida.
- `termfy-mcp-client`: configuração em Claude Code, Codex, Cursor, OpenCode
  e Gemini CLI, com validação.
- Guia 0.4.0: capítulo 09 reescrito com a sequência das dezesseis skills;
  `skills/README.md` descreve cada uma.

### Alterado

- Compatibilidade com o starter kit 0.7.x, que ganhou `spec sync`.

## [0.6.2] - 2026-11-10

### Corrigido

- `description` da skill `termfy-brand` tinha dois-pontos sem aspas e o
  instalador `skills` pulava a skill com erro de YAML; o texto foi
  reescrito e `scripts/validate-skills.ts` passa a validar o frontmatter
  como YAML.

## [0.6.1] - 2026-11-10

### Corrigido

- Índice do guia sem a construção vetada no título do capítulo 09; guia
  0.3.1.

## [0.6.0] - 2026-11-10

### Adicionado

- Skill `termfy-docs`: melhora a documentação embutida do binário, com a
  checklist de cobertura e forma, o guia de escrita para pessoas e agentes
  e o `docs:check` do starter kit como gate.
- Skill `termfy-brand`: ajusta a identidade do binário em todas as
  superfícies (`package.json`, créditos, paleta, aba About, OpenCLI, MCP),
  com o mapa da identidade e os papéis da paleta em `references/`.
- Capítulo `09-workflow.md` do guia: a sequência de uso das oito skills, o
  que cada uma deixa pronto para a seguinte e quando sair da ordem.
- `skills/README.md` descreve para que serve e como funciona cada skill.

### Alterado

- Compatibilidade das skills com o starter kit 0.6.x; guia 0.3.0.

## [0.5.1] - 2026-11-10

### Corrigido

- Rodada de revisão das skills e do guia contra o starter kit 0.5.1: fluxo
  da spec e responsabilidade por marcar a checklist (a skill de
  implementação marca; `termfy-spec` revisa a entrada quando o escopo muda),
  contratos JSON de `doctor` e `spec check`, `interactive` como descrição
  sem verificação de TTY, tipos e defaults de settings, `listPanel` e
  `spacer`, topics do `--skill`, rotação de chave e mascaramento, sequência
  depois do `init` e contagem das seis skills. Guia 0.2.5. Teste do
  verificador de caminhos sem as exceções temporárias.

## [0.5.0] - 2026-11-10

### Adicionado

- `scripts/check-skills-against-starter-kit.ts` e o script
  `skills:check-paths`, em `validate`: todo caminho e `bun run <script>`
  citado nas skills precisa existir no starter kit. Job `compatibilidade`
  no CI, com checkout do starter kit via secret `STARTER_KIT_TOKEN`.
- `references/clispec-contract.md` na `termfy-spec`, cópia do contrato
  `docs/spec.md` do starter kit.

### Alterado

- `termfy-spec` passa a escrever o `CLISPEC.md` no contrato estruturado
  (front matter validado, seções `Purpose`, `Audiences`, `Out of scope`,
  `Checklist`, `Notes`, itens com `{#id}`) e a conferir com
  `bun run dev -- spec check`. As skills `termfy-cli`, `termfy-tui`,
  `termfy-mcp` e `termfy-config` marcam a checklist da spec ao concluir cada
  entrega. `termfy-init` roda `termfy-spec` antes de conferir os modos.
- `termfy-cli` cita `doctor`, `completion` e `--skill reference`;
  `termfy-tui` cita `listPanel`; `termfy-config` cita
  `credentials rotate-key`. Compatíveis com o starter kit 0.5.x.
- Capítulos do guia renomeados para inglês (`00-overview.md`,
  `01-getting-started.md`, `02-three-modes.md`,
  `06-configuration-and-credentials.md`, `08-publishing.md`); guia 0.2.4
  com o contrato do CLISPEC, os commands de apoio, `listPanel` e
  `rotate-key`.

## [0.4.1] - 2026-11-10

### Alterado

- Skills e guia (edição 0.2.2) deixam de pedir `bun run ebook` no projeto
  derivado: o starter kit 0.4.0 não tem pipeline de ebook. O ebook é do
  framework; o starter kit entrega a `docs/` do próprio projeto, embutida no
  binário pelo `--skill`.

## [0.4.0] - 2026-11-10

### Alterado

- Skill `termfy-iniciar` renomeada para `termfy-init`. Projetos derivados
  precisam remover a antiga e instalar a nova (`npx skills remove
  termfy-iniciar` e `bun run skills:install`).
- Arquivos de `references/` renomeados para inglês: `command-contract.md`,
  `text-json-output.md`, `interview.md`, `tool-contract.md`, `mcp-tests.md`,
  `REFERENCES.md`, `modern-unix-design.md`, `screen-tests.md`,
  `security-model.md` e `settings-keys.md`.
- Guia do framework 0.2.1 com os nomes novos.

## [0.3.0] - 2026-11-10

### Adicionado

- Skill `termfy-spec`: entrevista a pessoa em nove blocos e monta o
  `CLISPEC.md` (identidade, propósito, públicos, commands, TUI, MCP,
  configuração, credenciais, fora de escopo, checagens de aceite e
  pendências), com template e roteiro em `references/`. As skills
  `termfy-cli`, `termfy-tui`, `termfy-mcp` e `termfy-config` passam a ler o
  `CLISPEC.md` antes de implementar.

### Alterado

- Skills e guia compatíveis com o starter kit 0.3.x, cujo código passou a
  ser em inglês: caminhos (`src/app/manifest.ts`, `src/cli/registry.ts`,
  `src/cli/commands/`, `src/tui/screens/`, `template/command/` e outros),
  identificadores (`AppError`, `ExitCode`, `getCredential`, `mountTui`),
  scripts (`bun run init`, `bun run validate`, `build:all`,
  `skills:install`), keys (`output.format`, `tui.theme` com `night` e `day`),
  option `--tab`, topic `exit-codes` e envelope `--json` com `command`,
  `data` e `error`.
- `AGENTS.md` registra a regra: código em inglês, documentação e skills em
  português com termos técnicos em inglês.
- Guia do framework 0.2.0, com a seção sobre o `CLISPEC.md` e a tabela de
  compatibilidade atualizada; `scripts/validate-skills.ts` e os scripts
  `skills:validate` e `validate` em inglês.

## [0.2.1] - 2026-11-10

### Alterado

- Skills compatíveis com o starter kit 0.2.x, que ganhou o guia do usuário em
  PDF e EPUB: `termfy-iniciar` manda regenerar o ebook depois do bootstrap e
  as demais skills avançam `ebook/VERSION` e rodam `bun run ebook` sempre
  que `docs/` muda.
- Guia do framework 0.1.1: capítulos "Começar", "Três modos" e "Publicar"
  descrevem o ebook do binário derivado; tabela de compatibilidade
  atualizada.

## [0.2.0] - 2026-11-10

### Alterado

- O repositório passa a conter só o framework: skills, referências, guia em
  `docs/user/` e ebook. O esqueleto do binário (`src/`, `docs/` embutida,
  `template/`, `tests/`, scripts de build e bootstrap) foi movido para
  `promovaweb/termfy-starter-kit` 0.1.0, template do GitHub que traz estas
  skills instaladas via `npx skills add`.
- `termfy-iniciar` passa a partir do starter kit e inclui a atualização das
  skills com `bun run skills:update`.
- As cinco skills ganham a seção "Compatibilidade", que declara a faixa do
  starter kit coberta (0.1.x).
- `scripts/validar-skills.ts` roda em Bun e ignora links em pastas
  `.terceiros`.
- O repositório deixa de ser template do GitHub; o template é o starter kit.

### Adicionado

- Guia do framework em `docs/user/`, com nove capítulos: visão geral,
  começar, três modos, CLI, TUI, MCP, configuração e credenciais, skills e
  publicar.
- Ebook `Termfy-Guia-do-Framework-v0.1.0` em PDF e EPUB, gerado por
  `bun run ebook` com o design system de PDF da Promovaweb
  (`pdf-design-system: 1.0.0`), aliases `ebook-termfy.{pdf,epub}` e
  manifesto `ebook/build.json`.
- Workflow de release que anexa o PDF e o EPUB à GitHub Release.

## [0.1.0] - 2026-11-09

### Adicionado

- Esqueleto do binário em Bun com três modos: TUI sem argumentos, CLI com
  argumentos e servidor MCP via stdio (`termfy mcp`).
- CLI com registro declarativo de comandos (`src/cli/registro.ts`), parser
  próprio, `--help` gerado, `--version`, `--json` com envelope estável,
  `--skill [topico]` com a documentação embutida, `--opencli` com a
  descrição OpenCLI 0.1 e `--no-color`.
- Comandos `tui`, `about`, `config` (list, get, set, unset, path, schema),
  `credentials` (set, get, list, remove, status, clear), `mcp [--list]` e
  `skill`.
- Códigos de saída fixos em `src/app/saida.ts`: 0 sucesso, 1 genérico, 2 uso,
  3 configuração, 4 credenciais, 5 rede ou API, 6 não encontrado,
  7 permissão, 8 terminal indisponível, 9 MCP, 130 interrompido.
- Pasta `~/.<bin>/` com `settings.json` (texto claro, notação de ponto e
  esquema tipado), `credentials.json` (AES-256-GCM) e `master.key` (0600),
  com `<BIN>_HOME` e `<BIN>_MASTER_KEY`.
- TUI sobre `@opentui/core` 0.8.3 com abas Overview e About, tema modern
  unix em duas paletas, barra de teclas, ajuda com `?` e telas modulares.
- Servidor MCP com `@modelcontextprotocol/sdk` 1.32: tools `about`,
  `exit_codes`, `skill`, `config_list`, `config_get`, `credentials_status`;
  resources `<bin>://about`, `<bin>://exit-codes`, `<bin>://skill` e
  `<bin>://skill/{topico}`; prompt `operar`.
- Documentação em `docs/` embutida no binário e `docs/opencli.json` gerado.
- Stubs em `template/` para comando, tela e tool.
- Skills `termfy-iniciar`, `termfy-cli`, `termfy-tui`, `termfy-mcp` e
  `termfy-config`, com referências do OpenTUI, OpenCLI, MCP SDK e
  especificação MCP.
- Scripts `build`, `build:todos`, `opencli`, `opencli:check`,
  `skills:validar`, `iniciar` e `validar`; 37 testes com `bun test`,
  incluindo CLI em subprocesso, cliente MCP real e captura de frame da TUI.
- Workflows de CI e de release com binários para cinco plataformas.
