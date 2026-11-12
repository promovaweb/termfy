# Sequência de uso das skills

As dezoito skills cobrem o ciclo de um binário, da frase da pessoa à
release. A ordem importa: cada uma deixa algo que a seguinte lê.

O trabalho gira em torno de dois documentos. O `CLISPEC.md`, único por
binário, guarda a visão macro: o que o binário é, a que públicos serve, o que fica de
fora e a superfície já entregue. Cada evolução ganha uma spec em
`specs/NNNN-slug.md`, com as mudanças na superfície, como o binário vai
funcionar (Behavior), como o código deve ser feito (Design), as tarefas e
os testes de aceite. A spec começa na entrevista, recebe as marcas das
skills de implementação e, concluída, tem a superfície copiada para o
`CLISPEC.md` pelo agente. Os dois documentos são Markdown puro, escritos à
mão pelo agente; o binário não os lê.

## Visão geral

```text
frase da pessoa
      │
      ▼
termfy ─────────────────────────────────────────────────────────┐
  ├─► termfy-init ─► termfy-brand                                      │
  ├─► termfy-clispec  (CLISPEC.md e specs iniciais)                    │
  ├─► por spec: termfy-spec  (ou termfy-api-import)                    │
  │   ├─► por entrega: termfy-config ─► termfy-api ─►                  │
  │   │   termfy-database ─► termfy-cli / termfy-command-set ─►        │
  │   │   termfy-mcp ─► termfy-tui                                     │
  │   │   └─► termfy-test                                              │
  │   ├─► termfy-review ─► termfy-docs                                 │
  │   └─► fechamento                                                   │
  └─► termfy-release ─► termfy-mcp-client                              │
                                                                       │
  (identidade → termfy-brand; propósito → termfy-clispec;              │
   nova evolução → termfy-spec) ◄──────────────────────────────────────┘
```

## 0. Entrar: `termfy`

Quando a pessoa descreve o que quer em linguagem natural e não nomeia uma
skill. `termfy` diagnostica o estágio do repositório, confirma nome,
propósito e públicos em uma única mensagem e chama as demais skills na
ordem abaixo. Para só duas vezes: na aprovação do `CLISPEC.md` com a
primeira spec e antes da release.

## 1. Criar: `termfy-init`

No setup, logo depois de clicar em **Use this template**, peça ao agente
para usar `termfy-init`. Ela aplica a identidade, mantém as skills e passa
para `termfy-clispec`, confere `--version`, `about --json` e `mcp --list` e
roda `bun run validate`.

Em um projeto existente, use a mesma skill no modo de manutenção para
instalar, atualizar ou reparar as skills, preservando a identidade, o
`CLISPEC.md` e as specs. O agente executa os comandos internos de cada modo.

## 2. Apresentar: `termfy-brand`

Quando o nome, o título, a descrição, o autor, os links, a licença, os
créditos ou as cores mudarem. Cuida do que o `init` não altera: créditos,
paleta, painel "Standards" da aba About, campos de identidade do
`CLISPEC.md`. Confere as
superfícies: `--version`, `about`, aba About, `info` do OpenCLI e nome do
servidor MCP.

## 3. Descrever o binário: `termfy-clispec`

Uma vez no começo. De novo quando o propósito, os públicos ou os limites
mudarem. `termfy-clispec` entrevista a pessoa para entender o que o binário
precisa fazer (problema, públicos e modos, capacidades, dados e
integrações, limites) e grava a visão macro no `CLISPEC.md`. Com a pessoa,
monta a lista de specs iniciais, uma por capacidade entregável. Grava
cada uma em `specs/` como `draft`, com a linha correspondente no índice.

Deixa pronto: o `CLISPEC.md` com Purpose, Audiences, Out of scope, a
Surface do que o esqueleto já entrega e o índice das specs iniciais em
`draft`.

## 4. Especificar cada evolução: `termfy-spec` ou `termfy-api-import`

Antes de cada evolução. `termfy-spec` entrevista em blocos curtos e escreve
a spec: Goal, Behavior, Design, Surface com as mudanças na superfície,
Tasks e Tests. Quando o ponto de partida é a documentação de uma API
(OpenAPI, Postman, página ou texto), `termfy-api-import` lê a documentação,
propõe commands por recurso, tools, settings e credenciais. Grava tudo
em Surface de uma spec nova. Em ambos os casos, a spec segue o contrato
antes de sair de `draft`: Goal, Behavior e Design com texto e ao menos uma
tarefa. O que a spec planeja e o código ainda não tem é o trabalho da
evolução.

