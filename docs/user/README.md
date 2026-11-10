# Termfy

Guia do framework da Promovaweb para ferramentas de terminal em Bun. Um
executável, três modos: TUI para pessoas, CLI para scripts e agentes, servidor
MCP para agentes de IA. Este guia explica o método; o código vive no starter
kit e as instruções operacionais vivem nas skills.

| Capítulo | Pergunta que responde |
| --- | --- |
| [Visão geral](00-overview.md) | O que é o Termfy e de que peças ele é feito? |
| [Começar](01-getting-started.md) | Como criar um binário novo em dez minutos? |
| [Três modos](02-three-modes.md) | Como um só executável decide entre TUI, CLI e MCP? |
| [CLI](03-cli.md) | Como comandos, opções, saída e códigos de saída se mantêm coerentes? |
| [TUI](04-tui.md) | Como as telas são montadas e por que elas parecem modern unix? |
| [MCP](05-mcp.md) | O que o binário expõe a um agente e com quais regras? |
| [Configuração e credenciais](06-configuration-and-credentials.md) | Onde ficam preferências e segredos e o que a cifra protege? |
| [Skills](07-skills.md) | Como as skills orientam um agente e como são atualizadas? |
| [Publicar](08-publishing.md) | Como versionar, compilar e lançar o binário e o framework? |
| [Sequência das skills](09-workflow.md) | Qual é a ordem de uso das oito skills e o que cada uma deixa pronta para a seguinte? |

Repositórios: [`promovaweb/termfy`](https://github.com/promovaweb/termfy)
(framework, skills e este guia) e
[`promovaweb/termfy-starter-kit`](https://github.com/promovaweb/termfy-starter-kit)
(esqueleto, template do GitHub).
