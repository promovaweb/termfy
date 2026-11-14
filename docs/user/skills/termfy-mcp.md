# termfy-mcp

A skill `termfy-mcp` expõe funções do seu binário a agentes de IA pelo
Model Context Protocol. O servidor roda em `mycli mcp`, sobre stdio, no
mesmo executável do CLI e da TUI. A skill cria tools, resources e prompts
com schema Zod, paginação, tratamento de erro e testes pelo `Client` do SDK.
No fim, você tem a tool registrada, visível em `mcp --list` e na descoberta
real do protocolo, com resposta em texto e em `structuredContent`.

## Quando usar

- Você quer que um agente consulte pedidos pela tool `orders_list`.
- Uma tool existente precisa de paginação por `limit` e `cursor`, de
  `outputSchema` ou de uma mensagem de erro melhor.
- Você vai expor documentação como resource `<bin>://` ou um prompt.
- Você quer revisar o que já está exposto antes de ligar o servidor num
  agente.

Para entregar a tool junto com o command e a screen do mesmo recurso, use
[termfy-command-set](termfy-command-set.md). Para configurar Claude Code,
Codex ou outro host para usar o servidor, use a skill `termfy-mcp-client`.

## Como pedir

Para uma tool de consulta:

> Use a skill termfy-mcp para criar a tool `orders_list`, com `limit`,
> `status` e `cursor`, que devolve os pedidos da loja.

Para revisar a resposta de uma tool:

> Use a skill termfy-mcp para acrescentar `outputSchema` e anotações à tool
> `orders_list` e garantir que o erro de credencial vira `isError`.

Para uma tool de gravação:

> Use a skill termfy-mcp para criar `orders_cancel` com `dryRun`, como a
> spec define, sem confirmação de terminal.

## O que a skill faz

1. Roda `git status --short` e lê a spec aberta: tools, resources e
   prompts da Surface, com efeito, entrada e saída, mais os itens
   `#termfy-mcp`.
2. Confere a versão real do SDK e apresenta um plano com interfaces,
   serviços reutilizados, campos, efeitos e verificações.
3. Copia `template/tool/example.ts` para `src/mcp/tools/<grupo>.ts`,
   ajusta os imports e escolhe uma receita em `references/examples/`.
4. Implementa a tool chamando o serviço compartilhado, sem copiar a lógica
   do command.
5. Registra a função em `registerAll` (`src/mcp/server.ts`). Depois compara
   o catálogo local com a descoberta real.
6. Testa com o `Client` do SDK em `tests/mcp.test.ts` e, à mão, com
   `npx @modelcontextprotocol/inspector bun run src/main.ts mcp`.
7. Atualiza a tabela de tools em `docs/mcp.md` e a `longDescription` do
   command `mcp` em `src/cli/commands/mcp.ts`.
8. Roda `bun run validate` e marca `[x]` nos itens testados da spec.

## Exemplo

A tool `orders_list` em `src/mcp/tools/orders.ts` projeta só os campos
públicos e declara o schema de saída:

```ts
import { z } from "zod";
import { AppError } from "../../app/errors.ts";
import { listOrders } from "../../api/shop.ts";
import type { Registrar } from "../server.ts";

const description =
  "Use when the user asks about shop orders. Returns up to limit orders " +
  "(id, status) and nextCursor for the next page. Reads the shop API only.";

export function registerOrdersTools({ server, catalog }: Registrar): void {
  catalog.tools.push({ name: "orders_list", description });
  server.registerTool("orders_list", {
    title: "List orders",
    description,
    inputSchema: {
      limit: z.number().int().min(1).max(50).optional().describe("Maximum number of orders. Default 10."),
      status: z.enum(["open", "paid", "shipped"]).optional().describe("Only orders with this status."),
      cursor: z.string().min(1).optional().describe("nextCursor returned by the previous call."),
    },
    outputSchema: {
      count: z.number().int(),
      orders: z.array(z.object({ id: z.string(), status: z.string() })),
      nextCursor: z.string().nullable(),
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
  }, async ({ limit, status, cursor }) => {
    try {
      const page = await listOrders({ limit: limit ?? 10, status, cursor });
      const orders = page.items.map((o) => ({ id: o.id, status: o.status }));
      const d = { count: orders.length, orders, nextCursor: page.nextCursor };
      return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }], structuredContent: d };
    } catch (e) {
      const message = e instanceof AppError ? e.message : "The shop API request failed.";
      return { content: [{ type: "text", text: message }], isError: true };
    }
  });
}
```

