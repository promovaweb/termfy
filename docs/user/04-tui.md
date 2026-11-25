# TUI

## Estrutura da tela

Esquema ilustrativo da disposição, com rótulos traduzidos para leitura:

```text
 My CLI v<version> · Debian
 ╭─ Menu ──────────────────────────────────────────────────────────────────╮
 │ 1 Overview   2 Settings   3 Credentials   4 Docs   5 About              │
 ╰─────────────────────────────────────────────────────────────────────────╯
 ╭─ Ambiente ──────────────────────────────╮╭─ Estado ───────────────────────────╮
 │ Binário     mycli v<version>            ││ settings.json     • padrões        │
 ╰─────────────────────────────────────────╯╰────────────────────────────────────╯
  settings: padrões · cofre: 0    r recarregar   ? ajuda   q sair      ^K commands
```

`src/tui/index.ts` monta quatro faixas: cabeçalho de uma linha, barra de
abas com número e ícone, conteúdo da aba ativa e barra de status. Cada aba
é um arquivo em `src/tui/screens/` que exporta um objeto `Screen` com `id`,
`title`, `icon`, `description`, `actions` e `mount(ctx)` e, quando precisa,
`watch`, `onEnter`, `onLeave`, `onPause`, `onResume` e `onKey`.

O starter kit traz cinco abas:

| Aba | Conteúdo |
| --- | --- |
| **Overview** | ambiente, estado da configuração e do cofre, configuração em vigor e próximos passos |
| **Settings** | tabela com key, valor e padrão, com painel de detalhe; edita cada key pelo controle do tipo |
| **Credentials** | nomes do cofre, origem da master key e total de credenciais; valores não aparecem |
| **Docs** | índice dos tópicos da documentação embutida e o documento em Markdown |
| **About** | binário, projeto, créditos, padrões seguidos e links, com os mesmos campos do comando `about` |

## Teclas

| Tecla | Ação |
| --- | --- |
| `←` `→` `[` `]` | aba anterior ou seguinte |
| `Tab` `Shift+Tab` | avançar ou voltar na ordem de foco |
| `1` … `9` | ir para a aba de mesmo número |
| `Ctrl+K` `:` | abrir a paleta de comandos |
| `?` | mostrar ou esconder a ajuda |
| `Esc` | fechar o diálogo ou a ajuda; sem modal aberto, sair |
| `q` `Ctrl+C` | sair |

Tab percorre o menu, os controles da aba e o rodapé. Shift+Tab volta pelo mesmo percurso. Enter ativa o controle em foco. Cada diálogo mantém o foco até fechar e então o devolve ao controle de origem. Os atalhos aparecem na linha do rótulo, em tamanho normal, com negrito e contraste invertido.

A tela declara os próprios comandos em `actions`: tecla, descrição, ícone e
a função que roda. Eles aparecem na barra inferior antes das globais, no
help e na paleta. O clique no item da barra roda a mesma ação. O renderer é
destruído em toda saída, devolvendo o terminal ao shell.

## Paleta de comandos

`Ctrl+K` ou `:` abre a paleta. Ela busca por nome entre as ações da aba, as
entradas `Go to <aba>`, as ações das outras abas (troca a aba e executa),
"Reload this screen", a ajuda e a saída. A busca aceita as letras em
sequência, sem exigir a palavra inteira.

`↑` `↓` e `j`/`k` movem, `PgUp`/`PgDn` e `Home`/`End` pulam, `Enter`
executa e `Esc` fecha. A linha responde ao clique. O item `^K commands`, no
canto direito da barra de status, também abre a paleta.

## Barra de status e toasts

A barra inferior tem o resumo da tela à esquerda (`ctx.status`), as ações da
tela no meio e `^K commands` à direita. No layout compacto ficam só
`? help` e `q quit` no meio.

`ctx.notify(message, tone)` mostra um toast no canto inferior direito. No
máximo três toasts ficam visíveis; o mais antigo fecha primeiro. Cada toast
some em 4 segundos ou com um clique e não recebe teclado. O tom pode ser
`info`, `ok`, `warn` ou `error`.

## Diálogos

O shell desenha os diálogos e devolve a resposta à tela:

```ts
const name = await ctx.prompt({ title: "Add credential", label: "Name" });
const ok = await ctx.confirm({ title: "Remove", message: `Remove ${name}?`, danger: true });
const index = await ctx.choose({ title: "Icons", items: ["auto", "unicode", "ascii"] });
```

