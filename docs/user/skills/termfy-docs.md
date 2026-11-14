# termfy-docs

A `termfy-docs` melhora a documentação embutida do binário, a pasta
`docs/` que entra no executável e sai por `--skill`, pela tool MCP `skill`
e pela resource `<bin>://skill`. Ela confere a cobertura contra o registry
com `bun run docs:check`, relê tudo como um agente que só tem o binário e
regenera `docs/opencli.json` quando o registry muda. No fim, você tem
`docs:check` verde, exemplos que rodam de verdade e uma leitura completa do
`--skill` sem ponto onde o agente trave.

## Quando usar

Use esta skill nestas situações:

- `bun run docs:check` falhou depois que o command `orders list` entrou no
  registry;
- a entrega da spec 0002 criou a tool `orders_list` e a screen `orders`.
  Mas `docs/` ainda não fala delas;
- um agente chamou `mycli --skill` e não descobriu que `orders list` exige
  `shop.token`;
- você quer reescrever uma seção confusa de `docs/configuration.md`.

Não use para o guia do framework nem para explicar as skills: `docs/`
descreve o binário. Para mudar o nome, o título ou os créditos que aparecem
nos textos, use a [termfy-brand](termfy-brand.md). Para criar o command que
falta, use a [termfy-cli](termfy-cli.md); a documentação vem depois que ele
existe no registry.

## Como pedir

Para corrigir uma falha de cobertura:

> Use a skill termfy-docs para fazer o `docs:check` passar depois do
> command `orders list` e da tool `orders_list`.

Para revisar a leitura como agente:

> Use a skill termfy-docs para reler o `--skill` do mycli inteiro e
> completar o que falta para um agente usar `orders list` sem perguntar.

Para cumprir as tarefas da spec:

> Use a skill termfy-docs para concluir os itens `#termfy-docs` da spec
> 0002 e documentar a screen `orders` em `docs/tui.md`.

## O que a skill faz

1. Roda `git status --short`, `bun run docs:check` e `bun run opencli:check`
   para saber o ponto de partida.
2. Lê `bun run dev -- --skill` do começo ao fim e anota onde um agente
   travaria: conceito sem explicação, command sem exemplo, exit code sem
   causa, key sem padrão.
3. Corrige primeiro as faltas do `docs:check`. Cada entrada do registry
  ganha linha na tabela da seção certa, com um parágrafo de explicação
  quando introduzir um conceito novo.
4. Reescreve as seções fracas seguindo a forma de cada seção (o que é,
   exemplo, tabela, falhas, como estender). Prefere cortar a inflar.
5. Roda `bun run opencli` se o registry mudou e repete `bun run docs:check`.
6. Relê `bun run dev -- --skill <topic>` de cada topic alterado, por
   exemplo `bun run dev -- --skill cli`.
7. Roda `bun run validate`.
8. Marca `[x]` nos itens `#termfy-docs` concluídos da spec aberta.

## Exemplo

Depois da spec 0002, o `docs:check` aponta o que falta:

```text
✗ docs/cli.md does not mention command "orders"
✗ docs/cli.md does not mention command "orders list"
✗ docs/mcp.md does not mention tool "orders_list"
✗ docs/tui.md does not mention screen "orders"
```

A skill acrescenta uma seção a `docs/cli.md`. Ela abre com a pergunta que
responde, mostra o exemplo antes da tabela e diz o que falha:

````markdown
## Pedidos da loja

`orders list` lista os pedidos da loja. Exige `shop.token` gravado com
`{{bin}} credentials set shop.token`.

```bash
{{bin}} orders list --json
```

| Command | Função |
| --- | --- |
| `orders list` | Lista os pedidos. Chama a API da loja. |

Sem `shop.token`, sai com 4 (`CREDENTIALS`). Falha de rede ou resposta
inesperada da API sai com 5 (`NETWORK_OR_API`).
````

O texto usa `{{bin}}` no lugar de `mycli`. O binário e o `docs:check`
trocam o placeholder pelo nome real, então `bun run init` não precisa
editar `docs/`. A lista exata de options não entra à mão: ela vem de
`--skill reference`, gerada do registry.

Na mesma passada, `docs/mcp.md` ganha `orders_list` na tabela de tools e
`docs/tui.md` ganha a screen `orders` com suas teclas. Como o registry
mudou, a skill roda `bun run opencli`. O `docs:check` termina com:

```text
✓ docs/ covers every command, screen, tool, resource, prompt, setting and exit code
```

## Regras que a skill segue

- **Referência vem do registry.** A lista de options sai de
  `--skill reference`. Copiá-la à mão em `docs/cli.md` cria uma segunda
  fonte que envelhece a cada mudança.
- **Toda entrada tem menção.** Command, screen, tool, resource, prompt e key
  de configuração aparecem na tabela da seção certa. É o que o
  `docs:check` confere.
- **Cada seção responde a uma pergunta.** O que é, como entrar, o que sai, o
  que pode falhar e com qual exit code. Essas informações orientam você e o
  agente durante o uso do binário.
- **Exemplos executáveis.** Cada exemplo começa pelo nome do binário, cabe
  em uma linha e precisa funcionar para orientar a execução pelo agente.
- **Placeholders no lugar de nomes.** `{{bin}}`, `{{title}}`, `{{version}}`
  e `{{BIN}}` mantêm `docs/` válido depois do `bun run init`.
- **Código em inglês, prosa no idioma do projeto.** Nomes de commands, keys
  e campos aparecem como no código, para o agente copiar sem traduzir.
- **`opencli.json` não se edita à mão.** Ele é regenerado com
  `bun run opencli` a cada mudança do registry.
- **`docs/` fala do binário.** O framework e as skills ficam no guia do
  Termfy, para o executável carregar apenas as instruções de uso do binário.
- **Texto por tópico.** Um topic acima de 200 linhas deve ser dividido ou
  revisto para remover repetições. Repetir a referência gerada aumenta o
  consumo de tokens sem acrescentar instruções ao agente.

## O que ela entrega

No relatório final, a skill lista:

- os arquivos de `docs/` alterados (`docs/README.md`, `docs/cli.md`,
  `docs/tui.md`, `docs/mcp.md`, `docs/configuration.md` ou
  `docs/exit-codes.md`);
- as faltas de cobertura corrigidas;
- as seções reescritas;
- `docs/opencli.json` regenerado, quando o registry mudou;
- os comandos de validação executados e o resultado de cada um.

A spec aberta recebe `[x]` nos itens `#termfy-docs` concluídos. O
fechamento da spec fica com a `termfy-spec`.

## Próxima skill

Com a documentação em dia e todos os itens da spec marcados, feche a spec
pela [termfy-spec](termfy-spec.md). Com as specs da versão fechadas, siga
para a [termfy-release](termfy-release.md).
