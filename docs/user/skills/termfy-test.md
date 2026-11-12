# termfy-test

A `termfy-test` escreve e mantém os testes Bun do binário a partir dos
itens de `## Tests` da spec aberta. Ela cobre os três modos (CLI em
subprocesso, MCP por stdio com o SDK real, TUI por frame) e a configuração.
No fim, você tem cada item de aceite ligado a pelo menos um teste verde,
`bun run typecheck` e `bun test` passando e os itens cobertos marcados com
`[x]` na spec.

## Quando usar

Use esta skill nestas situações:

- a spec 0002 criou o command `orders list` e os itens de `## Tests`
  ainda estão `[ ]`;
- um bug apareceu na tool `orders_list` e você quer reproduzi-lo com uma
  assertion antes de corrigir;
- uma mudança de contrato (campo novo em `data`, exit code diferente)
  deixou assertions antigas desatualizadas;
- a screen `orders` ganhou uma tecla nova e o frame precisa de teste.

Não use para criar funcionalidade. Um comportamento que não está na spec
passa primeiro pela [termfy-spec](termfy-spec.md). Para auditar se os
testes existentes provam a entrega, use a
[termfy-review](termfy-review.md), que relata sem editar. Os testes das
tabelas SQLite saem da [termfy-database](termfy-database.md), que já
traz o stub `template/db/example-test.ts`.

## Como pedir

Para cobrir uma entrega nova:

> Use a skill termfy-test para escrever os testes de aceite da spec 0002:
> `orders list` em texto e em `--json`, a tool `orders_list` e a screen
> `orders`.

Para reproduzir uma falha:

> Use a skill termfy-test para reproduzir o erro: `orders list` sem
> `shop.token` sai com exit code 1 em vez de 4.

Para atualizar depois de uma mudança de contrato:

> Use a skill termfy-test para ajustar os testes de `orders list` ao campo
> `count` que a spec 0005 acrescentou ao `data`.

## O que a skill faz

1. Roda `git status --short` e delimita a entrega pela tarefa da spec com a
   tag `#termfy-test` ou pela tarefa de implementação que pede o teste.
2. Relaciona cada item de `## Tests` a pelo menos um teste. Para cada
   comportamento alterado, escolhe os casos de sucesso, falha e limite que
   se aplicam (command, tool, screen ou configuração).
3. Escreve os testes no arquivo da área: `tests/cli.test.ts`,
   `tests/mcp.test.ts`, `tests/tui.test.ts` ou `tests/config.test.ts`. Para
   uma correção, reproduz a falha antes com uma assertion observável.
4. Roda o arquivo alterado, por exemplo `bun test tests/cli.test.ts`.
   Depois roda `bun run typecheck` e `bun test`.
5. Roda `bun run validate` e separa falha da entrega de problema que já
   existia antes.
6. Com a entrega concluída e os testes verdes, troca `[ ]` por `[x]` na
   tarefa e nos itens de `## Tests` cobertos, no arquivo da spec.

## Exemplo

A spec 0002 tem este item de aceite:

```markdown
## Tests

- [ ] `mycli orders list --json` sem `shop.token` sai com 4 e envelope de erro.
```

A skill escreve o teste em `tests/cli.test.ts`, no modelo de subprocesso.
`HOME_VARIABLE` aponta para uma pasta temporária, então o cofre real da
máquina fica fora do teste:

```ts
/** Runs orders list without a stored token in an isolated subprocess. */
import { test, expect } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { HOME_VARIABLE, MASTER_KEY_VARIABLE } from "../src/config/paths.ts";
import { ExitCode } from "../src/app/exit-codes.ts";
import { manifest } from "../src/app/manifest.ts";

test("orders list without shop.token exits with CREDENTIALS", async () => {
  const directory = mkdtempSync(join(tmpdir(), "mycli-cli-"));
  const env = { ...process.env, [HOME_VARIABLE]: directory, NO_COLOR: "1" };
  delete env[MASTER_KEY_VARIABLE];
  const child = Bun.spawn([process.execPath, "run", "src/main.ts", "orders", "list", "--json"], {
    cwd: join(import.meta.dir, ".."), env,
    stdin: "ignore", stdout: "pipe", stderr: "pipe",
  });
  const timeout = setTimeout(() => child.kill(), 4000);
  try {
    const [stdout, code] = await Promise.all([new Response(child.stdout).text(), child.exited]);
    expect(code).toBe(ExitCode.CREDENTIALS);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(false);
    expect(result.command).toBe(`${manifest.bin} orders list`);
    expect(result.error.name).toBe("CREDENTIALS");
  } finally {
    clearTimeout(timeout);
    child.kill();
    await child.exited;
    rmSync(directory, { recursive: true, force: true });
  }
});
```

