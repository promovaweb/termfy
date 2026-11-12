# Descrever e especificar

Antes de escrever código, o agente precisa saber o que construir. O Termfy
registra isso em dois documentos em Markdown puro. O `CLISPEC.md`, único,
descreve o binário inteiro. Cada arquivo de `specs/` descreve uma evolução.
Neste capítulo você acompanha as duas entrevistas do `mycli` e vê os
documentos que elas gravam.

| Documento | Quantos | Responde | Skill |
| --- | --- | --- | --- |
| `CLISPEC.md` | um, na raiz | o que o binário é, a que públicos serve, o que já entrega | [termfy-clispec](skills/termfy-clispec.md) |
| `specs/NNNN-slug.md` | um por evolução | o que muda agora, como funciona, como o código deve ser feito | [termfy-spec](skills/termfy-spec.md) |

O binário não lê nenhum dos dois. Eles servem ao agente e a você. O
agente consulta a spec antes de mexer no código e marca o que entregou.
Você confere o trabalho lendo a spec.

## 1. A entrevista do CLISPEC

Peça ao agente:

> Use a skill termfy-clispec para descrever o mycli. É uma ferramenta para
> a equipe da loja consultar pedidos sem abrir o painel web.

A skill pergunta em blocos curtos, na ordem problema, públicos e modos,
capacidades, dados e integrações, limites. Quando a sua frase já responde
um bloco, ela confirma o que entendeu e segue. Um trecho da conversa:

```text
Agente: Que tarefa a equipe faz hoje sem o mycli, e o que dá trabalho nela?
Você:   Abre o painel da loja para ver pedidos abertos. É lento e não dá
        para usar em script.
Agente: Que públicos vão usar o binário? Recomendo três:
        1. operador no terminal (TUI e CLI texto) (recomendado)
        2. só scripts e CI (CLI --json)
        3. só agentes (MCP)
Você:   O 1, mais o CI exportando pedidos do dia e um agente que só consulta.
Agente: Entendi: operador na TUI e na CLI, CI no --json, agente no MCP só
        para leitura. O binário fala com a API da loja com um token?
Você:   Sim, um token de API do painel.
```

A cada bloco respondido, a skill escreve a seção correspondente e mostra o
trecho. No fim, monta com você a lista de specs iniciais, uma por
capacidade que dá para entregar sozinha.

## 2. O CLISPEC.md gravado

```markdown
# My CLI

`mycli`: Query and update shop orders.

## Purpose

A equipe da loja consulta pedidos no painel web, que é lento e não serve
para scripts. O `mycli` lista e detalha pedidos pela API da loja, no
terminal, em texto ou JSON. Um agente de IA pode consultar os pedidos pelo
MCP, sem alterar nada.

## Audiences

| Público | Modo | Necessidade |
| --- | --- | --- |
| operador | TUI e CLI texto | ver pedidos abertos e o detalhe de um pedido |
| CI | CLI `--json` | exportar os pedidos do dia com saída estável |
| agente de IA | MCP | consultar pedidos, só leitura |

## Out of scope

- Criar, cancelar ou reembolsar pedidos.
- Várias lojas no mesmo binário.

## Surface

### Commands

| Command | Função | Options | `data` no `--json` | Exit codes | Credenciais |
| --- | --- | --- | --- | --- | --- |
| `about` | Show version, executable, runtime, platform and credits. | nenhuma | `{ bin, title, version, ... }` | 0 | nenhuma |
| `config list\|get\|set\|unset\|path\|schema` | Read and write preferences in `~/.mycli/settings.json`. | `key`, `value` | `{ key, value }` e variações | 2, 3 | nenhuma |

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `overview` | ambiente, estado da configuração e próximos passos | `←` `→`, `?`, `q` |
| `about` | identidade, projeto e créditos | `←` `→`, `?`, `q` |

### MCP

| Tipo | Nome | Função | Efeito |
| --- | --- | --- | --- |
| tool | `about` | identidade e runtime | `read` |
| tool | `config_get` | valor de uma key | `read` |

### Settings

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `output.format` | `enum` (`text`, `json`) | `text` | formato padrão da saída |
| `tui.theme` | `enum` (`night`, `day`) | `night` | paleta da TUI |

## Specs

| ID | Título | Status |
| --- | --- | --- |
| 0001 | Listar pedidos | draft |
| 0002 | Detalhar um pedido | draft |

## Notes

- 2026-11-12: visão macro registrada em entrevista.
```

O exemplo encurta as tabelas de Surface. No arquivo real, a skill lista
tudo o que o esqueleto entrega, lido do código: os commands do registry,
as screens de `src/tui/screens/index.ts`, o que aparece em `mcp --list` e
as keys de `SETTINGS_SCHEMA`. Assim a Surface começa igual ao código.

Repare em três regras do documento:

- **Surface descreve só o que já existe.** O command `orders list` ainda
  não aparece nela, porque nenhuma spec foi fechada. Trabalho pendente
  fica nas specs.
- **A linha de identidade copia o `package.json`.** Para mudar nome ou
  descrição, use a [termfy-brand](skills/termfy-brand.md).
- **Nomes do código em inglês, prosa no seu idioma.** `orders list`,
  `shop.token` e `tui.theme` aparecem como no código.

Cada spec aprovada vira um arquivo `specs/0001-list-orders.md` com
`Status: draft` e as seções vazias, mais uma linha no índice `## Specs`.

## 3. A entrevista da spec

Peça ao agente:

> Use a skill termfy-spec para detalhar a spec 0001.

