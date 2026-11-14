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

O registro reúne a definição do comando e a função `run`, que executa seu
comportamento. A definição inclui os nomes e argumentos aceitos, as opções
e os subcomandos. Ela também documenta exemplos e códigos de saída para os
consumidores abaixo:

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
`fetchOrders` no projeto, lançando `error.network()` quando a API falhar.
Depois, registre `createOrdersCommand(createListOrders(fetchOrders))`.

`data` contém o resultado usado em `--json` e `text` formata esse resultado
para você ler no terminal. A camada de entrada escolhe o formato da saída.
O comando devolve o resultado e lança `AppError` quando algo previsto falha,
deixando a montagem do JSON e o encerramento do processo para essa camada.

## Saída em texto e em JSON

Em texto, o resultado vai para stdout e os erros para stderr, em uma linha com o
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

`output.format = json` em settings.json torna o JSON padrão. `--json` tem
prioridade sobre essa key.

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

`<bin> doctor` verifica o runtime e o terminal, além dos arquivos de
configuração e do cofre. O diagnóstico também identifica a versão e a
plataforma, mostrando ✓, ! ou ✗ em cada item. Uma falha resulta no código
3, mas os avisos mantêm a saída 0. O retorno é `{ checks, ok }`, com
`name`, `status` e `detail` em cada check, e está disponível também pela
tool MCP `doctor`.

`<bin> completion bash|zsh|fish`
gera o script de autocompletar a partir do registry, com subcommands,
options e valores enumerados. Para instalar na sessão Zsh com saída
texto, use `eval "$(mycli completion zsh)"`; no Fish,
`mycli completion fish | source`. Se `output.format` for `json`, restaure
`text` ou extraia `data.script` antes de carregar o script.
`<bin> --skill reference` devolve só a referência gerada do registry, para
agentes que já conhecem o método e querem economizar a janela de contexto do modelo.

## OpenCLI

A OpenCLI Specification descreve a interface de um CLI em JSON para que
você e seus scripts saibam invocá-lo sem ler o código. `mycli --opencli`
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
