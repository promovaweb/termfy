# Visão geral

Uma ferramenta de terminal costuma nascer para uma pessoa digitar comandos.
Com o tempo, um script passa a chamá-la e precisa de saída estruturada. Depois
um agente de IA precisa operá-la e quer descobrir sozinho o que ela faz. Três
públicos, três formas de uso, e quase sempre três bases de código que se
desencontram.

O Termfy resolve isso com um único executável que atende os três:

| Público | Modo | Como entra |
| --- | --- | --- |
| pessoa | TUI | `mycli` sem argumentos, em terminal interativo |
| pessoa, script, agente | CLI | `mycli <comando> [opções]`, texto ou `--json` |
| agente de IA | MCP | `mycli mcp`, servidor Model Context Protocol via stdio |

Os três modos leem a mesma identidade, a mesma configuração, o mesmo cofre de
credenciais e a mesma tabela de códigos de saída. Um comando novo aparece no
`--help`, no `--json`, na descrição OpenCLI e na documentação embutida sem
duplicar texto.

## As peças

**Starter kit.** O repositório
[`promovaweb/termfy-starter-kit`](https://github.com/promovaweb/termfy-starter-kit)
é um template do GitHub com o esqueleto pronto: `src/` com as camadas `app`,
`cli`, `config`, `mcp`, `tui`, `skill` e `spec`; `docs/` embutida no binário; stubs em
`template/`; testes; workflows de CI e release. Ele já vem com as skills do
framework instaladas em `.agents/skills/`.

**Framework.** O repositório
[`promovaweb/termfy`](https://github.com/promovaweb/termfy) guarda as seis
skills que ensinam um agente a criar e evoluir um projeto derivado, as
referências que elas usam (documentação do OpenTUI, da OpenCLI, do MCP) e
este guia, publicado em PDF e EPUB.

**Projeto derivado.** O que você cria a partir do starter kit. Ele renomeia o
executável, acrescenta comandos, telas e tools, e recebe atualizações das
skills pela manutenção conduzida por `termfy-init`.

## Escolhas que o framework já fez

- **Bun** como runtime, bundler e compilador. `bun build --compile` gera um
  executável único por plataforma, com a biblioteca nativa do OpenTUI e a
  documentação embutidas.
- **OpenTUI** (`@opentui/core`) para a interface de terminal, com layout
  flexbox, renderização incremental e renderer de teste para capturar frames.
- **MCP TypeScript SDK** 1.x para o servidor stdio, com schemas Zod.
- **OpenCLI 0.1** como formato de descrição da CLI, gerado do registro de
  comandos.
- **AES-256-GCM** para o cofre de credenciais, com chave mestra em arquivo
  0600 ou em variável de ambiente.
- **Inglês no código** e na interface do binário: arquivos, identificadores,
  comentários, commands, options, keys e campos do `--json`. Documentação,
  guia e skills em português do Brasil, com os termos técnicos em inglês.

## Para quem é

Para a equipe da Promovaweb e para alunos que constroem ferramentas internas,
integrações com APIs e utilitários para agentes. O guia assume familiaridade
com terminal e TypeScript. Ele não ensina Bun nem MCP do zero; aponta a
documentação oficial quando ela é a melhor fonte.
