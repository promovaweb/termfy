# Sequência de uso das skills

As dezesseis skills cobrem o ciclo de um binário, da frase da pessoa à
release. A ordem importa: cada uma deixa algo que a seguinte lê.

## Visão geral

```text
frase da pessoa
      │
      ▼
termfy-build ─────────────────────────────────────────────────────────┐
  ├─► termfy-init ─► termfy-brand                                      │
  ├─► termfy-spec  (ou termfy-api-import, quando há doc de API)        │
  ├─► por entrega: termfy-config ─► termfy-api ─► termfy-cli /         │
  │                termfy-command-set ─► termfy-mcp ─► termfy-tui      │
  │                └─► termfy-test                                     │
  ├─► termfy-review ─► termfy-docs                                     │
  └─► termfy-release ─► termfy-mcp-client                              │
                                                                       │
  (identidade mudou → termfy-brand; nova rodada → termfy-spec) ◄───────┘
```

## 0. Entrar: `termfy-build`

Quando a pessoa descreve o que quer em linguagem natural e não nomeia uma
skill. `termfy-build` diagnostica o estágio do repositório, confirma nome,
propósito e públicos em uma única mensagem e chama as demais skills na
ordem abaixo. Para só duas vezes: na aprovação da spec e antes da release.

## 1. Criar: `termfy-init`

Uma vez, logo depois de clicar em **Use this template**. Dá a identidade
inicial com `bun run init`, atualiza as skills instaladas, chama
`termfy-spec` para a primeira spec, confere `--version`, `about --json` e
`mcp --list`, roda `bun run validate` e prepara o primeiro commit.

## 2. Apresentar: `termfy-brand`

Quando o nome, o título, a descrição, o autor, os links, a licença, os
créditos ou as cores mudarem. Cuida do que o `init` não toca: créditos,
paleta, painel "Standards" da aba About, `CLISPEC.md`. Confere as
superfícies: `--version`, `about`, aba About, `info` do OpenCLI e nome do
servidor MCP.

## 3. Especificar: `termfy-spec` ou `termfy-api-import`

Antes de cada rodada de implementação. `termfy-spec` entrevista em blocos
curtos e grava ou revisa `CLISPEC.md`. Quando o ponto de partida é a
documentação de uma API (OpenAPI, Postman, página ou texto),
`termfy-api-import` lê a documentação, propõe commands por recurso, tools,
settings e credenciais, e grava na spec. Em ambos os casos, o fechamento é
`bun run dev -- spec check`: erros de contrato são corrigidos na hora;
avisos sobre o que ainda não existe no código são o trabalho da rodada.

Deixa pronto: um item de checklist com `{#id}` por entrega.

## 4. Implementar, uma entrega por vez

Ordem para um recurso novo:

1. `termfy-config` declara a key e a credencial que o recurso usa.
2. `termfy-api` cria o client do serviço externo, quando houver.
3. `termfy-cli` cria um command avulso; `termfy-command-set` gera a família
   `recurso list|show|create|update|delete` de uma vez, com tools e screen.
4. `termfy-mcp` espelha o que faltou em tools, reutilizando as funções.
5. `termfy-tui` dá uma aba ao recurso, com `listPanel` quando for lista.
6. `termfy-test` cobre a entrega nos três modos antes de marcar o item.

Cada skill lê a entrada da spec antes de tocar no código e, ao concluir e
testar, marca o item da checklist pelo `{#id}` e avança `updatedAt`. Se o
código ganhou algo que a spec não previa, `bun run dev -- spec sync --write`
traz as entradas como rascunho para revisão.

## 5. Fechar a rodada: `termfy-review` e `termfy-docs`

`termfy-review` audita a entrega contra a spec e as regras (segredos, stdout
do MCP, exit codes, descriptions, cores, docs, idioma) e devolve uma lista
por gravidade, sem editar. Corrigido o que ela apontou, `termfy-docs` relê
`bun run dev -- --skill` como um agente leria, corrige a cobertura apontada
por `bun run docs:check` e regenera `docs/opencli.json`.

## 6. Publicar e ligar aos agentes: `termfy-release` e `termfy-mcp-client`

`termfy-release` avança a versão, escreve o changelog, valida, cria commit e
tag, e confere a release com binários e checksums gerada pelo workflow.
`termfy-mcp-client` configura o binário em Claude Code, Codex, Cursor,
OpenCode ou Gemini CLI e valida com `mcp --list` e o Inspector.

## Quando sair da ordem

- Pedido pequeno em um command existente: `termfy-spec` só revisa a entrada
  e o item da checklist; depois `termfy-cli` e `termfy-test`.
- Só mudar texto da documentação: `termfy-docs` direto.
- Só mudar cores ou créditos: `termfy-brand` direto.
- Só revisar antes de um merge: `termfy-review` direto.
- Atualizar as skills para uma versão nova do framework:
  `bun run skills:update` e `bun run skills:check`; se a faixa de
  compatibilidade mudou, leia o `CHANGELOG.md` do framework antes da próxima
  rodada.

## O que cada skill não faz

- `termfy-build` não implementa; orquestra.
- `termfy-init` não escreve a spec do produto; chama `termfy-spec`.
- `termfy-spec` e `termfy-api-import` não implementam; descrevem e conferem.
- As skills de implementação não inventam requisitos; o que falta vai para
  `## Notes` da spec.
- `termfy-review` não edita; relata.
- `termfy-docs` não documenta o framework nem as skills; documenta o
  binário.
- Só `termfy-release` faz commit, tag e release, e só quando a pessoa pede.
