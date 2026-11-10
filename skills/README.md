# Skills do Termfy

Seis skills ensinam um agente a criar e evoluir um binário derivado do
starter kit. Cada pasta tem `SKILL.md` (instruções) e `references/`
(material de apoio, incluindo documentação oficial copiada do OpenTUI, da
OpenCLI, do MCP TypeScript SDK e da especificação MCP, em pastas marcadas
com `.terceiros`).

| Skill | Quando usar |
| --- | --- |
| [`termfy-spec`](termfy-spec/SKILL.md) | entrevistar a pessoa e montar o `CLISPEC.md` antes de implementar |
| [`termfy-init`](termfy-init/SKILL.md) | personalizar o starter kit e preparar o primeiro commit |
| [`termfy-cli`](termfy-cli/SKILL.md) | comandos, opções, saída texto/JSON, códigos de saída, `--skill` e OpenCLI |
| [`termfy-tui`](termfy-tui/SKILL.md) | telas, componentes, tema modern unix e testes por frame |
| [`termfy-mcp`](termfy-mcp/SKILL.md) | tools, resources, prompts, stdio e testes com o Client do SDK |
| [`termfy-config`](termfy-config/SKILL.md) | settings.json, cofre cifrado, chave mestra e variáveis |

## Forma comum

Frontmatter com `name` igual ao nome da pasta e `description`. Seções:
leitura prévia, regras, passos, marcos e saída. Caminhos citados apontam
para o starter kit, onde a skill é executada. A seção "Compatibilidade"
declara a faixa do starter kit coberta.

## Instalação

```bash
npx skills add https://github.com/promovaweb/termfy
```

O starter kit já vem com as skills instaladas e os scripts
`skills:install`, `skills:update` e `skills:check`.

Validação da estrutura e dos links: `bun run skills:validate`.
