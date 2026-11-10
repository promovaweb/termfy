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
   bun run iniciar -- --nome meucli --titulo "Meu CLI" --descricao "O que ele faz." --autor "Promovaweb" --repositorio https://github.com/promovaweb/meucli
   bun run validar
   ```

3. Peça ao agente a próxima tarefa. Ele lê `AGENTS.md` e as skills em
   `.agents/skills/termfy-*`.

Atualize as skills no projeto derivado com `bun run skills:update`.

## Skills

| Skill | Quando usar |
| --- | --- |
| [`termfy-iniciar`](skills/termfy-iniciar/SKILL.md) | personalizar o starter kit e preparar o primeiro commit |
| [`termfy-cli`](skills/termfy-cli/SKILL.md) | comandos, opções, saída texto/JSON, códigos de saída, `--skill` e OpenCLI |
| [`termfy-tui`](skills/termfy-tui/SKILL.md) | telas, componentes, tema modern unix e testes por frame |
| [`termfy-mcp`](skills/termfy-mcp/SKILL.md) | tools, resources, prompts, stdio e testes com o Client do SDK |
| [`termfy-config`](skills/termfy-config/SKILL.md) | settings.json, cofre cifrado, chave mestra e variáveis |

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
| 0.2.x | 0.1.x |

As skills citam caminhos do starter kit. Quando a estrutura dele mudar, as
skills e esta tabela mudam na mesma janela.

## Validar

```bash
bun run validar    # skills:validar + ebook:verify
```

## Estrutura

```text
skills/        cinco skills, cada uma com SKILL.md e references/
docs/user/     guia do framework, fonte do ebook
ebook/         PDF, EPUB, aliases, VERSION e build.json
.ebook/        pipeline do ebook (Pandoc + WeasyPrint), CSS e template
scripts/       validar-skills.ts
```

## Licença

Repositório privado da Promovaweb. Uso interno e dos alunos autorizados. A
documentação copiada de terceiros em `references/` mantém as licenças
originais (MIT).
