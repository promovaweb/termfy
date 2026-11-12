# Termfy

Este guia ensina você a construir uma ferramenta de terminal com o Termfy,
o framework da Promovaweb para binários em Bun. Cada binário é um único
executável com três modos. A TUI é operada pelo teclado. A CLI atende
pessoas, scripts e agentes. O servidor MCP atende agentes de IA. Você não
escreve esse código sozinho: descreve ao agente o que precisa. As 18
skills do Termfy conduzem cada etapa, da entrevista inicial à release.

Os exemplos do guia usam o `mycli`, um binário que consulta os pedidos de
uma loja. O capítulo de integração usa a API de WhatsApp da uazapi. As saídas
do esqueleto vêm do starter kit em execução. Na Parte 2, as saídas dos
commands novos mostram o comportamento que a spec descreve.

## Como ler este guia

O guia tem três partes. Se é a sua primeira vez com o Termfy, leia a
Parte 1 e siga a Parte 2 na ordem. A Parte 3 é para consulta.

### Parte 1. Fundamentos

O que o Termfy é, como um executável atende três públicos e como as skills
orientam o agente.

| Capítulo | Pergunta que responde |
| --- | --- |
| [Visão geral](00-overview.md) | De que peças o Termfy é feito? |
| [Começar](01-getting-started.md) | Como criar um binário e ver os três modos funcionando? |
| [Três modos](02-three-modes.md) | Como um só executável decide entre TUI, CLI e MCP? |
| [Skills](07-skills.md) | Como as skills orientam um agente e como são atualizadas? |
| [Sequência das skills](09-workflow.md) | Qual é a ordem das skills e o que cada uma entrega à seguinte? |

### Parte 2. Construir

O caminho de uma evolução, da descrição ao binário publicado, com os
pedidos ao agente, os documentos gravados e o código que ele escreve.

| Capítulo | O que você aprende |
| --- | --- |
| [Descrever e especificar](10-describe-and-specify.md) | a entrevista do `CLISPEC.md`, a spec de uma evolução e o ciclo dos status |
| [Integrar uma API](11-integrate-an-api.md) | importar a API da uazapi, guardar o token, escrever o client e passar a instância por parâmetro |
| [Guardar dados](12-store-data.md) | quando pedir um banco SQLite, migrations embutidas e repositórios |
| [Testar, revisar e publicar](13-test-review-release.md) | testes nos três modos, revisão por gravidade, release e conexão do agente |

### Parte 3. Referência

| Página | Conteúdo |
| --- | --- |
| [CLI](03-cli.md) | registry, options globais, saída em texto e `--json`, exit codes |
| [TUI](04-tui.md) | abas, teclas, tema e componentes |
| [MCP](05-mcp.md) | tools, resources, prompts e regras de segurança |
| [Configuração e credenciais](06-configuration-and-credentials.md) | `settings.json`, cofre cifrado e master key |
| [Publicar](08-publishing.md) | versão, changelog, tag e binários |
| [Glossário e problemas comuns](14-glossary-and-troubleshooting.md) | termos do framework e soluções para os erros frequentes |

### Uma página por skill

Cada página diz quando usar a skill, como pedir, o que ela faz, um exemplo
do que ela produz, as regras que segue e para onde o fluxo vai depois.

| Etapa | Skills |
| --- | --- |
| começar | [termfy](skills/termfy.md), [termfy-init](skills/termfy-init.md), [termfy-brand](skills/termfy-brand.md) |
| descrever | [termfy-clispec](skills/termfy-clispec.md), [termfy-spec](skills/termfy-spec.md), [termfy-api-import](skills/termfy-api-import.md) |
| implementar | [termfy-cli](skills/termfy-cli.md), [termfy-tui](skills/termfy-tui.md), [termfy-mcp](skills/termfy-mcp.md), [termfy-config](skills/termfy-config.md), [termfy-api](skills/termfy-api.md), [termfy-database](skills/termfy-database.md), [termfy-command-set](skills/termfy-command-set.md) |
| verificar | [termfy-test](skills/termfy-test.md), [termfy-review](skills/termfy-review.md), [termfy-docs](skills/termfy-docs.md) |
| entregar | [termfy-release](skills/termfy-release.md), [termfy-mcp-client](skills/termfy-mcp-client.md) |

## Repositórios

- [`promovaweb/termfy`](https://github.com/promovaweb/termfy): framework,
  skills e este guia.
- [`promovaweb/termfy-starter-kit`](https://github.com/promovaweb/termfy-starter-kit):
  esqueleto do binário, template do GitHub.
