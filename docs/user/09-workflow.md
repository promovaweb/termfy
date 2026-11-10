# Sequência de uso das skills

As oito skills cobrem o ciclo de um binário, da criação à release. A ordem
importa: cada uma deixa algo que a seguinte lê.

## Visão geral

```text
termfy-init ──► termfy-brand ──► termfy-spec ──► termfy-cli ──┐
                    ▲                 ▲          termfy-tui   │
                    │                 │          termfy-mcp   │
                    │                 │          termfy-config│
                    │                 └──────── (nova rodada) ◄┘
                    │                                │
                    └──── (identidade mudou)         ▼
                                              termfy-docs ──► release
```

## 1. Criar: `termfy-init`

Uma vez, logo depois de clicar em **Use this template**. Dá a identidade
inicial com `bun run init`, atualiza as skills instaladas, chama
`termfy-spec` para a primeira spec, confere `--version`, `about --json` e
`mcp --list`, roda `bun run validate` e prepara o primeiro commit.

Deixa pronto: `package.json` com a identidade, `CLISPEC.md` inicial, README
reescrito.

## 2. Apresentar: `termfy-brand`

Quando o nome, o título, a descrição, o autor, os links, a licença, os
créditos ou as cores mudarem. Cuida do que o `init` não toca: créditos em
`src/app/manifest.ts`, paleta em `src/tui/theme.ts`, painel "Standards" da
aba About, `CLISPEC.md`. Confere as superfícies: `--version`, `about`, aba
About, `info` do OpenCLI e nome do servidor MCP.

Deixa pronto: identidade coerente em todas as superfícies. Volte a ela
sempre que a marca mudar; ela não precisa rodar a cada rodada.

## 3. Especificar: `termfy-spec`

Antes de cada rodada de implementação. Entrevista em blocos curtos e grava
ou revisa `CLISPEC.md`: front matter com `commands`, `screens`, `mcp`,
`settings` e `credentials`, seções `Purpose`, `Audiences`, `Out of scope`,
`Checklist` e `Notes`. Fecha com `bun run dev -- spec check`: erros de
contrato são corrigidos na hora; avisos sobre o que ainda não existe no
código são o trabalho da rodada.

Deixa pronto: um item de checklist com `{#id}` por entrega. As skills de
implementação não começam sem ele.

## 4. Implementar: `termfy-cli`, `termfy-tui`, `termfy-mcp`, `termfy-config`

Uma entrega por vez, na ordem que a spec sugere. Um padrão comum para um
recurso novo:

1. `termfy-config` declara a key e a credencial que o recurso usa.
2. `termfy-cli` cria o command (ou a família `recurso verbo`), com testes em
   subprocesso e `opencli.json` regenerado.
3. `termfy-mcp` espelha o command em uma tool, reutilizando a mesma função.
4. `termfy-tui` dá uma aba ao recurso, com `listPanel` quando for lista.

Cada skill lê a entrada da spec antes de tocar no código e, ao concluir e
testar, marca o item da checklist pelo `{#id}` e avança `updatedAt`. Ao
final da rodada, `bun run dev -- spec check` sem avisos e `bun run validate`
verde.

## 5. Documentar: `termfy-docs`

Ao fechar a rodada. Lê `bun run dev -- --skill` como um agente que só tem o
binário leria, corrige a cobertura apontada por `bun run docs:check` (todo
command, screen, tool, resource, prompt, key e exit code precisa estar em
`docs/`), reescreve o que estiver fraco e regenera `docs/opencli.json`.

Deixa pronto: `docs/` embutida no binário dizendo a verdade sobre ele.

## 6. Publicar

`docs/release.md` do starter kit: versão, changelog, `bun run validate`,
commit, tag, push; o workflow compila os binários e cria a release.

## Quando sair da ordem

- Pedido pequeno em um command existente: `termfy-spec` só revisa a entrada
  e o item da checklist; depois `termfy-cli`.
- Só mudar texto da documentação: `termfy-docs` direto.
- Só mudar cores ou créditos: `termfy-brand` direto.
- Atualizar as skills para uma versão nova do framework:
  `bun run skills:update` e `bun run skills:check`; se a faixa de
  compatibilidade mudou, leia o `CHANGELOG.md` do framework antes da próxima
  rodada.

## O que cada skill não faz

- `termfy-init` não escreve a spec do produto; chama `termfy-spec`.
- `termfy-spec` não implementa; só descreve e confere.
- As skills de implementação não inventam requisitos; o que falta vai para
  `## Notes` da spec.
- `termfy-docs` não documenta o framework nem as skills; documenta o
  binário.
- Nenhuma skill faz commit, tag ou release por conta própria.
