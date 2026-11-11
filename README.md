# Termfy

Framework de skills da Promovaweb para construir ferramentas de terminal em
[Bun](https://bun.sh) com três modos no mesmo executável: TUI para pessoas,
CLI com saída em texto ou `--json` para scripts e agentes, e servidor
[Model Context Protocol](https://modelcontextprotocol.io) via stdio para
agentes de IA.

Este repositório guarda o método. O código do binário vive no starter kit.

| Repositório | Conteúdo |
| --- | --- |
| [`promovaweb/termfy`](https://github.com/promovaweb/termfy) (este) | skills `termfy-*`, referências (OpenTUI, OpenCLI, MCP), guia em `docs/user/` e ebook |
| [`promovaweb/termfy-starter-kit`](https://github.com/promovaweb/termfy-starter-kit) | esqueleto em Bun, template do GitHub, com as skills instaladas via `npx skills` |

## Começar um binário

Crie o repositório com **Use this template** em
`promovaweb/termfy-starter-kit` e abra o clone no agente. Peça:

> Use termfy-init para fazer o setup deste projeto. O executável será
> mycli e servirá para consultar e atualizar pedidos da loja.

O agente conduz a instalação, a identidade e as verificações. Para seguir
até a implementação do produto, use `termfy` com a descrição da
ferramenta. Para ajustar uma identidade existente, use `termfy-brand`.

Peça ao agente para usar `termfy-init` no modo de manutenção das skills.
Ela instala, atualiza ou repara as cópias do Termfy e confere o lock, os
links dos agentes e a compatibilidade, preservando a identidade, o
`CLISPEC.md` e as specs.

## Skills

| Skill | Quando usar |
| --- | --- |
| [`termfy`](skills/termfy/SKILL.md) | porta de entrada do vibecoding: descreva a ferramenta e ela conduz o ciclo |
| [`termfy-init`](skills/termfy-init/SKILL.md) | setup do starter kit e manutenção das skills |
| [`termfy-brand`](skills/termfy-brand/SKILL.md) | nome, título, descrição, autor, links, créditos e paleta |
| [`termfy-clispec`](skills/termfy-clispec/SKILL.md) | entrevista sobre o que o binário precisa fazer e visão macro única em `CLISPEC.md` |
| [`termfy-spec`](skills/termfy-spec/SKILL.md) | uma spec por evolução em `specs/`, com Behavior, Design, Tasks e Tests |
| [`termfy-api-import`](skills/termfy-api-import/SKILL.md) | documentação de uma API convertida em `changes.add` de uma spec |
| [`termfy-api`](skills/termfy-api/SKILL.md) | client HTTP de serviço externo com token do cofre |
| [`termfy-database`](skills/termfy-database/SKILL.md) | SQLite em `~/.<bin>/data.db`, só quando a pessoa pede, com migrations embutidas |
| [`termfy-command-set`](skills/termfy-command-set/SKILL.md) | família `recurso verbo` com tools e screen |
| [`termfy-cli`](skills/termfy-cli/SKILL.md) | comandos, opções, saída texto/JSON, códigos de saída, `--skill` e OpenCLI |
| [`termfy-tui`](skills/termfy-tui/SKILL.md) | telas, componentes, tema modern unix e testes por frame |
| [`termfy-mcp`](skills/termfy-mcp/SKILL.md) | tools, resources, prompts, stdio e testes com o Client do SDK |
| [`termfy-config`](skills/termfy-config/SKILL.md) | settings.json, cofre cifrado, chave mestra e variáveis |
| [`termfy-test`](skills/termfy-test/SKILL.md) | testes de CLI, MCP, TUI e config |
| [`termfy-review`](skills/termfy-review/SKILL.md) | auditoria da entrega por gravidade, sem editar |
| [`termfy-docs`](skills/termfy-docs/SKILL.md) | documentação embutida: cobertura, leitura como agente, `docs:check` |
| [`termfy-release`](skills/termfy-release/SKILL.md) | versão, changelog, tag e release com binários |
| [`termfy-mcp-client`](skills/termfy-mcp-client/SKILL.md) | configuração nos clientes de agente |

Em outro projeto, peça ao agente para instalar as skills do repositório
`https://github.com/promovaweb/termfy` e abrir `termfy-init`. O agente
precisa ter acesso de leitura ao repositório privado.

## Guia e ebook

O guia em [`docs/user/`](docs/user/README.md) tem nove capítulos, da visão
geral à publicação. Ele é compilado em PDF e EPUB em [`ebook/`](ebook/) com o
design system de PDF da Promovaweb:

```bash
bun install
bun run ebook           # gera Termfy-Guia-do-Framework-v<versão>.{pdf,epub}
bun run ebook:verify    # confere sem gerar
```

Requer Pandoc, WeasyPrint, ImageMagick, xmllint, poppler-utils e unzip.

## Compatibilidade

| Framework | Starter kit |
| --- | --- |
| 0.8.0 | 0.8.x |
| 0.7.0 | 0.7.x |
| 0.6.0 | 0.6.x |
| 0.5.0 | 0.5.x |
| 0.4.1 | 0.4.x |
| 0.4.0 | 0.3.x |
| 0.3.0 | 0.3.x |
| 0.2.1 | 0.2.x |
| 0.2.0 | 0.1.x |

As skills citam caminhos do starter kit. Quando a estrutura dele mudar, as
skills e esta tabela mudam na mesma janela.

## Validar

```bash
bun run validate    # skills:validate + skills:check-paths + ebook:verify
bun run skills:check-paths ../termfy-starter-kit
```

A checagem de compatibilidade lê os caminhos e os scripts citados em
`skills/*/SKILL.md` e em `skills/*/references/*.md`, apenas no nível raiz
de `references/`. Sem argumento, usa `../termfy-starter-kit`. Caminhos com
`<name>` e globs precisam corresponder a ao menos um caminho existente.
Comandos como `bun run src/main.ts` são conferidos como arquivos.

O job `compatibilidade` do CI exige o secret `STARTER_KIT_TOKEN` com acesso
de leitura ao repositório privado `promovaweb/termfy-starter-kit`. Os checkouts
ficam em pastas irmãs dentro do workspace, conforme o suporte a
[múltiplos repositórios do actions/checkout](https://github.com/actions/checkout#checkout-multiple-repos-side-by-side).
A partir da pasta `termfy`, o comando usa `../termfy-starter-kit`.

A checagem não usa exceções para a spec: os caminhos e scripts já existem
no starter kit 0.5.0. Ela confere existência, não assinaturas de funções,
campos de dados nem comportamento; revise esses pontos contra o código.

## Estrutura

```text
skills/        dezoito skills, cada uma com SKILL.md e references/
docs/user/     guia do framework, fonte do ebook
ebook/         PDF, EPUB, aliases, VERSION e build.json
.ebook/        pipeline do ebook (Pandoc + WeasyPrint), CSS e template
scripts/       validate-skills.ts e check-skills-against-starter-kit.ts
```

## Licença

Repositório privado da Promovaweb. Uso interno e dos alunos autorizados. A
documentação copiada de terceiros em `references/` mantém as licenças
originais (MIT).
