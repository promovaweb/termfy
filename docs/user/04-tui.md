# TUI

## Estrutura da tela

Esquema ilustrativo da disposição, com rótulos traduzidos para leitura:

```text
▌ My CLI v<version>  │  Consulta e atualiza pedidos da loja.        linux-x64 • Bun 1.4.4 
───────────────────────────────────────────────────────────────────────────────────────
 Overview      About
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ╭─ Ambiente ──────────────────────────────╮╭─ Estado ──────────────────────────────╮
 │ Binário     mycli v<version>               ││ settings.json     • padrões           │
 │ Runtime     Bun 1.4.4                   ││ credentials.json  • vazio             │
 ╰─────────────────────────────────────────╯╰───────────────────────────────────────╯
  ←/→  aba   1-9  ir   ?  ajuda   q  sair
```

`src/tui/index.ts` monta quatro faixas: cabeçalho de uma linha, abas
(`TabSelectRenderable`), conteúdo da aba ativa e barra de teclas. Cada aba é
um arquivo em `src/tui/screens/` que exporta um objeto `Screen` com `id`,
`title`, `description`, `mount(ctx)` e, quando precisa, `keys`, `onKey`,
`onEnter` e `onLeave`.

O starter kit traz duas abas. **Overview** mostra ambiente, estado da
configuração e do cofre, configuração em vigor e próximos passos. **About**
mostra binário, projeto, créditos e padrões seguidos, com os mesmos campos do
comando `about`.

## Teclas

| Tecla | Ação |
| --- | --- |
| `←` `→` `[` `]` | aba anterior ou seguinte |
| `Tab` | próxima aba |
| `1` … `9` | ir para a aba de mesmo número |
| `?` | mostrar ou esconder a ajuda |
| `q` `Esc` `Ctrl+C` | sair |

A tela declara as próprias teclas em `keys` e as trata em `onKey`. Elas
aparecem na barra inferior antes das globais. O renderer é destruído em toda
saída, devolvendo o terminal ao shell.

## Design modern unix

O visual segue a geração de ferramentas como lazygit, bottom, gitui, k9s e
OpenCode: denso, legível, com hierarquia por cor e peso em vez de espaço em
branco.

- Bordas arredondadas com o título na própria borda. Painéis vizinhos sem
  gap; padding interno de uma célula.
- Rótulos à esquerda, apagados, alinhados pela maior chave; valores à direita
  em cor plena. Títulos de seção em negrito.
- Uma cor de acento para o que está ativo; uma secundária para links e
  origens externas. Verde, âmbar e vermelho só para estado, com texto ao
  lado.
- Barra de status com teclas em blocos invertidos.
- A tela atualiza ao receber um resultado novo, com rolagem controlada pelo teclado.
- Glifos de uma célula. Emoji fora, porque a largura varia por terminal.

As cores vivem em `src/tui/theme.ts`, em três paletas: `terminal` (padrão),
`night` (derivada do Tokyo Night) e `day` (clara). Os nomes são de papel:
`accent`, `textDim`, `border`, `ok`, `warn`, `error`. No tema `terminal`,
cada cor é uma referência à paleta do terminal ou ao texto e fundo padrão,
então a TUI acompanha o tema do terminal. Uma tela não escreve hexadecimal:
usa os nomes de papel.

## Componentes

`src/tui/components.ts` oferece `panel`, `keyValueTable`, `list`,
`heading`, `dim`, `spacer` e `listPanel`, uma lista com rolagem
(`ScrollBoxRenderable`), item selecionado em destaque e navegação por
`up`, `down`, `j`, `k` e `Enter`. O retorno é
`{ box, select, selected, move }`: monte `box` e encaminhe as teclas em
`onKey`. `move(delta)` muda o destaque; `select(index)` também chama
`onSelect`; `selected()` devolve o índice ou -1 na lista vazia.
`spacer(renderer, height)` é a exceção que não recebe tema. Um componente novo entra
nesse arquivo e fica disponível para todas as telas.

## Criar uma aba

1. Copie `template/screen/example.ts` para `src/tui/screens/<id>.ts`.
2. Monte o conteúdo com os componentes e dados de `src/config/` ou dos
   coletores já usados pelo CLI.
3. Registre em `src/tui/screens/index.ts`. A ordem da lista é a ordem das abas.
4. Se o `id` puder ser aba inicial, acrescente-o em `tui.initialTab` e em
   `--tab`.
5. Escreva o teste.

## Testar sem terminal

O OpenTUI tem um renderer de teste. `tests/tui.test.ts` monta a interface em
memória, envia teclas e confere o frame como texto:

```ts
import { expect } from "bun:test";
import { createTestRenderer } from "@opentui/core/testing";
import { mountTui } from "../src/tui/index.ts";

const setup = await createTestRenderer({ width: 110, height: 30 });
const closed = mountTui(setup.renderer, {});
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Environment");
setup.mockInput.pressKey("2");
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Credits");
setup.mockInput.pressKey("q");
await closed;
```

`mountTui` aceita qualquer renderer; `startTui` cria o renderer real.
Essa separação é o que permite testar a TUI em CI.

A skill `termfy-tui` traz o guia de design completo e a documentação do
OpenTUI 0.8.3 em `references/opentui/`.