Em `src/mcp/server.ts`, a função entra em `registerAll` com a linha
`registerOrdersTools(r);`. O `mcp --list` mostra o catálogo sem abrir o
transporte:

```console
$ mycli mcp --list
MCP server mycli v0.1.0

Tools:
  about  Version, executable, runtime, platform and credits of the binary.
  ...
  orders_list  Use when the user asks about shop orders. Returns up to ...
```

Uma chamada com `{ "limit": 2 }` devolve o mesmo objeto nos dois campos:

```json
{
  "content": [{ "type": "text", "text": "{\n  \"count\": 2, ..." }],
  "structuredContent": {
    "count": 2,
    "orders": [{ "id": "o1", "status": "open" }, { "id": "o7", "status": "paid" }],
    "nextCursor": "c2"
  }
}
```

Sem a credencial `shop.token`, a falha volta como resultado, não como
exceção. O agente lê a orientação e solicita que você grave o token:

```json
{
  "content": [{ "type": "text",
    "text": "Credential \"shop.token\" not found. Save it with: mycli credentials set shop.token" }],
  "isError": true
}
```

O teste conversa com o servidor real por stdio, como em `tests/mcp.test.ts`:

```ts
test("orders_list reports a missing token as isError", async () => {
  const { tools } = await client.listTools();
  expect(tools.map((t) => t.name)).toContain("orders_list");
  const r = await client.callTool({ name: "orders_list", arguments: { limit: 2 } });
  expect(r.isError).toBe(true);
});
```

## Regras que a skill segue

- **Stdout pertence ao JSON-RPC.** Enquanto `mcp` roda, log vai para
  stderr. Um `console.log` no client HTTP corrompe a conversa.
- **Tool bem descrita.** Nome em `snake_case`, `title`, descrição que diz
  quando usar e o que devolve, Zod com `.describe()` em cada campo. O
  agente escolhe a tool só por esse texto.
- **Mesmo objeto em texto e estrutura.** `content` e `structuredContent`
  saem do mesmo valor, com `outputSchema` correspondente. Os campos são
  projetados antes do retorno para não vazar propriedades extras.
- **Falha prevista vira `isError: true`.** A mensagem é pública e fixa. O
  SDK pode devolver o texto original de uma exceção, que pode trazer
  detalhes do serviço.
- **Credencial lida por dentro.** A tool chama `getCredential` no serviço e
  não aceita token como argumento, porque o argumento fica no log do host.
  `credentials_status` mostra nomes e metadados, sem valores.
- **Efeito declarado.** Tool que grava diz isso na descrição e aceita
  `dryRun` quando couber. Um `confirm: true` vindo do modelo não comprova
  sua aprovação.
- **Anotação não é permissão.** `readOnlyHint` e `openWorldHint` informam o
  cliente. A verificação de acesso fica no código.
- **Catálogo e descoberta conferidos.** A tool entra em `catalog.tools`,
  senão `mcp --list` não a enxerga. O SDK não mantém esse catálogo.
- **Respostas curtas.** A tool devolve o que o agente precisa para a
  próxima ação, com `limit` e `cursor` quando a lista pode crescer.
- **Registro sem efeito.** Registrar a tool não consulta rede, não exige
  credencial e não inicia timer, porque `mcp --list` monta o catálogo
  sem transporte.
- **Capacidade só com teste.** HTTP, subscriptions, sampling ou elicitation
  só entram com integração e teste próprios.

## O que ela entrega

A skill relata tools, resources e prompts adicionados ou alterados, com
entrada, saída, efeitos, versões conferidas e testes. Separa receita
isolada, integração no produto, binário compilado e cliente real.

| Arquivo | Mudança |
| --- | --- |
| `src/mcp/tools/<grupo>.ts` | tools novas ou alteradas |
| `src/mcp/server.ts` | chamada em `registerAll` |
| `src/mcp/resources/` e `src/mcp/prompts.ts` | quando a spec pede |
| `tests/mcp.test.ts` | descoberta e chamadas pelo `Client` |
| `docs/mcp.md` | tabela de tools |
| `src/cli/commands/mcp.ts` | `longDescription` com a lista de tools |

## Próxima skill

Para ligar o servidor num agente, siga com a skill `termfy-mcp-client`. Se
a tool lê uma credencial nova, declare o nome com
[termfy-config](termfy-config.md).
