# termfy-cli

A skill `termfy-cli` cria, altera ou remove commands do CLI do seu binário.
Ela parte do registry declarativo de `src/cli/registry.ts`: você descreve o
command uma vez e o mesmo objeto alimenta o parser, o `--help`, o `--json`,
o `--skill` e o `--opencli`. No fim, você tem o command registrado, testado
em subprocesso, com saída em texto e em JSON, exit codes fixos e
`docs/opencli.json` regenerado.

## Quando usar

- Você quer um command novo, como `mycli orders show <id>`.
- Um command existente ganha uma option, um argument ou um subcommand.
- Você vai mudar o formato da saída ou os exit codes de um command.
- Um command saiu da spec e precisa sair do registry.

Para entregar o mesmo recurso também como tool e screen, use
[termfy-command-set](termfy-command-set.md). Para o client HTTP que o
command consome, use [termfy-api](termfy-api.md). Para a setting ou a
credencial que ele lê, use [termfy-config](termfy-config.md).

## Como pedir

Para um command novo:

> Use a skill termfy-cli para criar `mycli orders show <id>`, que mostra
> um pedido da loja em texto e em `--json`.

Para mudar um command que já existe:

> Use a skill termfy-cli para acrescentar `--status <status>` ao
> `orders list`, com os valores `open`, `paid` e `shipped`.

Para um command com interação:

> Use a skill termfy-cli para criar `orders cancel <id>` com confirmação
> no terminal e `--yes` para scripts.

## O que a skill faz

1. Roda `git status --short` e lê a entrada da spec aberta em `specs/`:
   Surface, Behavior, Design e os itens `#termfy-cli`.
2. Copia `template/command/example.ts` para `src/cli/commands/<nome>.ts` e
   ajusta os imports para caminhos relativos ao novo local.
3. Preenche a definição com os nomes da Surface e implementa `run`.
4. Registra o command em `src/cli/commands.ts`.
5. Escreve ou ajusta os testes em `tests/cli.test.ts`, com o binário rodando
   em subprocesso real.
6. Roda `bun run opencli` e revisa o diff de `docs/opencli.json`.
7. Atualiza `docs/cli.md` quando o command traz conceito novo. Esse texto
   entra no binário pelo `--skill` no próximo build.
8. Roda `bun run validate` e marca `[x]` nos itens testados da spec.

## Exemplo

O command `orders show` recebe o id e chama `getOrder(id)`, do client da
loja. Um subcommand novo entra nos `subcommands` do agrupador `orders`:

```ts
import { manifest } from "../../app/manifest.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { error } from "../../app/errors.ts";
import { table } from "../format.ts";
import type { Command } from "../registry.ts";
import { getOrder } from "../../api/shop.ts";

export const showOrderCommand: Command = {
  name: "show",
  description: "Show one shop order.",
  longDescription: "Reads shop.baseUrl from settings.json and the shop.token credential.",
  arguments: [{ name: "id", description: "Order identifier, as listed by orders list.", required: true }],
  exitCodes: [ExitCode.CONFIG, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API],
  examples: [`${manifest.bin} orders show o1`, `${manifest.bin} orders show o1 --json`],
  run: async (ctx) => {
    const id = ctx.args[0] as string;
    if (id.trim() === "") throw error.usage("The order id cannot be empty.");
    ctx.stderr(`Fetching order ${id}...`);
    const order = await getOrder(id);
    return {
      data: { order },
      text: () => table([["id", order.id], ["status", order.status]]),
    };
  },
};
```

O resultado em texto vai para stdout. A linha de progresso vai para stderr,
por isso não aparece num pipe:

```console
$ mycli orders show o1 2>/dev/null
  id      o1
  status  open
$ mycli orders show o1 --json 2>/dev/null
{
  "ok": true,
  "command": "mycli orders show",
  "data": {
    "order": { "id": "o1", "status": "open" }
  }
}
```

Sem a credencial, o command encerra com o código 4. Em `--json`, o erro sai
no envelope com `ok: false`:

```console
$ mycli orders show o1 --json 2>/dev/null; echo "exit $?"
{
  "ok": false,
  "command": "mycli orders show",
  "error": {
    "code": 4,
    "name": "CREDENTIALS",
    "message": "Credential \"shop.token\" not found. Save it with: mycli credentials set shop.token",
    "details": { "name": "shop.token" }
  }
}
exit 4
```

O teste roda o binário com uma pasta de configuração temporária, como o helper
`run` de `tests/cli.test.ts`:

```ts
test("orders show without the token exits with 4", async () => {
  const r = await run(["orders", "show", "o1", "--json"]);
  expect(r.code).toBe(4);
  expect(JSON.parse(r.stdout).error.name).toBe("CREDENTIALS");
});
```

## Regras que a skill segue

- **Toda option e todo argument têm `description`.** Ela diz o efeito, os
  valores aceitos e o padrão. O mesmo texto aparece no `--help`, no
  `--skill` e no `--opencli`.
- **`run` devolve `{ data, text }`.** `data` é serializável e estável para
  scripts. `text` é para pessoas e não carrega JSON montado à mão.
- **Falha prevista lança `AppError`.** `error.usage`, `error.config`,
  `error.credentials`, `error.network`, `error.notFound` e
  `error.permission` levam ao código certo. O command não chama
  `process.exit`, porque `src/cli/index.ts` imprime o erro e devolve o código.
- **Segredo não entra por argument.** Valor digitado na linha de comando
  fica no histórico do shell. Use `readSecret(label)` ou `--stdin` para
  gravar com `setCredential()` e `getCredential(name)` para ler.
- **`interactive: true` só descreve.** O campo não confere o TTY. O `run`
  verifica `ctx.interactive` e oferece `--stdin` ou `--yes` quando couber.
- **Stdout só recebe a saída do command.** Progresso e avisos vão para
  `ctx.stderr`, para o JSON de stdout continuar válido num pipe.
- **Default resolvido em `run`.** `OptionDefinition.default` é metadado. O
  parser não o coloca em `ctx.options`, então use
  `Number(ctx.options.limit ?? 10)`.
- **Nomes em inglês.** Commands, options e chaves de `data` ficam em inglês,
  com chaves em camelCase.
- **Campo publicado não muda.** Depois de publicado, um campo de `data`
  mantém nome e tipo. Para trocar, acrescente um campo novo e remova o
  antigo só em versão major.
- **Completion e OpenCLI saem do registry.** `completion <shell>` e
  `--opencli` mostram o command novo sem trabalho extra. Se ele depende de
  algo do ambiente, a verificação entra em `src/cli/commands/doctor.ts`.

## O que ela entrega

A skill relata os arquivos criados ou alterados, os comandos de validação
com o resultado e exemplos de uso do command em texto e em `--json`.

| Arquivo | Mudança |
| --- | --- |
| `src/cli/commands/<nome>.ts` | command novo ou alterado |
| `src/cli/commands.ts` | registro na raiz, quando o command é novo |
| `tests/cli.test.ts` | casos em subprocesso real |
| `docs/opencli.json` | regenerado por `bun run opencli` |
| `docs/cli.md` | conceito novo explicado, quando houver |
| `specs/<spec>.md` | itens `#termfy-cli` marcados com `[x]` |

## Próxima skill

Se o mesmo recurso também vai para agentes, exponha a tool com
[termfy-mcp](termfy-mcp.md). Para uma tela interativa, siga com
[termfy-tui](termfy-tui.md).
