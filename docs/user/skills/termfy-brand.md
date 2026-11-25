# termfy-brand

A skill `termfy-brand` ajusta a identidade do binário depois do setup:
nome do executável e os campos que o apresentam no terminal e nos agentes.
Ela também altera os créditos e a aparência da TUI, usando os arquivos
responsáveis por cada campo. A tabela deste guia mostra essas origens. A skill
mantém essa fonte em ordem para que `--version`, `about`, a aba About, o
OpenCLI e o servidor MCP mostrem os mesmos valores. No fim, você tem os
campos novos aplicados, as superfícies conferidas e o `bun run validate`
verde.

## Quando usar

Use a `termfy-brand` nestas situações:

- A loja mudou de nome e o `mycli` precisa de outro título ou descrição.
- Você quer a cor da marca no destaque da TUI.
- Você quer acrescentar um crédito, um site ou uma licença à aba About.
- Você precisa renomear o executável depois que o projeto já existe.

Prefira outra skill nestes casos:

- O repositório acabou de sair do template e ainda responde `termfy`: use
  [termfy-init](termfy-init.md), que faz o rename inicial.
- Você quer mudar o propósito, os públicos ou os limites do binário: use
  [termfy-clispec](termfy-clispec.md). Identidade é nome e aparência, não
  escopo.
- Você quer uma screen nova ou um layout diferente: use a `termfy-tui`.

## Como pedir

Para trocar a cor e o autor:

> Use a skill termfy-brand para usar a cor #e4572e como destaque da TUI
> do mycli e trocar o autor para Loja Exemplo Ltda.

Para acrescentar um crédito:

> Use a skill termfy-brand para acrescentar aos créditos do mycli a API da
> loja, com o papel "orders and customers API" e o site da loja.

Para renomear o executável:

> Use a skill termfy-brand para renomear o mycli para lojacli, mantendo o
> título My CLI.

## O que a skill faz

1. Lê o estado atual com `git status --short` e
   `bun run dev -- about --json`.
2. Mostra cada campo que muda, com o valor atual e o proposto lado a lado.
   Depois, espera a sua confirmação.
3. Aplica os campos no `package.json` (bloco `termfy` e campos raiz). Para
   créditos, edita `src/app/manifest.ts`. Para cores e glifos, edita
   `src/tui/theme.ts`.
4. Se o `bin` mudou, roda `bun run init -- --name <bin>` e ajusta o título
   e a linha do `bin` no `CLISPEC.md`.
5. Roda `bun run opencli` e `bun run validate`.
6. Confere as superfícies: `bun run dev -- --version`,
   `bun run dev -- about`, `bun run dev -- --help | head`,
   `bun run dev -- mcp --list` e a aba About no teste `tests/tui.test.ts`
   (ou `bun run dev` em um terminal).
7. Registra a mudança no `CHANGELOG.md` do projeto.

## Exemplo

Cada campo vive em um lugar e alimenta várias superfícies. A skill segue
esta tabela de origens:

| Campo | Onde fica | Onde aparece |
| --- | --- | --- |
| `bin` | `termfy.bin` no `package.json` | `~/.<bin>/`, `<BIN>_HOME`, `<bin>://`, `--version`, `--help` |
| `title` | `termfy.title` | cabeçalho da TUI, aba About, `about`, OpenCLI |
| `description` | `description` | `--help`, cabeçalho da TUI, OpenCLI, MCP |
| `author`, `site` | bloco `termfy` | `about`, aba About, OpenCLI |
| `license` | `license` | `about`, aba About, OpenCLI |
| créditos | `credits` em `src/app/manifest.ts` | `about`, aba About, tool MCP `about` |
| paleta | `DEFAULT_TERMINAL_SLOTS` em `src/tui/theme.ts` | toda a TUI |

Para a cor de marca do primeiro exemplo, a skill altera só os papéis de
destaque. No tema `terminal`, ela escolhe o slot ANSI mais próximo em
`DEFAULT_TERMINAL_SLOTS`. O terminal define a cor exibida.

