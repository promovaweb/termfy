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

1. No GitHub, **Use this template** em `promovaweb/termfy-starter-kit`.
2. No clone:

   ```bash
   bun install
   bun run init -- --name mycli --title "My CLI" --description "Query and update shop orders." --author "Promovaweb" --repository https://github.com/promovaweb/mycli
   bun run opencli
   ```

3. Rode `termfy-spec` com o agente para atualizar `CLISPEC.md`, inclusive
   `bin` e `description`, que `init` não altera. Implemente as entregas
   planejadas e rode `bun run validate` antes de publicar. O agente lê
   `AGENTS.md` e as skills em `.agents/skills/termfy-*`.

Atualize as skills no projeto derivado com `bun run skills:update`.

## Skills

| Skill | Quando usar |
| --- | --- |
| [`termfy-spec`](skills/termfy-spec/SKILL.md) | especificar o produto e revisar o contrato CLISPEC |
| [`termfy-build`](skills/termfy-build/SKILL.md) | porta de entrada do vibecoding: descreva a ferramenta e ela conduz o ciclo |
| [`termfy-init`](skills/termfy-init/SKILL.md) | personalizar o starter kit e preparar o primeiro commit |
| [`termfy-brand`](skills/termfy-brand/SKILL.md) | nome, título, descrição, autor, links, créditos e paleta |
| [`termfy-cli`](skills/termfy-cli/SKILL.md) | comandos, opções, saída texto/JSON, códigos de saída, `--skill` e OpenCLI |
| [`termfy-tui`](skills/termfy-tui/SKILL.md) | telas, componentes, tema modern unix e testes por frame |
| [`termfy-mcp`](skills/termfy-mcp/SKILL.md) | tools, resources, prompts, stdio e testes com o Client do SDK |
| [`termfy-config`](skills/termfy-config/SKILL.md) | settings.json, cofre cifrado, chave mestra e variáveis |
| [`termfy-test`](skills/termfy-test/SKILL.md) | testes de CLI, MCP, TUI e config |
| [`termfy-review`](skills/termfy-review/SKILL.md) | auditoria da entrega por gravidade, sem editar |
| [`termfy-docs`](skills/termfy-docs/SKILL.md) | documentação embutida: cobertura, leitura como agente, `docs:check` |
| [`termfy-release`](skills/termfy-release/SKILL.md) | versão, changelog, tag e release com binários |
| [`termfy-mcp-client`](skills/termfy-mcp-client/SKILL.md) | configuração nos clientes de agente |

Instalação em qualquer projeto:

```bash
npx skills add https://github.com/promovaweb/termfy
```

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
skills/        seis skills, cada uma com SKILL.md e references/
docs/user/     guia do framework, fonte do ebook
ebook/         PDF, EPUB, aliases, VERSION e build.json
.ebook/        pipeline do ebook (Pandoc + WeasyPrint), CSS e template
scripts/       validate-skills.ts e check-skills-against-starter-kit.ts
```

## Licença

Repositório privado da Promovaweb. Uso interno e dos alunos autorizados. A
documentação copiada de terceiros em `references/` mantém as licenças
originais (MIT).