Deixa pronto: uma tarefa com a tag da skill responsável por entrega e um
teste de aceite por resultado esperado.

## 5. Implementar, uma entrega por vez

Ordem para um recurso novo:

1. `termfy-config` declara a key e a credencial que o recurso usa.
2. `termfy-api` cria o client do serviço externo, quando houver.
3. `termfy-database` cria as tabelas por migration e os repositórios, só
   quando a spec pede que o binário guarde dados entre execuções.
4. `termfy-cli` cria um command avulso; `termfy-command-set` gera a família
   `recurso list|show|create|update|delete` de uma vez, com tools e screen.
5. `termfy-mcp` espelha o que faltou em tools, reutilizando as funções.
6. `termfy-tui` dá uma aba ao recurso, com `listPanel` quando for lista.
7. `termfy-test` escreve os testes de aceite da spec nos três modos antes
   de marcar o item.

Cada skill lê a spec aberta antes de mexer no código, segue o Behavior e o
Design e, ao concluir e testar, marca `[x]` no item da spec. O
`CLISPEC.md` não muda nessa etapa: o código fica à frente dele até o
fechamento. Se o código ganhou algo que nenhuma spec previa, crie uma spec
de adoção e descreva o que já existe em Surface; essas entradas chegam ao
`CLISPEC.md` quando ela fechar.

## 6. Fechar a spec: `termfy-review`, `termfy-docs` e `termfy-spec`

`termfy-review` audita a entrega contra o Behavior e o Design da spec,
confere à mão o `CLISPEC.md` e as specs contra o código e confere as
regras (segredos, stdout do MCP, exit codes, descriptions, cores, docs,
idioma), diz se a spec pode ser fechada e devolve uma lista por gravidade,
sem editar. Corrigido o que ela apontou, `termfy-docs` relê
`bun run dev -- --skill` como um agente leria, corrige a cobertura apontada
por `bun run docs:check` e regenera `docs/opencli.json`. Com todos os itens
marcados, o agente fecha a spec pelo fluxo de `termfy-spec`: aplica Surface
às tabelas do `CLISPEC.md`, troca o status para `done` na spec e no índice
e registra a data nas Notes do `CLISPEC.md`. A próxima spec da lista volta à etapa 4.

## 7. Publicar e ligar aos agentes: `termfy-release` e `termfy-mcp-client`

`termfy-release` publica depois que as specs da versão foram fechadas.
Avança a versão, escreve o changelog (que pode citar os IDs das specs
fechadas), valida e cria commit e tag. Depois confere a release que o workflow
gera, com binários e checksums.
`termfy-mcp-client` configura o binário em Claude Code, Codex, Cursor,
OpenCode ou Gemini CLI e valida com `mcp --list` e o Inspector.

## Quando sair da ordem

- Pedido pequeno em um command existente: `termfy-spec` escreve uma spec
  curta com a alteração em Surface, uma tarefa e um teste; depois
  `termfy-cli`, `termfy-test` e o fechamento da spec.
- Só mudar texto da documentação: `termfy-docs` direto.
- Só mudar cores ou créditos: `termfy-brand` direto.
- Só revisar antes de um merge: `termfy-review` direto.
- Atualizar as skills para uma versão nova do framework:
  `termfy-init` no modo de manutenção das skills; se a faixa de
  compatibilidade mudou, leia o `CHANGELOG.md` do framework antes da próxima
  etapa.

## O que cada skill não faz

- `termfy` não implementa; orquestra.
- `termfy-init` não escreve o `CLISPEC.md` do produto; passa para
  `termfy-clispec`.
- `termfy-clispec` não planeja tarefas; descreve o binário e cria as specs
  iniciais.
- `termfy-spec` e `termfy-api-import` não implementam; descrevem e conferem.
- `termfy-database` não entra sem pedido; o padrão é não guardar dados além
  de settings e credenciais.
- As skills de implementação não inventam requisitos nem marcam itens no
  `CLISPEC.md`; o que falta vai para `## Notes` da spec.
- `termfy-review` não edita; relata.
- `termfy-docs` não documenta o framework nem as skills; documenta o
  binário.
- Só `termfy-release` faz commit, tag e release. Ela faz isso quando a
  pessoa pede.