O relato chega como uma tabela de antes e depois:

```text
Campo              Antes          Depois
author             Loja Exemplo   Loja Exemplo Ltda
accent (terminal)  ANSI 4         ANSI 1

Arquivos: package.json, src/tui/theme.ts, docs/opencli.json, CHANGELOG.md
Conferido: --version, about, --help, aba About, mcp --list
```

## Regras que a skill segue

- **Uma fonte de identidade.** Os valores ficam no bloco `termfy` do
  `package.json` mais `name`, `version`, `description` e `license`. O
  `src/app/manifest.ts` lê dali e as superfícies leem do manifest. Um
  valor copiado em outro arquivo fica velho na próxima mudança.
- **Créditos ficam em `credits`.** Cada crédito tem nome, papel e URL. A
  skill não remove Bun, OpenTUI e MCP SDK enquanto o binário os usa, porque
  o crédito descreve o que roda de fato.
- **Mudar `bin` é um rename.** A skill usa `bun run init -- --name <bin>`,
  que reescreve `package.json`, `.env.example`, `README.md`, `AGENTS.md`,
  `CHANGELOG.md` e workflows. A pasta `~/.<bin>/`, o prefixo `<BIN>_` e o
  esquema `<bin>://` mudam junto. A skill avisa que as configurações e as
  credenciais antigas ficam na pasta antiga.
- **O título fica no rename.** Sem `--title`, o script mantém o título
  atual ("My CLI" continua "My CLI"). Para trocar os dois, passe
  `--name` e `--title` na mesma chamada.
- **`description` em inglês, abaixo de 80 caracteres.** Ela aparece no
  `--help`, no cabeçalho da TUI e no OpenCLI. Acima disso, o cabeçalho
  corta o texto.
- **Cores por papel.** A marca escolhe o slot ANSI em `DEFAULT_TERMINAL_SLOTS`. O tema do terminal determina a cor de cada slot.
- **Contraste mínimo de 4.5:1.** A skill confere `text` sobre `surface` e
  `keyText` sobre `keyBackground`. Abaixo disso, a leitura fica difícil em
  vários terminais.
- **About e `about` mostram o mesmo.** Os dois leem `aboutData()` em
  `src/cli/commands/about.ts`. Um campo novo entra nessa função e aparece
  nas duas superfícies.
- **Sem logo em ASCII.** O cabeçalho da TUI usa o glifo `▌` mais o título.
  Para um glifo próprio, a skill troca `glyphs.block` em
  `src/tui/theme.ts`, que ocupa uma célula em vez de várias linhas.
- **OpenCLI regenerado.** Depois de qualquer mudança, a skill roda
  `bun run opencli`, porque o bloco `info` do `docs/opencli.json` muda junto
  e o `opencli:check` falharia.
- **`CLISPEC.md` alinhado à mão.** O título, o `bin` e a `description` do
  `CLISPEC.md` precisam bater com o `package.json`. A skill não altera a
  Surface nem o índice `## Specs`, porque identidade não muda o que o
  binário faz.

## O que ela entrega

A skill relata:

- os campos alterados, com o valor anterior e o novo;
- os arquivos alterados;
- as superfícies conferidas;
- o aviso do rename da pasta `~/.<bin>/` quando o `bin` mudou.

Arquivos que podem mudar: `package.json`, `src/app/manifest.ts`,
`src/tui/theme.ts`, `src/tui/screens/about.ts` (painel "Standards"),
`src/cli/commands/about.ts`, `docs/opencli.json`, `CLISPEC.md` e
`CHANGELOG.md`. No rename, também `.env.example`, `README.md`, `AGENTS.md`
e os workflows.

## Próxima skill

Se o projeto ainda não tem `CLISPEC.md`, siga para a
[termfy-clispec](termfy-clispec.md). Se ele já tem, volte ao trabalho da
spec aberta com a [termfy-spec](termfy-spec.md) ou deixe a
[termfy](termfy.md) escolher o próximo passo.
