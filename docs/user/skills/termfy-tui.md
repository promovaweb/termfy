# termfy-tui

A skill `termfy-tui` cria e revisa as screens da TUI do seu binário com a
API imperativa do OpenTUI Core. Ela monta o layout em células e trata a
navegação por teclado, mantendo o foco no item selecionado. Nas telas que
consultam serviços, também trata o carregamento assíncrono e libera os
recursos ao sair da aba.
No fim, você tem uma screen registrada como aba, com estados de carregando,
vazio, erro e pronto, testada por frames e conferida nos temas `night` e
`day`.

## Quando usar

- Você quer uma aba nova, como a screen `orders` com a lista de pedidos.
- Uma screen existente precisa de navegação por teclado, rolagem ou um
  campo de formulário.
- A tela consulta uma API e você precisa tratar carregamento, erro e
  respostas que chegam fora de ordem.
- Uma screen trava, vaza timers ou deixa o terminal sujo ao sair.

Para entregar a screen junto com o command e a tool do mesmo recurso, use
[termfy-command-set](termfy-command-set.md). A chamada HTTP fica no client
da [termfy-api](termfy-api.md): a screen apresenta o resultado.

## Como pedir

Para uma aba nova:

> Use a skill termfy-tui para criar a screen `orders`, que lista os pedidos
> da loja e mostra o pedido selecionado ao apertar Enter.

Para uma tela que consulta um serviço:

> Use a skill termfy-tui para a screen `orders` carregar ao entrar na aba,
> com `r` para recarregar e mensagem própria quando a API falhar.

Para revisar uma tela existente:

> Use a skill termfy-tui para revisar a screen `orders`: a lista some
> quando troco de aba e volto.

## O que a skill faz

1. Confere o Git e lê a spec aberta em `specs/`: a screen na Surface, o
   Behavior com teclas e estados, o Design e os itens `#termfy-tui`.
2. Confere a versão instalada de `@opentui/core` no lock antes de usar
   qualquer API.
3. Lê `src/tui/index.ts`, `src/tui/screen.ts`, `src/tui/components.ts`,
   `src/tui/theme.ts` e `src/tui/screens/index.ts`. Mostra um plano curto
   com arquivos, comportamentos e verificações.
4. Escolhe uma receita em `references/examples/` e adapta só o necessário.
5. Cria `src/tui/screens/<id>.ts` e registra a screen em
   `src/tui/screens/index.ts`. Para abrir direto na aba, acrescenta o id em
   `tui.initialTab` de `src/config/settings.ts` e em `--tab` de
   `src/cli/commands/tui.ts`.
6. Testa a lógica isolada, depois a screen com `createTestRenderer` e por
   fim a navegação com `mountTui`.
7. Confere `night` e `day` em 80×24, 110×30 e 160×40, além de 40×12.
8. Atualiza `docs/tui.md`, roda `bun run validate` e marca `[x]` nos itens.

## Exemplo

A screen `orders` recebe a função de carga pela factory. Assim cada
montagem tem o próprio estado e o teste injeta uma carga local:

```ts
import { BoxRenderable, TextRenderable } from "@opentui/core";
import { listPanel } from "../components.ts";
import type { Screen, ScreenContext } from "../screen.ts";
import { listOrders, type Order } from "../../api/shop.ts";

type Load = () => Promise<{ items: Order[] }>;

export function createOrdersScreen(load: Load = () => listOrders({ limit: 50 })): Screen {
  let root: BoxRenderable | undefined;
  let status: TextRenderable | undefined;
  let list: ReturnType<typeof listPanel> | undefined;
  let orders: Order[] = [];
  let generation = 0;

  const show = (ctx: ScreenContext, items: Order[]) => {
    if (!root) return;
    if (list) { root.remove(list.box); list.box.destroyRecursively(); }
    orders = items;
    list = listPanel(ctx.renderer, ctx.theme, {
      title: "Orders",
      items: items.map((o) => `${o.id}  ${o.status}`),
      onSelect: (i) => { if (status) status.content = `Order ${orders[i]?.id} selected`; },
    });
    root.add(list.box, 0);
  };

  const reload = async (ctx: ScreenContext) => {
    const current = ++generation;
    if (status) status.content = "Loading orders...";
    try {
      const page = await load();
      if (current !== generation) return;
      show(ctx, page.items);
      if (status) status.content = page.items.length ? "Enter selects an order" : "No orders";
    } catch {
      if (current === generation && status) status.content = "Unable to load orders. Press r to retry.";
    }
  };

  return {
    id: "orders",
    title: "Orders",
    description: "Shop orders",
    keys: [{ key: "↑/↓ j/k", action: "move" }, { key: "Enter", action: "select" }, { key: "r", action: "reload" }],
    mount: (ctx) => {
      root = new BoxRenderable(ctx.renderer, { flexDirection: "column", flexGrow: 1 });
      status = new TextRenderable(ctx.renderer, { content: "", height: 1, flexShrink: 0, fg: ctx.theme.textDim });
      root.add(status);
      ctx.renderer.once("destroy", () => { generation++; });
      return root;
    },
    onEnter: (ctx) => { void reload(ctx); },
    onLeave: () => { generation++; },
    onKey: (name, ctx) => {
      if (name === "r") { void reload(ctx); return true; }
      if (!list) return false;
      if (name === "up" || name === "k") { list.move(-1); return true; }
      if (name === "down" || name === "j") { list.move(1); return true; }
      if (name === "return" || name === "enter") {
        if (list.selected() >= 0) list.select(list.selected());
        return true;
      }
      return false;
    },
  };
}
```