| Diálogo | Campos | Interação |
| --- | --- | --- |
| `confirm` | `title`, `message`, `confirmLabel?`, `danger?` | `Enter` no botão em foco, `y` e `n`, `←` `→` e `Tab` entre botões, `Esc` cancela |
| `prompt` | `title`, `label`, `initial?`, `placeholder?`, `secret?`, `validate?` | digitação, paste, `Backspace`, `Ctrl+U` limpa, `Enter` envia por `validate`, `Esc` cancela |
| `choose` | `title`, `items`, `initial?` | `↑` `↓`, `j`/`k`, `PgUp`/`PgDn`, `Home`/`End`, `Enter`, `Esc` |

`confirm` resolve `true` ao aceitar e `false` ao cancelar. `prompt` resolve
o texto ou `undefined` no `Esc`. `choose` resolve o índice ou `undefined`.
`danger` pinta o botão com a cor de erro. `secret` mostra bolinhas e o valor
não chega ao frame. `validate` devolve uma mensagem para manter o diálogo
aberto. Um clique fora do diálogo cancela.

Use esses três diálogos em vez de montar uma tela de formulário. A tela não
ganha layout, foco nem validação próprios para um ou dois campos.

## Mouse

Com `tui.mouse` em `true`, o padrão, a TUI responde ao mouse. O clique numa
aba abre a aba, numa linha de tabela ou de lista seleciona e ativa o item,
num botão, num item da barra, numa linha da paleta ou da ajuda e num botão
de diálogo roda a mesma ação da tecla. A roda rola listas e troca de aba
sobre a barra de abas. O item sob o ponteiro recebe destaque e o ponteiro
vira mão sobre o que é clicável.

Com o mouse ligado, use `Shift` e arraste para selecionar texto no terminal.
Com `tui.mouse` em `false`, o terminal volta a selecionar com o mouse e a
TUI fica só com o teclado.

## Layout responsivo

`ctx.layout()` devolve três faixas, medidas em colunas: `wide` a partir de
120, `medium` a partir de 80 e `compact` abaixo de 80. O shell remonta a
tela quando a faixa muda, então `mount` precisa funcionar nas três. Em
`wide` os painéis ficam lado a lado. Em `medium` o painel secundário
continua ao lado, com menos largura. Em `compact` a tela empilha em uma
coluna, esconde o conteúdo secundário e a aba inativa mostra só o número e
o ícone.

Abaixo de 60×16 o shell troca a tela pela mensagem "Terminal too small" até
o terminal crescer. A screen não repete essa mensagem.

## Arquivos e pausa

`Screen.watch()` devolve os arquivos que a tela lê. Quando outro processo
muda um deles, o shell recarrega a tela e mostra o toast "Updated from
disk". Overview, Settings e Credentials observam settings.json,
credentials.json e master.key.

Quando a janela do terminal perde o foco, o shell chama `onPause`; ao
recuperar, chama `onResume`. A tela para timers e animações em `onPause`. O
título da janela mostra `<título> · <aba>`. O teclado Kitty é ligado quando
o terminal suporta.

A setting `tui.motion` (boolean, padrão `true`) liga as animações curtas de
diálogos e toasts. Com `false`, a interface fica estática.

## Ícones

`src/tui/icons.ts` guarda três conjuntos com os mesmos nomes de papel: `nerd`
(Nerd Font), `unicode` e `ascii`. Os papéis seguem o significado, como
`overview`, `about`, `settings`, `terminal`, `copy`, `refresh`, `ok`,
`warn` e `error`.

`tui.icons` escolhe o conjunto. `auto` usa `nerd` no Ghostty, no Kitty, no
WezTerm e no Omarchy, `ascii` no console Linux e `unicode` nos demais
terminais. As telas leem os ícones de `ctx.icons`, então uma troca de
setting muda a TUI inteira.

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
- A tela atualiza ao receber um resultado novo, com rolagem controlada pelo
  teclado.
- Glifos de uma célula. Emoji fora, porque a largura varia por terminal.
- Ícones de papel vêm de `ctx.icons`, sem glifo fixo na tela.

