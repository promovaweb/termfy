# Três modos

## Despacho dos três modos

`src/main.ts` decide o modo em três linhas:

1. Sem argumentos e com stdin e stdout em um TTY: abre a TUI.
2. Sem argumentos e sem TTY: imprime a ajuda e encerra com código 2. Um pipe
   ou um agente que esqueceu os argumentos recebe a resposta na hora, em vez
   de ficar preso esperando uma interface.
3. Com argumentos: roda o CLI. `mcp` é um comando como os outros, só que não
   devolve enquanto o transporte stdio estiver aberto.

Isso mantém um único executável e um único `--help`. Não existe `mycli-tui`
nem `mycli-mcp`.

## O que os modos compartilham

| Peça | Arquivo | Usado por |
| --- | --- | --- |
| identidade (nome, versão, autor, links) | `src/app/manifest.ts` | cabeçalho da TUI, `about`, `--version`, OpenCLI, nome do servidor MCP |
| códigos de saída | `src/app/exit-codes.ts` | `--help`, OpenCLI, tool `exit_codes`, resource `exit-codes` |
| erros de domínio | `src/app/errors.ts` | todos os comandos |
| preferências | `src/config/settings.ts` | tema e aba inicial da TUI, formato padrão do CLI, tools de leitura |
| cofre | `src/config/credentials.ts` | comandos que chamam APIs, `credentials_status` |
| documentação | `docs/` embutida via `src/skill/index.ts` | `--skill`, comando `skill`, tool e resource `skill` |

## Quando usar cada modo

**TUI** quando você quer navegar pelo estado do ambiente ou consultar uma
lista e abrir os detalhes de um item. A interface apresenta os resultados
das funções do binário e sugere os comandos correspondentes da CLI.

**CLI em texto** quando você digita comandos e lê o resultado no terminal.
A saída usa tabelas alinhadas e cores por papel, com o código entre
colchetes nas mensagens de erro.

**CLI em JSON** quando um script, um pipeline ou um agente lê. Envelope
estável `{ ok, command, data }` em sucesso e `{ ok, command, error }` em
exceções, em stdout nos dois casos. Nessas exceções, o exit code corresponde a
`error.code`. `doctor` também pode devolver `data.ok: false` com envelope `ok: true` e
saída 3. Confira o exit code além do envelope.
`--opencli` imprime JSON próprio, sem esse envelope.

**MCP** quando um agente conversa por protocolo, usando tools para executar
funções, resources para leitura e prompts para orientar a conversa. A tool `skill`
devolve a mesma documentação do `--skill`, então o agente descobre o
binário sem sair do protocolo.

## Documentação embutida

`docs/` entra no binário em tempo de build como texto. `mycli --skill`
imprime tudo em Markdown; `--skill cli` imprime só a seção da CLI, com a
referência de comandos gerada do registro no final. Um agente que recebe o
binário compilado, sem o repositório, lê a documentação completa com um
comando.

O mesmo conteúdo sai pela tool MCP `skill`, pela resource `mycli://skill`
e pelo comando `mycli skill [topic]`. Os tópicos são `cli`, `tui`, `mcp`,
`config`, `exit-codes` e `reference`. Este último devolve apenas a
referência gerada do registro. O texto completo inclui as páginas importadas
em `src/skill/index.ts`, não todos os arquivos presentes em `docs/`.
