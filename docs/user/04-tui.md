# TUI

## Estrutura da tela

```text
▌ Meu CLI v0.1.0  │  Consulta e atualiza pedidos da loja.        linux-x64 • Bun 1.3.14
───────────────────────────────────────────────────────────────────────────────────────
 Overview      About
▬▬▬▬▬▬▬▬▬▬▬▬▬▬
 ╭─ Ambiente ──────────────────────────────╮╭─ Estado ──────────────────────────────╮
 │ Binário     meucli v0.1.0               ││ settings.json     • padrões           │
 │ Runtime     Bun 1.3.14                  ││ credentials.json  • vazio             │
 ╰─────────────────────────────────────────╯╰───────────────────────────────────────╯
  ←/→  aba   1-9  ir   ?  ajuda   q  sair
```

`src/tui/index.ts` monta quatro faixas: cabeçalho de uma linha, abas
(`TabSelectRenderable`), conteúdo da aba ativa e barra de teclas. Cada aba é
um arquivo em `src/tui/telas/` que exporta um objeto `Tela` com `id`,
`titulo`, `descricao`, `montar(ctx)` e, quando precisa, `teclas`, `aoTecla`,
`aoEntrar` e `aoSair`.

O starter kit traz duas abas. **Overview** mostra ambiente, estado da
configuração e do cofre, configuração em vigor e próximos passos. **About**
mostra binário, projeto, créditos e padrões seguidos, com os mesmos dados do
comando `about`.

## Teclas

| Tecla | Ação |
| --- | --- |
| `←` `→` `[` `]` | aba anterior ou seguinte |
| `Tab` | próxima aba |
| `1` … `9` | ir para a aba de mesmo número |
| `?` | mostrar ou esconder a ajuda |
| `q` `Esc` `Ctrl+C` | sair |

A tela declara as próprias teclas em `teclas` e as trata em `aoTecla`. Elas
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
  origens externas. Verde, âmbar e vermelho só para estado, sempre com texto
  ao lado.
- Barra de status com teclas em blocos invertidos.
- Nada pisca, nada rola sozinho. A tela atualiza quando há dado novo.
- Glifos de uma célula. Emoji fora, porque a largura varia por terminal.

As cores vivem em `src/tui/tema.ts`, em duas paletas (`noite`, derivada do
Tokyo Night, e `dia`), com nomes de papel: `acento`, `textoSutil`, `borda`,
`ok`, `aviso`, `erro`. Uma tela nunca escreve um hexadecimal.

## Componentes

`src/tui/componentes.ts` oferece `painel`, `tabelaChaveValor`, `lista`,
`titulo`, `sutil` e `espaco`. Todos recebem o tema. Um componente novo entra
nesse arquivo e fica disponível para todas as telas.

## Criar uma aba

1. Copie `template/tela/exemplo.ts` para `src/tui/telas/<id>.ts`.
2. Monte o conteúdo com os componentes e dados de `src/config/` ou dos
   coletores já usados pelo CLI.
3. Registre em `src/tui/telas/index.ts`. A ordem da lista é a ordem das abas.
4. Se o `id` puder ser aba inicial, acrescente-o em `tui.abaInicial` e em
   `--aba`.
5. Escreva o teste.

## Testar sem terminal

O OpenTUI tem um renderer de teste. `tests/tui.test.ts` monta a interface em
memória, pressiona teclas e confere o frame como texto:

```ts
const setup = await createTestRenderer({ width: 110, height: 30 });
const encerrada = montarTui(setup.renderer, {});
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Ambiente");
setup.mockInput.pressKey("2");
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Créditos");
setup.mockInput.pressKey("q");
await encerrada;
```

`montarTui` aceita qualquer renderer; `iniciarTui` cria o renderer real.
Essa separação é o que permite testar a TUI em CI.

A skill `termfy-tui` traz o guia de design completo e a documentação do
OpenTUI 0.8.3 em `references/opentui/`.
