# Skills do Termfy

Cinco skills ensinam um agente a criar e evoluir um binário derivado deste
template. Cada pasta tem `SKILL.md` (instruções) e `references/` (material
de apoio, incluindo documentação oficial copiada do OpenTUI, da OpenCLI, do
MCP TypeScript SDK e da especificação MCP).

| Skill | Quando usar |
| --- | --- |
| [`termfy-iniciar`](termfy-iniciar/SKILL.md) | criar o binário a partir do template e preparar o primeiro commit |
| [`termfy-cli`](termfy-cli/SKILL.md) | comandos, opções, saída texto/JSON, códigos de saída, `--skill` e OpenCLI |
| [`termfy-tui`](termfy-tui/SKILL.md) | telas, componentes, tema modern unix e testes por frame |
| [`termfy-mcp`](termfy-mcp/SKILL.md) | tools, resources, prompts, stdio e testes com o Client do SDK |
| [`termfy-config`](termfy-config/SKILL.md) | settings.json, cofre cifrado, chave mestra e variáveis |

Instalação em outro projeto:

```bash
npx skills add https://github.com/promovaweb/termfy
```

Validação da estrutura e dos links: `bun run skills:validar`.
