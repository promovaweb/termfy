# termfy

A skill `termfy` é a porta de entrada do framework. Você descreve a
ferramenta em uma frase e ela conduz o projeto desde o setup e a
especificação até a publicação. Cada evolução passa pela implementação,
pelos testes e pela revisão, com a documentação atualizada ao fechar a
spec. Para realizar esse trabalho, ela escolhe a ordem,
chama as outras skills e para em dois checkpoints para você aprovar. No
fim, você tem um binário com specs fechadas, os três modos conferidos e um
resumo de como instalar e rodar.

## Quando usar

Chame a `termfy` nestas situações:

- Você tem só a ideia, em linguagem natural ("quero um CLI que liste os
  pedidos da loja e avise quando chegar um novo").
- Você quer continuar o trabalho de um binário e não sabe a etapa onde ele
  parou. A skill lê o repositório e descobre sozinha.
- Você não sabe qual skill específica pedir.

Prefira outra skill nestes casos:

- Só setup, instalação ou reparo das skills: use
  [termfy-init](termfy-init.md). A `termfy` encaminha para ela e não abre
  a entrevista do produto.
- Mudar nome, cores ou créditos: use [termfy-brand](termfy-brand.md).
- Uma única evolução, com o `CLISPEC.md` já escrito: vá direto à
  [termfy-spec](termfy-spec.md).

## Como pedir

Para começar do zero, com só a ideia:

> Use a skill termfy para criar um CLI chamado mycli que liste os pedidos
> da loja, mostre o detalhe de um pedido e avise no terminal quando chegar
> um pedido novo.

Para retomar um projeto parado:

> Use a skill termfy para continuar o mycli de onde ele parou.

Para uma evolução que atravessa CLI e MCP:

> Use a skill termfy para fazer o mycli exportar os pedidos do dia em CSV
> para o CI, com uma tool MCP para o agente pedir o mesmo arquivo.

## O que a skill faz

1. Confirma a identidade em uma única mensagem: nome do executável, uma
   frase de propósito e os públicos (você no terminal, o script que
   roda, o agente). O resto vem das entrevistas das outras skills.
2. Faz o diagnóstico do repositório com `git status --short`,
   `bun run dev -- --version` e `bun run skills:check`. Lê o
   `CLISPEC.md` e o `Status:` de cada arquivo de `specs/` para achar o
   estágio atual.
3. No esqueleto, chama a [termfy-init](termfy-init.md) e, se houver cor,
   créditos ou links a ajustar, a [termfy-brand](termfy-brand.md).
4. Chama a [termfy-clispec](termfy-clispec.md). Antes, extrai da sua frase
   as respostas que a entrevista pede, para não perguntar de novo.
5. Chama a [termfy-spec](termfy-spec.md) para a primeira spec da lista, ou
   a [termfy-api-import](termfy-api-import.md) quando o ponto de partida é
   a documentação de uma API.
6. Checkpoint 1: mostra o Purpose, os públicos, a lista de specs e a
   tabela de commands, screens e tools da primeira spec. Você aprova.
7. Implementa cada tarefa pendente na ordem config, api, database, cli,
   mcp e tui, com a skill de cada uma. Depois de cada tarefa, roda a
   `termfy-test` para os itens de Tests.
8. Roda a `termfy-review`, corrige o que ela apontar e passa pela
   `termfy-docs`. Com todos os itens marcados, fecha a spec e segue para a
   próxima da lista.
9. Checkpoint 2: mostra o `--help`, o frame da TUI de teste e o
   `mcp --list`. Você aprova a release.
10. Chama a `termfy-release` e, se você vai usar o binário com um agente,
    a `termfy-mcp-client`.

## Exemplo

A frase "quero um CLI que liste meus pedidos da loja, mostre o detalhe de
um pedido e avise quando chegar um novo" vira a mensagem de confirmação
abaixo. A skill sugere a forma final e espera o seu sim.

```text
Antes de começar, confirme três pontos:

1. Executável: mycli, título "My CLI". Pode ser?
2. Propósito: "Query shop orders from the terminal."
3. Públicos: você no terminal, com TUI para acompanhar pedidos novos.
   Algum script ou agente vai usar o mycli?

Proposta de specs, na ordem de entrega:

  0001  shop-client     cliente da API da loja com shop.token
  0002  orders-list     orders list, screen orders, tool orders_list
  0003  orders-show     orders show <id>, detalhe na screen orders
  0004  orders-watch    aviso de pedido novo na TUI

Fora do escopo: criar ou cancelar pedidos.
```

Depois do checkpoint 1, cada marco chega em três linhas:

```text
Pronto: command orders list (Tasks da 0002 marcada).
Próximo: tool orders_list com a termfy-mcp.
Teste agora: bun run dev -- orders list --json
```

Os estágios que a skill percorre ficam nesta tabela, resumida da
referência `flow.md`:

| Estágio | Skill | Checkpoint |
| --- | --- | --- |
| Diagnóstico | `termfy` | não |
| Identidade | `termfy-init`, `termfy-brand` | não |
| Visão macro | `termfy-clispec` | não |
| Spec | `termfy-spec` ou `termfy-api-import` | sim, na primeira spec |
| Implementação | `termfy-config` até `termfy-tui` | não |
| Testes, revisão, docs | `termfy-test`, `termfy-review`, `termfy-docs` | não |
| Fechamento | `termfy-spec` | não |
| Release | `termfy-release` | sim, antes |
| Agentes | `termfy-mcp-client` | não |

## Regras que a skill segue

- **Poucas perguntas, cedo.** No máximo três perguntas além da identidade,
  em uma mensagem, com um caminho recomendado em cada. Assim você responde
  uma vez e o resto corre sem interrupção.
- **Sugerir, não escolher sozinha.** Nome do executável, commands,
  credenciais e a divisão em specs chegam com a forma final para você
  aprovar ("`orders list`, pode ser?"). Até o checkpoint 1, nada vira
  código.
- **Dois checkpoints fixos.** Um depois do `CLISPEC.md` e da primeira
  spec, outro antes da release. Esses são os pontos que mudam o produto; o
  resto é execução.
- **Uma entrega por vez.** Cada tarefa termina com teste verde e item
  marcado na spec antes da próxima. Isso deixa o progresso visível no
  próprio arquivo da spec.
- **Reutiliza as skills.** A `termfy` lê a saída de cada skill e decide o
  passo seguinte, sem refazer o trabalho delas.
- **Para depois de duas falhas.** Se teste, `validate` ou build falham duas
  vezes seguidas no mesmo passo, ela mostra o erro e pergunta. Insistir em
  loop gasta tempo sem corrigir a causa.
- **Segredo fora do chat.** Quando um command precisa de credencial, ela
  orienta `mycli credentials set shop.token` no seu terminal e segue com o
  restante. O valor fica no cofre cifrado, longe do histórico da conversa.
- **Volta à skill certa.** Se você pede algo que contradiz a spec aprovada,
  ela volta à `termfy-spec`. Se muda o propósito, os públicos ou os
  limites, volta à `termfy-clispec`.

## O que ela entrega

No fim, a skill relata:

- o estágio alcançado;
- os commands, screens e tools entregues;
- as specs fechadas e as abertas;
- os testes executados;
- as pendências registradas em `## Notes`;
- os comandos para você experimentar os três modos.

Os arquivos que mudam são os das skills chamadas: `package.json`,
`CLISPEC.md`, `specs/`, código em `src/`, testes, `docs/` e
`CHANGELOG.md`. Commit, tag e GitHub Release só acontecem na etapa da
`termfy-release`, depois do seu aceite no checkpoint 2.

## Próxima skill

A `termfy` não tem uma próxima skill: ela chama as demais. Para entender
cada etapa, siga a ordem do ciclo a partir da
[termfy-init](termfy-init.md), depois a
[termfy-clispec](termfy-clispec.md) e a [termfy-spec](termfy-spec.md).
