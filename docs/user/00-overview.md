# Visão geral

Você pode usar uma ferramenta de terminal digitando comandos, chamando-a
por um script ou conectando um agente de IA. O script precisa de saída
estruturada e o agente precisa descobrir as funções disponíveis. O Termfy
reúne essas formas de uso no mesmo projeto para compartilhar as funções
entre os três modos.

O Termfy resolve isso com um único executável que atende os três:

| Público | Modo | Como entra |
| --- | --- | --- |
| pessoa | TUI | `mycli` sem argumentos, em terminal interativo |
| pessoa, script, agente | CLI | `mycli <comando> [opções]`, texto ou `--json` |
| agente de IA | MCP | `mycli mcp`, servidor Model Context Protocol via stdio |

Os três modos compartilham a configuração e a identidade do binário.
Também usam o mesmo cofre de credenciais e os mesmos códigos de saída.
Um comando novo aparece no
`--help`, no `--json`, na descrição OpenCLI e na documentação embutida sem
duplicar texto.

## As peças

**Starter kit.** O repositório
[`promovaweb/termfy-starter-kit`](https://github.com/promovaweb/termfy-starter-kit)
é um template do GitHub com o esqueleto pronto: `src/` com as camadas `app`,
`cli`, `config`, `mcp`, `tui` e `skill`; `docs/` embutida no binário; stubs em
`template/`; testes; workflows de CI e release. Ele já vem com as skills do
framework instaladas em `.agents/skills/`.

**Framework.** O repositório
[`promovaweb/termfy`](https://github.com/promovaweb/termfy) guarda as
18 skills que ensinam um agente a criar e evoluir um projeto derivado, as
referências que elas usam (documentação do OpenTUI, da OpenCLI, do MCP) e
este guia, publicado em PDF e EPUB.

**Projeto derivado.** É o repositório que você cria a partir do starter kit,
renomeando o executável e acrescentando comandos, telas e tools. As atualizações das
skills chegam pela manutenção conduzida por `termfy-init`.

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

## Público do guia

O guia se destina aos desenvolvedores da Promovaweb e aos alunos que
constroem ferramentas internas, integrações com APIs e utilitários para
agentes. Você precisa ter familiaridade com terminal e TypeScript para
acompanhar os exemplos. Para estudar Bun ou MCP do início, consulte a
documentação oficial indicada pelas skills.
