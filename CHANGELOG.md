# Changelog

Formato baseado em Keep a Changelog. Versões seguem SemVer.

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
