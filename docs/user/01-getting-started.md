# Começar

Neste capítulo você cria um binário a partir do template, dá a ele um nome
e confere que os três modos respondem. O exemplo do guia é o `mycli`, uma
ferramenta para consultar e atualizar os pedidos de uma loja. Ele ainda não
tem nenhum command de pedidos: o objetivo aqui é ter o esqueleto rodando
com a identidade certa, porque todo o resto parte dele.

## Antes de começar

- Bun 1.4.4 ou superior. Para instalar:
  `curl -fsSL https://bun.sh/install | bash`.
- Git e acesso de leitura aos repositórios `promovaweb/termfy` e
  `promovaweb/termfy-starter-kit`.
- Um terminal com cores de 24 bits para a TUI. A CLI e o MCP funcionam em
  qualquer terminal ou pipe.
- Um agente de código (Claude Code, Codex ou OpenCode, por exemplo) que
  você abre na pasta do projeto.

## 1. Crie o repositório pelo template

No GitHub, abra `promovaweb/termfy-starter-kit` e clique em
**Use this template**. Dê ao repositório novo o nome `mycli` e clone-o:

```bash
git clone https://github.com/<seu-usuario>/mycli.git
cd mycli
```

O template já traz as 18 skills do Termfy em `.agents/skills/`. Você não
precisa instalar nada além do Bun para continuar.

## 2. Peça o setup ao agente

Abra o agente na pasta `mycli` e escreva:

> Use a skill termfy-init para preparar este projeto. O executável será
> mycli, com o título My CLI. A descrição é "Query and update shop
> orders." O autor é Promovaweb e o repositório é
> `https://github.com/<seu-usuario>/mycli`.

A descrição aparece no `--help` e fica em inglês, assim como os demais
textos do binário. Você continua conversando com o agente em português.

A skill confirma os campos que faltarem e executa estes passos:

| Passo | Comando que o agente roda | Para que serve |
| --- | --- | --- |
| dependências | `bun install` | instala OpenTUI, SDK do MCP e Zod |
| identidade | `bun run init -- --name mycli ...` | troca o nome do binário em `package.json`, `README.md`, `AGENTS.md`, `.env.example` e nos workflows |
| skills | `bun run skills:check` | confere se as 18 skills do Termfy estão instaladas |
| descrição OpenCLI | `bun run opencli` | regenera `docs/opencli.json` com o nome novo |
| validação | `bun run validate` | roda typecheck, testes, checagens da documentação e o build |
| README | edição do arquivo | troca a abertura do template pelo propósito do `mycli` |

A saída do `init` mostra cada arquivo alterado:

```text
✓ package.json: termfy → mycli
✓ .env.example
✓ README.md
✓ AGENTS.md
✓ CHANGELOG.md: history started at 0.1.0

Done. Check with: bun run dev -- --version && bun run dev -- --help
Then run: bun run validate
```

O nome que você escolheu no `package.json` também define a pasta
`~/.mycli/`, onde ficam preferências e segredos. Define também as
variáveis de ambiente `MYCLI_HOME` e `MYCLI_MASTER_KEY` e o prefixo
`mycli://` das URIs que o servidor MCP publica. Por isso o nome aceita só
letras minúsculas, números e hífen, entre 2 e 40 caracteres, começando por
letra.

Repare também no que o `init` mantém. As skills continuam com os nomes
`termfy-cli`, `termfy-spec` e os demais, porque vêm do framework e não do
seu projeto. O `AGENTS.md` passa a dizer que o repositório é o binário
`mycli`, criado com o starter kit do Termfy. O projeto começa na versão
`0.1.0`, com um `CHANGELOG.md` próprio. O histórico do template fica no
template.

No fim, a skill sugere seguir para a `termfy-clispec`, que entrevista você
sobre o propósito do binário. Antes, confira o que o setup entregou.

## 3. Confira os três modos

Durante o desenvolvimento, você roda o binário com `bun run dev --`
seguido dos argumentos. Comece pela versão:

```bash
bun run dev -- --version
```

```text
mycli 0.1.0
```

### CLI em texto

O `--help` lista o que o esqueleto já sabe fazer. Este é o começo da
saída:

```text
My CLI v0.1.0
Query and update shop orders.

Usage

  mycli <subcommand> [options]
  mycli                      opens the TUI (no arguments, interactive terminal)
  mycli mcp                  starts the MCP server over stdio

Commands

  tui                 Open the terminal interface (Overview and About). Requires a TTY.
  about               Show version, executable, runtime, platform and credits.
  config              Read and write preferences in ~/.mycli/settings.json.
  credentials (cred)  Store encrypted secrets (AES-256-GCM) in ~/.mycli/credentials.json.
  mcp                 Start the MCP server (stdio) with tools, resources and prompts for agents.
  skill               Print the embedded documentation, whole or by topic. Same effect as --skill.
  doctor              Check runtime, terminal, settings, key source and vault readability without changing files.
  completion          Print a registry-generated completion script for bash, zsh or fish.
```

Esses oito commands são o esqueleto. Os commands que você criar aparecem
nesta mesma lista, com as mesmas options globais (`--json`, `--skill`,
`--opencli`, `--no-color`). A ajuda termina com a tabela de exit codes,
explicada no capítulo [CLI](03-cli.md).

### CLI em JSON

Scripts e agentes leem a saída com `--json`. Todo command devolve o mesmo
envelope, com `ok`, `command` e `data`:

```bash
bun run dev -- about --json
```

```json
{
  "ok": true,
  "command": "mycli about",
  "data": {
    "bin": "mycli",
    "title": "My CLI",
    "version": "0.1.0",
    "description": "Query and update shop orders.",
    "author": "Promovaweb"
  }
}
```

A saída real traz mais campos em `data`: site, repositório, licença,
executável, runtime, plataforma, pasta de dados e créditos. O trecho acima
mostra os que vieram do seu pedido.

Quando algo falha, o envelope troca `data` por `error`. O exit code do
processo é o mesmo de `error.code`:

```bash
bun run dev -- config get nope.key --json
```

```json
{
  "ok": false,
  "command": "mycli config get",
  "error": {
    "code": 3,
    "name": "CONFIG",
    "message": "Key \"nope.key\" does not exist. See \"mycli config schema\".",
    "details": {
      "key": "nope.key"
    }
  }
}
```

### Diagnóstico

O `doctor` confere o ambiente sem alterar arquivos:

```bash
bun run dev -- doctor
```

```text
✓ bun: 1.4.4; minimum 1.4.4
! stdin: Not a TTY
! stdout: Not a TTY
! directory: Not created
! settings: Not created
! master-key: none
! credentials: Not created
✓ binary: mycli 0.1.0
✓ platform: linux-x64
```

Os itens com `!` são avisos que mantêm o exit code `0` do `doctor`. Num
projeto recém-criado, a pasta `~/.mycli/` ainda não existe, porque o
binário só a cria quando precisa gravar algo. Faça o teste: grave uma
preferência e guarde uma credencial.

```bash
bun run dev -- config set tui.theme day
printf 'shp_live_1234567890abcdef' | bun run dev -- credentials set shop.token --stdin
bun run dev -- credentials get shop.token
```

```text
✓ tui.theme = "day"
✓ credential "shop.token" saved to ~/.mycli/credentials.json
shp_************ef
```

A gravação cria a pasta com permissão `0700` e salva a preferência em
texto no `settings.json`. O token é cifrado com AES-256-GCM em
`credentials.json`, com a master key gerada em `~/.mycli/master.key`. O
`get` mostra o valor mascarado: para ver o valor inteiro, você precisa
usar `--reveal`. O capítulo
[Configuração e credenciais](06-configuration-and-credentials.md) explica
o cofre.

### MCP

Para ver o que um agente encontra quando se conecta ao binário:

```bash
bun run dev -- mcp --list
```

```text
MCP server mycli v0.1.0

Tools:
  about  Version, executable, runtime, platform and credits of the binary.
  exit_codes  Process exit-code table.
  skill  Embedded documentation, whole or by topic.
  config_list  Every settings.json key with its effective value.
  config_get  Value of a settings.json key.
  credentials_status  Saved names and master key source, without values.
  doctor  Diagnose runtime, terminal and configuration health. Returns checks and ok without credential values or file changes.

Resources:
  mycli://about  Binary identity and runtime as JSON.
  mycli://exit-codes  Exit-code table as JSON.
  mycli://skill  Full documentation in Markdown.
  mycli://skill/{topic}  One documentation section. Topics: cli, tui, mcp, config, exit-codes, reference.

Prompts:
  operate  Guides the agent to read the documentation and run a task through the CLI.
```

As tools do esqueleto só leem. Nenhuma devolve o valor de uma credencial
nem grava arquivos. Você grava pela CLI, com a confirmação prevista por
cada comando. O capítulo [MCP](05-mcp.md) mostra como acrescentar tools.

### TUI

Por último, abra a interface num terminal interativo:

```bash
bun run dev
```