O registro entra em `src/tui/screens/index.ts` como
`[overviewScreen, createOrdersScreen(), aboutScreen]`. Com `orders` em
`tui.initialTab` e em `--tab`, a aba abre direto:

```bash
mycli tui --tab orders
mycli config set tui.initialTab orders
```

Trecho do frame em 80×24, depois da carga e de uma tecla `j`:

```text
╭ Orders ──────────────────────────────────────────╮
│   o1  open                                       │
│ > o7  paid                                       │
╰──────────────────────────────────────────────────╯
Enter selects an order
```

O teste espera a carga controlada terminar, sem pausa fixa:

```ts
const setup = await createTestRenderer({ width: 80, height: 24 });
(screens as Screen[]).push(createOrdersScreen(async () => ({
  items: [{ id: "o1", status: "open" }, { id: "o7", status: "paid" }],
})));
const closed = mountTui(setup.renderer, { initialTab: "orders" }, themes.night);
try {
  await setup.waitForFrame((frame) => frame.includes("o7  paid"));
  setup.mockInput.pressKey("j");
  await setup.renderOnce();
  expect(setup.captureCharFrame()).toContain("> o7  paid");
  setup.mockInput.pressKey("q");
  await closed;
} finally { setup.renderer.destroy(); }
```

## Regras que a skill segue

- **OpenTUI imperativo.** A aba usa `@opentui/core` direto, sem React ou
  Solid, porque o host já entrega renderer e tema prontos.
- **Uma screen por arquivo, com factory.** Estado no escopo do módulo vaza
  seleção entre duas montagens ou dois testes.
- **Componentes compartilhados.** `panel`, `keyValueTable`, `list`,
  `heading`, `dim`, `spacer` e `listPanel` mantêm o visual igual entre abas.
  `spacer(renderer, height)` não recebe tema.
- **Cores de `ctx.theme`.** Cor fixa no código quebra uma das paletas.
- **`mount` síncrono.** `mount` cria os nós. O trabalho ativo começa em
  `onEnter` e para em `onLeave`.
- **Cleanup também no `destroy`.** A versão atual de `mountTui` não chama
  `onLeave` ao encerrar a aplicação, então a screen escuta o evento
  `destroy` do renderer.
- **A aplicação é dona do renderer.** A screen sai com `ctx.quit()`, sem
  `process.exit()`, sem outro renderer e sem escrever em stdout.
- **`onKey` devolve `true` só para tecla consumida.** Assim `q`, `?`, `Tab`,
  as setas laterais e os dígitos continuam trocando de aba e encerrando.
- **Respostas antigas descartadas.** O contador de geração impede que uma
  carga lenta substitua uma mais nova ou altere uma aba que já saiu.
- **Mensagem própria no erro.** A screen não mostra `String(error)` da API,
  que pode trazer detalhes internos do serviço.
- **Serviço compartilhado.** A screen chama o mesmo client do CLI e do MCP,
  sem duplicar autenticação nem HTTP.

## O que ela entrega

A skill relata os arquivos alterados, as versões conferidas, as teclas, os
estados cobertos, as dimensões ensaiadas e um frame real capturado. Separa
testes executados, exemplos só compilados e comportamentos não exercitados.

| Arquivo | Mudança |
| --- | --- |
| `src/tui/screens/<id>.ts` | screen nova ou revisada |
| `src/tui/screens/index.ts` | screen na lista de abas |
| `src/config/settings.ts` | id em `tui.initialTab`, quando abre direto |
| `src/cli/commands/tui.ts` | id nos valores de `--tab`, idem |
| `tests/` | testes com `createTestRenderer` e `mountTui` |
| `docs/tui.md` | teclas e uso da aba |

## Próxima skill

Se a screen trouxe uma preferência nova, declare a key com
[termfy-config](termfy-config.md). Para expor o mesmo recurso a agentes,
siga com [termfy-mcp](termfy-mcp.md).
