# termfy-spec

A skill `termfy-spec` entrevista você sobre uma evolução do binário e
escreve a spec dela em `specs/NNNN-slug.md`, em Markdown puro. A spec diz
como o binário vai funcionar depois da mudança (`## Behavior` e
`## Surface`) e como o código deve ser feito (`## Design`). As seções
`## Tasks` e `## Tests` transformam isso em entregas verificáveis. No fim,
você tem uma spec que as skills de implementação leem antes de alterar o
código, sem precisar voltar a perguntar.

## Quando usar

Use a `termfy-spec` nestas situações:

- Antes de implementar um command, screen, tool, setting, credencial ou
  tabela, quando nenhuma spec aberta cobre o pedido.
- Para detalhar uma spec `draft` criada pela
  [termfy-clispec](termfy-clispec.md).
- Para adotar código que já existe sem spec, com uma spec de adoção.
- Para fechar uma spec com todos os itens marcados ou arquivar uma spec
  abandonada.

Prefira outra skill nestes casos:

- O projeto ainda não tem `CLISPEC.md`: passe antes pela
  [termfy-clispec](termfy-clispec.md).
- O ponto de partida é a documentação de uma API: use a
  [termfy-api-import](termfy-api-import.md), que grava a spec no mesmo
  formato.
- A mudança afeta o propósito, os públicos ou os limites do binário: volte
  à [termfy-clispec](termfy-clispec.md).

## Como pedir

Para detalhar a spec criada pela visão macro:

> Use a skill termfy-spec para detalhar a spec 0002 do mycli, a listagem
> de pedidos com filtro por status.

Para uma evolução nova:

> Use a skill termfy-spec para o mycli exportar os pedidos de um período em
> CSV, com uma tool MCP para o agente pedir o mesmo arquivo.

Para fechar uma spec concluída:

> Use a skill termfy-spec para fechar a spec 0002 do mycli.

## O que a skill faz

1. Roda `git status --short` e lê o `CLISPEC.md` e os arquivos de
   `specs/`. Sem `CLISPEC.md`, encaminha para a `termfy-clispec`.
2. Abre a spec que a `termfy-clispec` já criou. Se ela não existe, escolhe
   o próximo número livre de quatro dígitos, grava `specs/NNNN-slug.md`
   com `Status: draft` e acrescenta a linha ao índice `## Specs`.
3. Conduz a entrevista em seis blocos: objetivo, comportamento,
   superfície, integrações e armazenamento, desenho do código e aceite.
   No comportamento, pede um exemplo concreto de uso, do jeito que você
   digitaria.
4. A cada bloco respondido, escreve a seção correspondente e mostra o
   trecho para você.
5. Faz a conferência manual: título e status iguais no índice, seções na
   ordem, Surface com os campos das tabelas e cada item de Surface citado em
   uma tarefa ou teste.
6. Relê a spec inteira com você e lista as dúvidas de `## Notes`.
7. Ao seguir para a implementação, troca o status para `in_progress` na
   spec e no índice. Indica a skill da primeira tarefa pendente.
8. No fim da implementação, com todos os itens `[x]`, fecha a spec: aplica
   a Surface às tabelas do `CLISPEC.md`, troca o status para `done` e
   acrescenta a linha datada às Notes do `CLISPEC.md`.

## Exemplo

A spec `specs/0002-orders-list.md` do `mycli`, no meio da implementação:

```markdown
# 0002 Listar pedidos

Status: in_progress

## Goal

O operador da loja precisa ver os pedidos abertos sem abrir o painel web.
Criar ou cancelar pedidos fica fora desta spec.

## Behavior

`mycli orders list` imprime uma tabela com número, cliente, total e status
dos pedidos abertos. `--status closed` troca o filtro. Com `--json`,
devolve `{ count, orders[] }`. Sem `shop.token` no cofre, sai com 4 e
sugere `mycli credentials set shop.token`. Com a API fora do ar depois de
três tentativas, sai com 5. Na TUI, a screen `orders` mostra a lista em um
`listPanel`; `↑` e `↓` movem a seleção e `Enter` abre o detalhe. A tool
`orders_list` recebe `{ status? }`, devolve o mesmo `{ count, orders[] }`
e marca `isError` quando a API falha.

## Design

- `shop/orders.ts`: `listOrders(status)`, usada pelo command, pela tool e
  pela screen.
- `shop/client.ts`: client HTTP da spec 0001; sem mudança.
- `cli/commands/orders.ts`: grupo `orders` com o subcommand `list`.
- `mcp/tools/orders.ts`: tool `orders_list`.
- `tui/screens/orders.ts`: screen `orders`.
- Sem dependência nova.
- Token ausente vira `AppError` 4; falha de rede, 5.

## Surface

- Adiciona o command `orders list`: List shop orders;
  `--status <open|closed>` (padrão `open`); `data` `{ count, orders[] }`;
  exit codes 4 e 5; credencial `shop.token`.
- Adiciona a screen `orders`: pedidos com o detalhe do selecionado;
  teclas `↑` `↓`, `Enter`.
- Adiciona a tool `orders_list`: espelha `orders list`; efeito `network`.
- Altera a credencial `shop.token`: usada por `orders list` e
  `orders_list`.

## Tasks

- [x] `listOrders` com filtro de status `#termfy-api`
- [x] Command `orders list` `#termfy-cli`
- [ ] Tool `orders_list` `#termfy-mcp`
- [ ] Screen `orders` `#termfy-tui`