```text
 ▌ My CLI v0.1.0  │  Query and update shop orders.                            linux-x64 • Bun 1.4.4
  1 ⌂ Overview   2 ℹ About
 ──────────────────────────────────────────────────────────────────────────────────────────────────
 ╭─ ❯ Environment ──────────────────────────────────╮╭─ ◉ State ──────────────────────────────────╮
 │ Binary    mycli v0.1.0                           ││ settings.json     • defaults               │
 │ Runtime   Bun 1.4.4                              ││ credentials.json  • empty                  │
 │ Platform  linux-x64                              ││ master key        not created              │
 │ Terminal  100×26  xterm-256color                 ││ MCP               mycli mcp                │
 │ Data      ~/.mycli                               ││                                            │
 ╰──────────────────────────────────────────────────╯╰────────────────────────────────────────────╯
 ╭─ ⚙ Settings in effect ───────────────────────────╮╭─ ≡ Next steps ─────────────────────────────╮
 │ output.colors      true                          ││ In the terminal                            │
 │ output.format      "text"                        ││ → mycli --help                             │
 │ telemetry.enabled  false                         ││ → mycli credentials set <name>             │
 │ tui.icons          "auto"                        ││ → mycli config set tui.theme day           │
 │ tui.initialTab     "overview"                    ││ → mycli --skill                            │
 │ tui.mouse          true                          ││                                            │
 │ tui.theme          "terminal"                    ││ For agents                                 │
 │                                                  ││ MCP client: { "command": "mycli", "args":  │
 │                                                  ││ ["mcp"] }                                  │
 │                                                  ││                                            │
 │                                                  ││  c  ❐ copy MCP config                      │
 │                                                  ││  r  ↻ reload                               │
 │                                                  ││                                            │
 ╰──────────────────────────────────────────────────╯╰────────────────────────────────────────────╯
  r  reload   c  copy MCP config   ←/→  tab   ?  help   q  quit

```

Este frame mostra um projeto sem preferências gravadas. Cada aba tem número
e ícone: `2` ou um clique em `About` abre a segunda aba. A barra de baixo
lista as ações da aba e as teclas globais. Um clique num item executa a
ação, como a tecla. `?` abre o help com todas as teclas e `q` sai. Num pipe, o
binário sem argumentos imprime a ajuda e sai com `2`. Já `mycli tui` sai
com `8` (NO_TTY).

## O que mudou no projeto

| Arquivo | O que mudou |
| --- | --- |
| `package.json` | `name`, `bin` e o bloco `termfy` com `mycli`; versão `0.1.0` |
| `CHANGELOG.md` | histórico novo, começando em `0.1.0` |
| `README.md` | título `My CLI`, abertura com o propósito e exemplos com `mycli` |
| `AGENTS.md` | apresenta o repositório como o binário `mycli`; as skills seguem com os nomes `termfy-*` |
| `.env.example` | variáveis `MYCLI_HOME` e `MYCLI_MASTER_KEY` |
| `docs/opencli.json` | descrição OpenCLI regenerada com o nome novo |

O código em `src/` não mudou. Ele lê o nome, o título e a versão do
`package.json` quando roda, por isso o `--help`, a TUI e o MCP já mostram
`mycli` sem que você edite nenhum arquivo de código.

## Manter as skills atualizadas

As skills evoluem no framework. Para trazer a versão nova a um projeto
que já existe, peça:

> Use termfy-init no modo de manutenção para atualizar as skills do Termfy
> deste projeto e conferir a compatibilidade com o starter kit.

O agente roda `bun run skills:update`, confere o `skills-lock.json` e os
links dos agentes e roda `bun run skills:check`. Nesse modo, a skill
preserva o nome do produto, o `CLISPEC.md` e as specs.

## Se algo der errado

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| `bun: command not found` | Bun não instalado ou fora do `PATH` | instale com `curl -fsSL https://bun.sh/install \| bash` e abra um terminal novo |
| `init` termina com exit code `2` | nome fora da regra | use só letras minúsculas, números e hífen, começando por letra |
| `bun run dev` imprime a ajuda e sai com `2` | o terminal não é interativo | abra a TUI num terminal de verdade; num pipe, use os commands da CLI |
| `skills:check` falha | skills ausentes ou alteradas | peça ao agente: "Use termfy-init no modo de manutenção das skills" |

## Próximo passo

O esqueleto roda, mas ninguém escreveu ainda o que o `mycli` deve fazer. O
capítulo [Descrever e especificar](10-describe-and-specify.md) mostra a
entrevista da `termfy-clispec`, o `CLISPEC.md` que ela grava e a primeira
spec.
