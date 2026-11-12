# termfy-command-set

A skill `termfy-command-set` entrega uma família de commands de uma vez:
`orders list`, `show`, `create`, `update` e `delete`, ou só os verbos que a
spec aberta prevê. Ela extrai as operações para funções compartilhadas e
cria os três adaptadores: o command no CLI, a tool espelhada no MCP e a
screen de lista na TUI. No fim, você tem um recurso disponível nos três
modos, com testes em cada um e os itens da spec marcados.

## Quando usar

- A spec aberta descreve um recurso inteiro, como pedidos, com verbos,
  tools e screen.
- Você quer que `mycli orders list`, a tool `orders_list` e a screen
  `orders` mostrem o mesmo resultado.
- Um recurso existe só no CLI e precisa ganhar tool e screen.

Para um command isolado, sem tool nem screen, use
[termfy-cli](termfy-cli.md). Para só uma tool, use [termfy-mcp](termfy-mcp.md).
Para só uma tela, use [termfy-tui](termfy-tui.md). O client HTTP do serviço
sai antes, pela [termfy-api](termfy-api.md).

## Como pedir

Para a família completa nos três modos:

> Use a skill termfy-command-set para entregar `orders list` e
> `orders show` com as tools `orders_list` e `orders_show` e a screen
> `orders`, conforme a spec aberta.

Para um recurso que só tem leitura no CLI:

> Use a skill termfy-command-set para acrescentar a tool `orders_list` e a
> screen `orders` à família `orders` que já existe no CLI.

Para verbos de gravação:

> Use a skill termfy-command-set para entregar `orders create` e
> `orders_create` com `--yes` e `dryRun`, como a spec define.

## O que a skill faz

1. Roda `git status --short` e relaciona cada verbo e cada modo aos itens
   de Tasks e Tests da spec aberta em `specs/`.
2. Implementa as operações compartilhadas em módulo próprio sob `src/`,
   separado dos adaptadores. Se houver HTTP, usa o client da `termfy-api`.
3. Cria `src/cli/commands/orders.ts` a partir de
   `template/command/example.ts` e acrescenta o agrupador aos
   `subcommands` da raiz em `src/cli/commands.ts`.
4. Cria `src/mcp/tools/orders.ts` a partir de `template/tool/example.ts` e
   chama `registerOrdersTools` em `registerAll`, no `src/mcp/server.ts`.
5. Cria `src/tui/screens/orders.ts` a partir de
   `template/screen/example.ts` e registra a screen em
   `src/tui/screens/index.ts`. Se ela puder abrir primeiro, acrescenta
   `orders` em `tui.initialTab` e em `--tab`.
6. Escreve os testes: CLI em subprocesso, MCP com `Client` e TUI com
   `createTestRenderer` e `mountTui`.
7. Atualiza `docs/cli.md`, `docs/mcp.md` e `docs/tui.md`. Roda
   `bun run opencli`, `bun test`, `bun run typecheck` e `bun run docs:check`.
8. Marca `[x]` nos itens testados e roda `bun run validate` no fim.

## Exemplo

A função `listOrders({ limit, status })` vem do client da loja. O command
`orders list` valida as options e chama a função:

```ts
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { table } from "../format.ts";
import type { Command } from "../registry.ts";
import { listOrders } from "../../api/shop.ts";

const listCommand: Command = {
  name: "list",
  description: "List shop orders.",
  options: [
    { name: "--limit", argument: { name: "n" }, default: "10",
      description: "Maximum number of orders, from 1 to 50. Default 10." },
    { name: "--status", argument: { name: "status", values: ["open", "paid", "shipped"] },
      description: "Only orders with this status. Absent means every status." },
  ],
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API],
  examples: [`${manifest.bin} orders list`, `${manifest.bin} orders list --status open --json`],
  run: async (ctx) => {
    const limit = Number(ctx.options.limit ?? 10);
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw error.usage("--limit must be an integer from 1 to 50.");
    }
    const status = typeof ctx.options.status === "string" ? ctx.options.status : undefined;
    const page = await listOrders({ limit, status });
    const data = { count: page.items.length, orders: page.items, nextCursor: page.nextCursor };
    return { data, text: () => table(page.items.map((o) => [o.id, o.status])) };
  },
};

export const ordersCommand: Command = {
  name: "orders",
  description: "Query shop orders.",
  subcommands: [listCommand],
};
```