Para a tool, o teste usa `Client` e `StdioClientTransport` do SDK. Ele
conversa com o servidor real por stdio e confere a descoberta:

```ts
await client.connect(transport);
const catalog = await client.listTools();
expect(catalog.tools.some((tool) => tool.name === "orders_list")).toBe(true);
```

Para a screen, monta a TUI com `createTestRenderer` e `mountTui`, envia
a tecla com `mockInput.pressKey`, chama `renderOnce()` e confere um trecho
de `captureCharFrame()`. O teste não espera a Promise de `mountTui` antes de
interagir, porque ela só termina quando o renderer é destruído.

Com os testes verdes, a skill marca o item:

```markdown
- [x] `mycli orders list --json` sem `shop.token` sai com 4 e envelope de erro.
```

## Regras que a skill segue

- **Um arquivo por área, em inglês.** Nomes de arquivo, testes, variáveis e
  mensagens ficam em inglês, como o resto do código do kit.
- **CLI em subprocesso.** `Bun.spawn` com `src/main.ts`, `HOME_VARIABLE` numa
  pasta temporária e `NO_COLOR=1`. O teste vê o binário como a pessoa vê,
  sem cores que atrapalham a comparação.
- **Exit code antes da saída.** Cada chamada, inclusive as de preparo, tem o
  code conferido com `ExitCode`. Um JSON bonito com code errado ainda é
  falha.
- **Contrato público, não implementação.** As assertions conferem `data`,
  `text` e o envelope. Copiar a lógica do command no teste só prova que o
  código é igual a ele mesmo.
- **MCP sem rede.** O teste usa o SDK real, mas tools de rede recebem
  respostas locais controladas. Assim a suíte roda no CI sem cadastro externo.
- **TUI por trecho.** Um trecho do frame e uma transição bastam. Snapshot
  do frame inteiro quebra a cada ajuste de layout.
- **Fixtures sintéticas.** `MASTER_KEY_VARIABLE` sai do ambiente do
  subprocesso. Testes de config e TUI restauram as variáveis no `finally`,
  para que um teste não contamine o próximo.
- **Recursos fechados.** Subprocessos, clientes e renderers fecham mesmo
  quando uma assertion falha. Casos que mudam `process.env` não rodam com
  `test.concurrent`.
- **Assertion não enfraquece.** Se o contrato falha, a skill descreve a
  falha. Ela só mexe no código de produção quando o pedido inclui a
  correção.
- **Marca na spec, não no `CLISPEC.md`.** Fechar a spec e mudar o status
  para `done` é trabalho da `termfy-spec`. Um item sem teste fica `[ ]`.

## O que ela entrega

No relatório final, a skill lista:

- os arquivos de `tests/` alterados;
- os comportamentos cobertos, com o texto da tarefa e dos itens de
  `## Tests` relacionados;
- os comandos executados (`bun test tests/<área>.test.ts`,
  `bun run typecheck`, `bun test`, `bun run validate`);
- a quantidade de testes que passaram e falharam;
- as limitações restantes e os casos que não se aplicam, com o motivo.

A spec aberta recebe `[x]` nos itens cobertos. Valores reais de
credenciais não aparecem no relatório. Quando o pedido é só de testes, a
skill relata ao responsável pela implementação o item apto a ser marcado.

## Próxima skill

Com a entrega coberta, siga para a [termfy-review](termfy-review.md), que
confronta o código e os testes com o Behavior e o Design da spec.
