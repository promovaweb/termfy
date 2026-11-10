# Três modos

## A regra de despacho

`src/main.ts` decide o modo em três linhas:

1. Sem argumentos e com stdin e stdout em um TTY: abre a TUI.
2. Sem argumentos e sem TTY: imprime a ajuda e encerra com código 2. Um pipe
   ou um agente que esqueceu os argumentos recebe a resposta na hora, em vez
   de ficar preso esperando uma interface.
3. Com argumentos: roda o CLI. `mcp` é um comando como os outros, só que não
   devolve enquanto o transporte stdio estiver aberto.

Isso mantém um único executável e um único `--help`. Não existe `meucli-tui`
nem `meucli-mcp`.

## O que os modos compartilham

| Peça | Arquivo | Usado por |
| --- | --- | --- |
| identidade (nome, versão, autor, links) | `src/app/manifesto.ts` | cabeçalho da TUI, `about`, `--version`, OpenCLI, nome do servidor MCP |
| códigos de saída | `src/app/saida.ts` | `--help`, OpenCLI, tool `exit_codes`, resource `exit-codes` |
| erros de domínio | `src/app/erros.ts` | todos os comandos |
| preferências | `src/config/settings.ts` | tema e aba inicial da TUI, formato padrão do CLI, tools de leitura |
| cofre | `src/config/credenciais.ts` | comandos que chamam APIs, `credentials_status` |
| documentação | `docs/` embutida via `src/skill/index.ts` | `--skill`, comando `skill`, tool e resource `skill` |

## Quando usar cada modo

**TUI** quando a pessoa quer olhar, navegar e decidir com o que vê: estado do
ambiente, listas, detalhes. A TUI não substitui o CLI; ela mostra o que o
CLI faz e sugere os comandos.

**CLI em texto** quando a pessoa digita e lê. Tabelas alinhadas, cores por
papel, mensagens de erro com o código entre colchetes.

**CLI em JSON** quando um script, um pipeline ou um agente lê. Envelope
estável `{ ok, comando, dados }` em sucesso e `{ ok, comando, erro }` em
falha, sempre em stdout, com o código de saída do processo igual ao
`erro.codigo`.

**MCP** quando um agente conversa por protocolo. Tools para ação, resources
para leitura passiva, prompts para orientar a conversa. A tool `skill`
devolve a mesma documentação do `--skill`, então o agente descobre o
binário sem sair do protocolo.

## Documentação embutida

`docs/` entra no binário em tempo de build como texto. `meucli --skill`
imprime tudo em Markdown; `--skill cli` imprime só a seção da CLI, com a
referência de comandos gerada do registro no final. Um agente que recebe o
binário compilado, sem o repositório, lê a documentação completa com um
comando.

O mesmo conteúdo sai pela tool MCP `skill`, pela resource `meucli://skill`
e pelo comando `meucli skill [topico]`. Os tópicos são `cli`, `tui`, `mcp`,
`config` e `codigos`.