A tool `orders_list` chama a mesma função e devolve o mesmo objeto:

```ts
import { z } from "zod";
import { AppError } from "../../app/errors.ts";
import { listOrders } from "../../api/shop.ts";
import type { Registrar } from "../server.ts";

const description = "Use when the user asks about shop orders. Returns count, orders and nextCursor.";

export function registerOrdersTools({ server, catalog }: Registrar): void {
  catalog.tools.push({ name: "orders_list", description });
  server.registerTool("orders_list", {
    title: "List orders",
    description,
    inputSchema: {
      limit: z.number().int().min(1).max(50).optional().describe("Maximum number of orders. Default 10."),
      status: z.enum(["open", "paid", "shipped"]).optional().describe("Only orders with this status."),
    },
  }, async ({ limit, status }) => {
    try {
      const page = await listOrders({ limit: limit ?? 10, status });
      const d = { count: page.items.length, orders: page.items, nextCursor: page.nextCursor };
      return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }], structuredContent: d };
    } catch (e) {
      if (!(e instanceof AppError)) throw e;
      return { content: [{ type: "text", text: e.message }], isError: true };
    }
  });
}
```

Na screen `orders`, `mount` devolve um container síncrono. A carga roda em
`onEnter` e recria o `listPanel` quando a resposta chega, porque ele não tem
método para trocar os items. A geração descarta respostas que chegam depois
de `onLeave`.

A saída nos dois formatos do CLI:

```console
$ mycli orders list --status open
  o1  open
  o7  open
$ mycli orders list --status open --json
{
  "ok": true,
  "command": "mycli orders list",
  "data": {
    "count": 2,
    "orders": [{ "id": "o1", "status": "open" }, { "id": "o7", "status": "open" }],
    "nextCursor": null
  }
}
$ mycli orders list --limit 0
error --limit must be an integer from 1 to 50. [2 USAGE]
Use "mycli orders list --help".
```

## Regras que a skill segue

- **Só os verbos da spec.** A skill gera o subconjunto combinado na Surface.
  Verbo criado por simetria vira código sem teste nem dono.
- **Uma função, três adaptadores.** A tool não chama `Command.run` e a
  screen não executa a CLI em subprocesso. Formatação e protocolo ficam nos
  adaptadores para o domínio responder igual nos três modos.
- **Defaults aplicados em `run`.** `OptionDefinition.default` só documenta.
  O parser não preenche `ctx.options`, então `run` resolve o padrão.
- **`--json` não se repete.** Ela é global e chega a todas as folhas.
- **Exit codes por folha.** Cada verbo declara os seus em `exitCodes`. O
  agrupador não repassa códigos para as folhas.
- **Tool com Zod descrito.** Cada campo tem `.describe()` e a tool entra em
  `catalog.tools`, senão `mcp --list` não a mostra.
- **Gravação sem prompt na tool.** Confirmação ou `dryRun` são implementados
  na própria tool, porque um agente não responde a prompt de terminal.
- **Falha não vira lista vazia.** Erro aparece como erro no CLI, como
  `isError: true` na tool e como estado de erro na screen.
- **Mesma expectativa nos testes.** Os três modos usam a mesma fonte local
  controlada, sem rede real nem o cofre da pessoa.

## O que ela entrega

A skill relata verbos e modos entregues, arquivos, contratos de `data`,
itens marcados e o resultado da validação. Inclui exemplos em texto e JSON,
os nomes das tools e um frame da screen.

| Arquivo | Mudança |
| --- | --- |
| `src/cli/commands/orders.ts` | agrupador e folhas novos |
| `src/cli/commands.ts` | `ordersCommand` nos `subcommands` da raiz |
| `src/mcp/tools/orders.ts` | `registerOrdersTools` com as tools |
| `src/mcp/server.ts` | chamada em `registerAll` |
| `src/tui/screens/orders.ts` | screen de lista |
| `src/tui/screens/index.ts` | screen na lista de abas |
| `tests/` e `docs/` | testes dos três modos e capítulos atualizados |
| `docs/opencli.json` | regenerado por `bun run opencli` |

## Próxima skill

Para ajustar detalhes de cada modo, siga com [termfy-cli](termfy-cli.md),
[termfy-mcp](termfy-mcp.md) ou [termfy-tui](termfy-tui.md). Se a família
trouxe settings ou credenciais novas, confira com
[termfy-config](termfy-config.md).
