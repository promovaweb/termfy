# Glossário e problemas comuns

## Glossário

| Termo | Significado no Termfy |
| --- | --- |
| binário | o executável único gerado pelo `bun build --compile`, com TUI, CLI e MCP |
| starter kit | o template `promovaweb/termfy-starter-kit`, ponto de partida de cada binário |
| projeto derivado | o repositório criado a partir do starter kit, como o `mycli` |
| skill | pasta com `SKILL.md` e `references/` que ensina o agente a fazer uma etapa |
| `CLISPEC.md` | visão macro única do binário: propósito, públicos, limites, superfície entregue e índice das specs |
| spec | arquivo `specs/NNNN-slug.md` que descreve uma evolução, com tarefas e testes |
| Surface | a superfície do binário: commands, screens, tools, resources, prompts, settings, credenciais e tabelas |
| command | entrada da CLI no registry, como `config get` ou `orders list` |
| registry | a árvore de commands em `src/cli/commands.ts`; gera ajuda, OpenCLI, completion e referência |
| envelope | a forma do `--json`: `{ ok, command, data }` ou `{ ok, command, error }` |
| exit code | número com que o processo termina; cada família de falha tem um fixo |
| screen | uma aba da TUI, registrada em `src/tui/screens/index.ts` |
| action | comando de uma screen, com tecla, descrição, ícone e a função que roda; aparece na barra inferior, no help e no clique |
| Nerd Font | fonte com glifos de ícone; o conjunto `nerd` da TUI depende dela |
| tool | função que o servidor MCP oferece ao agente, com schema Zod |
| resource | conteúdo que o agente lê pelo MCP sem efeito, como `mycli://skill` |
| prompt | roteiro que o servidor MCP oferece para guiar uma conversa |
| efeito | o que uma tool faz: `read`, `write` ou `network` |
| setting | preferência em `settings.json`, declarada em `SETTINGS_SCHEMA` |
| tema `terminal` | tema padrão da TUI, que herda as cores do terminal |
| cofre | `credentials.json`, cifrado com AES-256-GCM |
| master key | chave do cofre, em `~/.<bin>/master.key` ou em `<BIN>_MASTER_KEY` |
| OpenCLI | formato JSON que descreve a CLI; o binário gera com `--opencli` |
| documentação embutida | `docs/` dentro do binário, lida com `--skill` ou pela tool `skill` |
| migration | arquivo que muda o schema do SQLite, embutido no binário |

## Problemas comuns

### Instalação e setup

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| `bun: command not found` | Bun fora do `PATH` | instale com `curl -fsSL https://bun.sh/install \| bash` e abra um terminal novo |
| `init` sai com 2 | nome fora da regra | use letras minúsculas, números e hífen, começando por letra |
| `skills:check` falha | skill ausente ou alterada à mão | peça a `termfy-init` no modo de manutenção das skills |
| o agente não acha as skills | links dos agentes ausentes | rode a manutenção da `termfy-init`, que confere os links |

### CLI

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| o binário sem argumentos imprime a ajuda e sai com 2 | não há TTY (pipe, CI, agente) | passe um command; a TUI precisa de terminal interativo |
| `mycli tui` sai com 8 | NO_TTY | abra num terminal de verdade |
| `Unknown option` e exit code 2 | option fora do registry daquele command | confira com `mycli <command> --help` |
| `opencli:check` falha no `validate` | o registry mudou e `docs/opencli.json` não | rode `bun run opencli` |
| `docs:check` falha | command ou key sem documentação embutida | peça a [termfy-docs](skills/termfy-docs.md) |

### Configuração e cofre

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| exit code 3 em `config get` | key inexistente | `mycli config schema` lista as keys válidas |
| exit code 4 com `Credential "x" not found` | o segredo não foi gravado | `mycli credentials set x` |
| exit code 4 ao ler o cofre em outra máquina | master key diferente | defina `<BIN>_MASTER_KEY` com a chave original ou grave os segredos de novo |
| exit code 7 | pasta `~/.<bin>/` sem permissão | confira o dono da pasta; o binário cria com `0700` |

### MCP

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| o cliente conecta e cai em seguida | texto escrito em stdout durante a conversa | mande diagnóstico para stderr; stdout é só do JSON-RPC |
| o cliente não acha o binário | executável fora do `PATH` do cliente | use o caminho absoluto em `command` |
| a tool nova não aparece | não foi registrada em `registerAll` | confira com `mycli mcp --list` |

Para depurar com uma interface, rode o MCP Inspector:

```bash
npx @modelcontextprotocol/inspector bun run src/main.ts mcp
```

### TUI

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| cores diferentes do esperado | o tema `terminal` segue o tema do terminal; `night` e `day` pedem cor de 24 bits | troque o tema do terminal ou fixe com `tui.theme night` num terminal com truecolor |
| a aba nova não abre com `tui.initialTab` | o id não está nos valores da key | acrescente o id em `values` da key no `SETTINGS_SCHEMA` |
| a tecla da tela não responde | a ação não está em `actions`, ou `onKey` devolve `false` | declare a ação em `actions` com `run`, ou devolva `true` quando a tela consumir a tecla |
| o ícone aparece como quadrado | a fonte do terminal não tem Nerd Font | use `tui.icons unicode` ou instale uma Nerd Font |
| o mouse não seleciona texto | o mouse da TUI está ligado | use `Shift` e arraste, ou `tui.mouse false` |

### Release

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| o workflow falha no build | pacotes nativos de outros alvos ausentes | o workflow instala com `bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"`; reproduza localmente com `bun run build:all` |
| a tag já existe | versão repetida | escolha a próxima versão; tag publicada não se move |
| o binário baixado mostra outra versão | `package.json` não foi atualizado antes da tag | publique uma versão nova com o número certo |