As cores vêm dos slots ANSI e do texto e fundo padrão do terminal. Os componentes usam os papéis de `src/tui/theme.ts`, como `accent`, `border` e `error`.

## Componentes

`src/tui/components.ts` oferece `panel`, `keyValueTable`, `list`, `heading`,
`dim`, `spacer`, `button`, `listPanel`, `table`, `stateView`, `spinner`,
`progressBar` e `link`.

| Componente | Uso |
| --- | --- |
| `panel` | caixa com borda, título e `active` para o painel em foco |
| `keyValueTable` | rótulo apagado e valor alinhados |
| `table` | cabeçalho que ordena no clique, linha clicável, teclado e `setRows` |
| `listPanel` | lista com rolagem, seleção e clique na linha |
| `stateView` | estados de carregando, vazio e erro, com botão opcional |
| `spinner` | indicador animado com `start`, `stop` e `setLabel` |
| `progressBar` | barra de 0 a 1 com `set(value, label?)` |
| `link` | hyperlink OSC 8; o clique copia a URL por OSC 52 |

`table` devolve `{ box, move, select, selected, sortBy, setRows }`. O
primeiro clique na linha seleciona. O segundo clique ativa, assim como o
`Enter`. `setRows` troca as linhas e preserva o índice quando ele ainda
existe. `listPanel` devolve `{ box, move, select, selected }`; `move(delta)`
muda o destaque sem chamar `onSelect`, `select(index)` também chama e
`selected()` devolve -1 na lista vazia.

`spacer(renderer, height)` é a exceção que não recebe tema. `button` recebe
`key`, `label`, `icon` e `onPress`. O clique chama `onPress`. A linha de
`listPanel` e a de `table` também respondem ao clique. Para um elemento
clicável próprio, use `clickable` de `src/tui/pointer.ts`, que também pede o
ponteiro de mão ao terminal. Um componente novo entra nesse arquivo e fica
disponível para todas as telas.

## Criar uma aba

1. Copie `template/screen/example.ts` para `src/tui/screens/<id>.ts`.
2. Monte o conteúdo com os componentes e informações de `src/config/` ou
   dos coletores já usados pelo CLI. Leia `ctx.layout()` e componha para as
   três faixas.
3. Declare o `icon` da aba e as `actions` da tela, com tecla, descrição e a
   função que roda.
4. Ligue todo elemento clicável à mesma função de uma ação, com `button` e
   com a linha de `table` ou de `listPanel`.
5. Use `ctx.status` para o resumo da barra, `ctx.notify` para o resultado de
   uma ação e `ctx.confirm`, `ctx.prompt` e `ctx.choose` para perguntar.
6. Declare `watch()` para os arquivos lidos. Inicie trabalho em `onEnter`,
   pare em `onLeave` e em `onPause`, retome em `onResume`.
7. Registre em `src/tui/screens/index.ts`. A ordem da lista é a ordem das
   abas.
8. Se o `id` puder ser aba inicial, acrescente-o em `tui.initialTab` e em
   `--tab`.
9. Escreva o teste, com tecla, clique e um frame por faixa de largura.

A skill `termfy-tui` traz os cinco padrões de tela e a checklist de
qualidade em `skills/termfy-tui/references/`.

## Testar sem terminal

O OpenTUI tem um renderer de teste. `tests/tui.test.ts` monta a interface em
memória, envia teclas e confere o frame como texto:

```ts
import { expect } from "bun:test";
import { createTestRenderer } from "@opentui/core/testing";
import { mountTui } from "../src/tui/index.ts";

const setup = await createTestRenderer({ width: 120, height: 32 });
const closed = mountTui(setup.renderer, {});
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Environment");
setup.mockInput.pressKey("2");
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Settings");
setup.mockInput.pressKey("q");
await closed;
```

Capture um frame em 60×16, 80×24 e 120×32 para cobrir as três faixas.
`mountTui` aceita qualquer renderer; `startTui` cria o renderer real.
Essa separação é o que permite testar a TUI em CI. `setup.mockMouse` envia
clique, hover e roda, para conferir o caminho de mouse da mesma ação.

Os diálogos também entram no teste: aceite e negue um `confirm`, envie um
valor recusado por `validate` e capture o frame de um `prompt` com `secret`
para conferir a ausência do valor.

A skill `termfy-tui` traz o guia de design completo e a documentação do
OpenTUI em `references/opentui/`.
