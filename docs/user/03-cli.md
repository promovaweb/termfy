# CLI

## Registro declarativo

Cada comando é um objeto `Command` em `src/cli/commands/<name>.ts`:

```ts
import type { Command } from "../registry.ts";
import { ExitCode } from "../../app/exit-codes.ts";

export function createOrdersCommand(listOrders: Command): Command {
  return {
    name: "orders",
    description: "Query shop orders.",
    subcommands: [listOrders],
    exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API],
  };
}
```

O registro descreve nome, aliases, argumentos, opções, subcomandos, exemplos,
códigos de saída e a função `run`. Entre os consumidores do mesmo
objeto estão:

| Consumidor | Arquivo | Saída |
| --- | --- | --- |
| parser | `src/cli/parser.ts` | argumentos e opções validados |
| ajuda | `src/cli/help.ts` | `--help` da raiz e de cada comando |
| OpenCLI | `src/cli/opencli.ts` | `--opencli` e `docs/opencli.json` |
| completion | `src/cli/completion.ts` | scripts de autocompletar |
| documentação | `src/skill/index.ts` | referência gerada no `--skill cli` |

`OptionDefinition.default` é metadado para documentação; aplique o padrão
em `run`, pois o parser não o preenche em `ctx.options`.

`OptionDefinition` exige `description` no tipo TypeScript. O parser
resolve opções pelo nome e pelos aliases; não testa a presença da descrição.

## Argumentos e opções

- `--key value` e `--key=value` são equivalentes.
- Aliases curtos (`-h`, `-V`, `-y`) existem, mas não se agrupam.
- `--` encerra a leitura de flags. O parser ainda pode reconhecer um
  subcommand enquanto nenhum argumento posicional tiver sido consumido.
- Opções globais (`--help`, `--version`, `--json`, `--skill`, `--opencli`,
  `--no-color`) valem em qualquer posição.
- Valores fora da lista `values`, argumentos obrigatórios ausentes e opções
  desconhecidas encerram com código 2 e uma mensagem que aponta o `--help`.

## O contrato de `run`

```ts
import type { Command } from "../registry.ts";
import { table } from "../format.ts";
import { getCredential } from "../../config/credentials.ts";
import { ExitCode } from "../../app/exit-codes.ts";
import { manifest } from "../../app/manifest.ts";

type Order = { id: string; status: string };
type FetchOrders = (token: string) => Promise<Order[]>;

export function createListOrders(fetchOrders: FetchOrders): Command {
  return {
    name: "list",
    description: "List shop orders.",
    exitCodes: [ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API],
    examples: [`${manifest.bin} orders list`],
    run: async () => {
      const token = getCredential("shop.token");
      const orders = await fetchOrders(token);
      return {
        data: { count: orders.length, orders },
        text: () => table(orders.map((order) => [order.id, order.status])),
      };
    },
  };
}
```

Os exemplos usam imports relativos a `src/cli/commands/`. Ao reuni-los
em `src/cli/commands/orders.ts`, mantenha cada import uma só vez. Implemente
`fetchOrders` no projeto, lançando `error.network()` quando a API falhar,
e registre `createOrdersCommand(createListOrders(fetchOrders))`.

`data` é o que sai em `--json`; `text` é o que sai para pessoas. A camada
de entrada decide qual usar. O comando nunca chama `process.exit` nem monta
JSON à mão: ele devolve dados e lança `AppError` quando algo previsto falha.

## Saída em texto e em JSON

Em texto, dados vão para stdout e erros para stderr, em uma linha com o
código e o nome entre colchetes:

```text
error Credential "shop.token" not found. Save it with: credentials set shop.token [4 CREDENTIALS]
```

Em JSON, resultados e erros vão para stdout; progresso e avisos permanecem
em stderr. Uma exceção gera este envelope:

```json
{ "ok": false, "command": "mycli orders list", "error": { "code": 4, "name": "CREDENTIALS", "message": "..." } }
```

`doctor` devolve o diagnóstico em `data` e pode sair com 3 mantendo
`ok: true` no envelope. Nesse caso, consulte `data.ok`.

`output.format = json` em settings.json torna o JSON padrão. `--json` sempre
vence.

## Códigos de saída

| Código | Nome | Quando |
| --- | --- | --- |
| 0 | `SUCCESS` | operação concluída |
| 1 | `GENERIC_ERROR` | falha inesperada |
| 2 | `USAGE` | argumentos ou opções inválidos; binário sem argumentos fora de TTY |
| 3 | `CONFIG` | settings.json inválido, valor recusado, chave ausente em `config get` |
| 4 | `CREDENTIALS` | cofre ilegível, chave mestra ausente ou credencial não encontrada |
| 5 | `NETWORK_OR_API` | rede ou resposta de API fora do esperado |
| 6 | `NOT_FOUND` | recurso inexistente |
| 7 | `PERMISSION` | permissão negada no sistema de arquivos |
| 8 | `NO_TTY` | TUI sem TTY |
| 9 | `MCP` | servidor MCP falhou ou perdeu o transporte |
| 130 | `INTERRUPTED` | cancelado pelo usuário |

A fonte é `src/app/exit-codes.ts`. Uma família nova entra lá e em
`src/app/errors.ts`, com um atalho `error.<family>()`. Números não se
reutilizam.

## Commands de apoio

`<bin> doctor` confere Bun, TTY, pasta de dados, settings, master key, cofre,
versão e plataforma, com ✓, ! ou ✗ por item, e sai com 3 quando algo falha.
O retorno é `{ checks, ok }`; cada check tem `name`, `status` e `detail`.
Avisos não mudam a saída para 3. A mesma coleta está na tool MCP `doctor`. `<bin> completion bash|zsh|fish`
gera o script de autocompletar a partir do registry, com subcommands,
options e valores enumerados. Para instalar na sessão Zsh com saída
texto, use `eval "$(mycli completion zsh)"`; no Fish,
`mycli completion fish | source`. Se `output.format` for `json`, restaure
`text` ou extraia `data.script` antes de carregar o script.
`<bin> --skill reference` devolve só a referência gerada do registry, para
agentes que já conhecem o método e querem economizar contexto.

## OpenCLI

A OpenCLI Specification descreve a interface de um CLI em JSON para que
pessoas e máquinas saibam invocá-lo sem ler o código. `mycli --opencli`
gera o documento a partir do registro; `bun run opencli` grava
`docs/opencli.json`; `bun run opencli:check` falha quando o arquivo diverge
do registro. Um agente pode preferir esse JSON ao `--help`: nomes, aliases,
valores aceitos e códigos de saída vêm sem formatação para interpretar.

## Adicionar um comando

1. Copie `template/command/example.ts` para `src/cli/commands/<name>.ts`.
2. Preencha a definição e implemente `run`.
3. Registre em `src/cli/commands.ts`.
4. Escreva o teste em `tests/cli.test.ts`, que roda o binário em subprocesso
   e confere stdout, stderr e código de saída.
5. Rode `bun run opencli` e `bun run validate`.
6. Se o comando trouxer conceito novo, escreva um parágrafo em `docs/cli.md`.

A skill `termfy-cli` percorre esses passos com o agente.
