# Skills do Termfy

Oito skills ensinam um agente a criar e evoluir um binário derivado do
starter kit. Cada pasta tem `SKILL.md` (instruções) e `references/`
(material de apoio, incluindo documentação oficial copiada do OpenTUI, da
OpenCLI, do MCP TypeScript SDK e da especificação MCP, em pastas marcadas
com `.terceiros`).

## Para que serve cada uma e como funciona

| Skill | Para que serve | Como funciona |
| --- | --- | --- |
| [`termfy-init`](termfy-init/SKILL.md) | criar o binário a partir do template | roda `bun run init` com a identidade, atualiza as skills, chama `termfy-spec`, confere os três modos, valida e prepara o primeiro commit |
| [`termfy-brand`](termfy-brand/SKILL.md) | ajustar como o binário se apresenta | altera o bloco `termfy` do `package.json`, créditos em `src/app/manifest.ts` e paleta em `src/tui/theme.ts`; confere `--version`, `about`, aba About, OpenCLI e MCP |
| [`termfy-spec`](termfy-spec/SKILL.md) | registrar o que será construído | entrevista em nove blocos e grava `CLISPEC.md` no contrato de `docs/spec.md`; `spec check` valida contra o código |
| [`termfy-cli`](termfy-cli/SKILL.md) | criar e alterar commands | copia o stub, preenche o registry, implementa `run`, registra, testa em subprocesso, regenera o OpenCLI e marca a checklist da spec |
| [`termfy-tui`](termfy-tui/SKILL.md) | criar e alterar screens | copia o stub, monta com os componentes e o tema, registra a aba, testa por frame com o renderer de teste |
| [`termfy-mcp`](termfy-mcp/SKILL.md) | expor tools, resources e prompts | copia o stub, declara schema Zod, registra no catalog, testa com o `Client` do SDK e o Inspector |
| [`termfy-config`](termfy-config/SKILL.md) | settings e credenciais | declara keys no `SETTINGS_SCHEMA`, consome credenciais com `getCredential()`, cuida da master key e da rotação |
| [`termfy-docs`](termfy-docs/SKILL.md) | melhorar a documentação embutida | lê o `--skill` como um agente leria, corrige a cobertura apontada por `docs:check`, reescreve seções fracas e regenera o OpenCLI |

## Sequência de uso

O guia do framework tem um capítulo só sobre isso
(`docs/user/09-workflow.md`). Em resumo:

1. `termfy-init` uma vez, ao criar o repositório.
2. `termfy-brand` quando a identidade mudar (nome, descrição, cores,
   créditos).
3. `termfy-spec` antes de cada rodada de implementação: sem entrada na spec,
   as skills de implementação não começam.
4. `termfy-cli`, `termfy-tui`, `termfy-mcp` e `termfy-config`, uma entrega
   por vez, marcando a checklist da spec.
5. `termfy-docs` ao fechar a rodada, antes da release.
6. Release conforme `docs/release.md` do starter kit.

## Forma comum

Frontmatter com `name` igual ao nome da pasta e `description`. Seções:
leitura prévia, regras, passos, marcos, saída e compatibilidade. Caminhos
citados apontam para o starter kit, onde a skill é executada. A seção
"Compatibilidade" declara a faixa do starter kit coberta;
`bun run skills:check-paths` confere os caminhos contra ele.

## Instalação

```bash
npx skills add https://github.com/promovaweb/termfy
```

O starter kit já vem com as skills instaladas e os scripts
`skills:install`, `skills:update` e `skills:check`.

Validação da estrutura e dos links: `bun run skills:validate`.