## Tests

- [x] `mycli orders list --json` devolve `{ count, orders[] }`
- [x] Sem `shop.token`, `orders list` sai com exit code 4
- [ ] `mcp --list` mostra `orders_list`
- [ ] A screen `orders` abre o detalhe com `Enter`

## Notes

- 2026-11-12: `--status` aceita só `open` e `closed`; a API não tem outro.
```

A spec percorre este ciclo, por edição direta dos arquivos:

| Passo | O que muda |
| --- | --- |
| criar | arquivo novo como `draft` e linha no índice do `CLISPEC.md` |
| começar | `Status: in_progress` na spec e no índice |
| avançar | `[x]` em cada tarefa e teste concluídos |
| fechar | Surface aplicada ao `CLISPEC.md`, status `done` e linha `- 2026-11-20: spec 0002 (Listar pedidos) closed.` nas Notes |
| arquivar | status `archived`, motivo em Notes e Surface descartada |

## Regras que a skill segue

- **Entrevista antes de escrever.** A spec registra o que você pediu, não o
  que o agente imagina. Dúvida sem resposta vai datada para `## Notes` e a
  spec fica em `draft`.
- **Uma spec por evolução entregável.** Se o pedido junta capacidades
  independentes, a skill propõe specs separadas. Assim, cada uma fecha
  sozinha.
- **Surface com os nomes do código.** Cada item começa por Adiciona, Altera
  ou Remove. Um command traz função, options, `data` do `--json`, exit
  codes e credenciais. Uma tool traz o efeito (`read`, `write` ou
  `network`). Os campos batem com as tabelas do `CLISPEC.md` para o
  fechamento ser uma cópia direta. Spec sem mudança de superfície escreve
  `Nenhuma mudança de superfície.`
- **Behavior e Design com texto antes de `in_progress`.** Behavior responde
  "como se usa"; Design responde "onde e como se constrói". Comentário HTML
  ou texto de exemplo vale como vazio, porque a skill que implementa
  precisaria voltar a perguntar.
- **Exit codes de `src/app/exit-codes.ts`.** Uma família nova entra como
  tarefa da spec, implementada antes do command que a usa. Scripts e
  agentes reagem ao número, então ele precisa existir antes.
- **Banco só quando você pede.** SQLite entra quando você diz que precisa
  guardar algo entre execuções. Nesse caso, Surface lista tabelas, colunas
  e tipos. O Design descreve `~/.<bin>/data.db` e a migration nova. A
  tarefa leva a tag `#termfy-database`.
- **Uma tarefa por entrega, com a tag da skill.** Cada item de `## Tasks`
  é um checkbox GFM com a tag no fim (`#termfy-cli`, `#termfy-mcp`). Cada
  item de `## Tests` é um comando com o resultado esperado. Item novo entra
  no fim da seção.
- **Marcar só o que foi feito.** A entrevista cria itens `[ ]`. A skill que
  implementa e testa troca para `[x]`. Descrever uma entrega não a conclui.
- **Spec parada continua `in_progress`.** Quando uma dependência externa
  trava o trabalho, o motivo entra datado em Notes. O status reflete o
  estado real do trabalho.
- **Markdown puro.** Sem front matter, schema ou IDs de item. O binário
  não lê esses arquivos e não tem command para editá-los; o agente edita
  direto.

## O que ela entrega

A skill relata:

- o caminho e o status da spec;
- a contagem de itens de Surface (adiciona, altera, remove);
- o número de tarefas e de testes;
- o resultado da conferência manual;
- as dúvidas abertas;
- a skill sugerida para a primeira tarefa.

Arquivos que mudam: `specs/NNNN-slug.md` e o índice `## Specs` do
`CLISPEC.md`. No fechamento, também as tabelas de Surface e as Notes do
`CLISPEC.md`.

## Próxima skill

Siga pela tag da primeira tarefa pendente, na ordem config, api, database,
cli, mcp e tui: a `termfy-config`, a `termfy-api`, a `termfy-database`, a
`termfy-cli` (ou a `termfy-command-set` para uma família `recurso verbo`),
a `termfy-mcp` e a `termfy-tui`. Depois de cada tarefa, a `termfy-test`
marca os itens de Tests. Para voltar ao ciclo completo, use a
[termfy](termfy.md).