A entrevista segue a ordem objetivo, comportamento, superfície, dados e
integrações, desenho do código e aceite. As perguntas agora são
concretas: que options o command aceita, que campos vão no `--json`, que
exit code sai quando o token falta, qual arquivo guarda o client HTTP.

## 4. A spec gravada

```markdown
# 0001 Listar pedidos

Status: in_progress

## Goal

O operador e o CI precisam ver os pedidos da loja sem abrir o painel.
Filtrar por status entra; paginação além de 100 pedidos fica para depois.

## Behavior

`mycli orders list` mostra os pedidos abertos numa tabela com número,
cliente, total e data. `--status closed` troca o filtro. `--json` devolve
`{ count, orders[] }`. Sem `shop.token` no cofre, sai com 4 e a mensagem
manda rodar `mycli credentials set shop.token`. Falha da API sai com 5.
A tool `orders_list` devolve o mesmo `data`.

## Design

O client fica em `src/api/shop.ts`, com `listOrders({ status, limit })`,
usado pelo command e pela tool. A URL vem da key `shop.baseUrl`; o token,
de `getCredential("shop.token")`. GET com até três tentativas e timeout
de 5 segundos. O command segue `template/command/example.ts`; a tool,
`template/tool/example.ts`.

## Surface

- Adiciona o command `orders list`: List shop orders;
  `--status <open|closed>`, `--limit <n>`; `data` `{ count, orders[] }`;
  exit codes 4 e 5; credencial `shop.token`.
- Adiciona a tool `orders_list`: lista pedidos; efeito `network`.
- Adiciona a setting `shop.baseUrl`: `string`, padrão
  `https://api.example.com`, URL base da API.
- Adiciona a credencial `shop.token`: usada por `orders list` e
  `orders_list`; painel da loja, seção API.

## Tasks

- [ ] Key `shop.baseUrl` em `SETTINGS_SCHEMA` `#termfy-config`
- [ ] Client `listOrders` com timeout e retry `#termfy-api`
- [ ] Command `orders list` `#termfy-cli`
- [ ] Tool `orders_list` `#termfy-mcp`
- [ ] `orders list` em `docs/cli.md` `#termfy-docs`

## Tests

- [ ] `mycli orders list --json` devolve `{ count, orders[] }`
- [ ] Sem `shop.token`, `orders list` sai com exit code 4
- [ ] API com 500 três vezes faz `orders list` sair com 5
- [ ] `orders_list` devolve o mesmo `data` do command

## Notes

- 2026-11-12: limite de 100 pedidos por chamada, conforme a API.
```

Cada seção tem um papel:

| Seção | Responde | Leitor |
| --- | --- | --- |
| `Goal` | por que a mudança existe e o que fica de fora | você, ao aprovar |
| `Behavior` | como o binário funciona para a pessoa que usa | as skills de implementação e de teste |
| `Design` | onde e como o código deve ser feito | as skills de implementação |
| `Surface` | o que entra, muda ou sai da superfície | a revisão e o fechamento |
| `Tasks` | uma entrega por linha, com a tag da skill | o agente, para saber a próxima skill |
| `Tests` | um teste de aceite por linha, como comando e resultado | a [termfy-test](skills/termfy-test.md) |
| `Notes` | dúvidas e combinados, com data | todos |

Cada item de Surface aparece pelo nome em ao menos uma tarefa ou teste.
Essa regra garante que nada da superfície fique sem entrega nem sem
verificação.

## 5. O ciclo de uma spec

```text
draft ──► in_progress ──► done
   │                        │
   └──────► archived ◄──────┘
```

| Status | Quando | O que o agente faz |
| --- | --- | --- |
| `draft` | a spec existe, mas ainda tem dúvidas | entrevista e escreve |
| `in_progress` | Behavior e Design aprovados | implementa e marca `[x]` em cada tarefa e teste entregues |
| `done` | todas as tarefas e testes marcados | aplica a Surface às tabelas do `CLISPEC.md` e registra a data nas Notes |
| `archived` | a spec saiu do plano | mantém o arquivo como histórico |

O status muda na spec e na linha do índice do `CLISPEC.md` ao mesmo tempo.
Uma spec parada por algo externo continua `in_progress`, com o motivo
datado em Notes.

Ao fechar a 0001, o `CLISPEC.md` ganha a linha de `orders list` em
Commands, `orders_list` em MCP, `shop.baseUrl` em Settings e uma subseção
Credentials com `shop.token`. Nas Notes entra:

```markdown
- 2026-11-14: spec 0001 (Listar pedidos) closed.
```

## 6. A conferência manual

Nenhum script compara os documentos com o código. A conferência é uma
leitura, feita pela skill que escreve e de novo na
[termfy-review](skills/termfy-review.md):

- as seções estão na ordem do contrato;
- a linha de identidade bate com o `package.json`;
- há uma linha no índice para cada arquivo de `specs/`, com o mesmo
  título e status;
- cada item de Surface é citado em tarefa ou teste;
- depois do fechamento, cada command, tool, key e credencial do código
  aparece nas tabelas do `CLISPEC.md`.

Para adotar código que já existe sem spec, peça uma spec de adoção. Ela
lista esse código na Surface e é fechada logo em seguida, o que leva as
entradas ao `CLISPEC.md`.

## Próximo passo

Com a spec em `in_progress`, a primeira tarefa pendente indica a skill. Na
0001, a primeira é `#termfy-config`, seguida do client HTTP. O capítulo
[Integrar uma API](11-integrate-an-api.md) mostra esse trabalho com uma
API real.
