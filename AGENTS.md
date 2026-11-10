# Instruções para agentes

Este repositório é o Termfy: um framework de skills mais um esqueleto de
binário em Bun com três modos no mesmo executável: TUI (sem argumentos),
CLI (com argumentos, saída em texto ou `--json`) e servidor MCP via stdio
(`<bin> mcp`). Ele é um template do GitHub; projetos derivados herdam esta
estrutura e estas regras.

## Idioma

Código, comentários, documentação, mensagens de interface e respostas em
Português do Brasil. Termos técnicos consagrados ficam em inglês (`build`,
`stdin`, `flag`, `tool`, `resource`).

## Ordem de leitura

1. Este arquivo.
2. `docs/arquitetura.md` para entender as camadas.
3. A skill compatível com a tarefa em `skills/`:
   - `termfy-iniciar`: criar um binário novo a partir do template;
   - `termfy-cli`: comandos, opções, saída e códigos de saída;
   - `termfy-tui`: telas, tema e interação por teclado;
   - `termfy-mcp`: tools, resources e prompts;
   - `termfy-config`: settings, credenciais e variáveis.
4. As `references/` indicadas pela skill. Citar uma referência não substitui
   abri-la.

## Regras que valem para toda mudança

- Toda opção, argumento, subcomando, tool e chave de configuração nasce
  documentado: `descricao` no registro, linha na tabela de `docs/` e, quando
  for conceito novo, parágrafo em prosa. O `--skill` imprime `docs/` inteiro
  mais a referência gerada do registro, então `docs/` precisa continuar
  correto para quem lê o binário sem o repositório.
- Códigos de saída vêm de `src/app/saida.ts`. Zero é sucesso. Não invente
  números em comandos; acrescente a família na tabela.
- Segredos nunca passam por argumento, log, erro, `--json` sem `--reveal`,
  tool MCP ou frame da TUI. Leia com `obterCredencial()`.
- Stdout recebe dados; stderr recebe progresso e avisos. Em `mcp`, stdout é
  do JSON-RPC.
- Um arquivo por comando, por tela e por grupo de tools. Registro central em
  `src/cli/comandos.ts`, `src/tui/telas/index.ts` e `src/mcp/servidor.ts`.
- Cores da TUI só em `src/tui/tema.ts`.
- Node e npm não entram: o projeto usa Bun para rodar, testar e compilar.
- Documente código novo ou alterado com cabeçalho explicando o propósito do
  arquivo e JSDoc em funções exportadas.

## Validação antes de concluir

```bash
bun run validar
```

Encadeia `typecheck`, `bun test`, `skills:validar`, `opencli:check` e
`build`. Quando o registro de comandos mudar, rode `bun run opencli` antes
e revise o diff de `docs/opencli.json`. Confira `git status --short` ao
final e preserve mudanças que já existiam.

## Publicação

Toda alteração publicada sai com versão em `package.json`, entrada em
`CHANGELOG.md`, tag `vX.Y.Z` e GitHub Release com binários. O fluxo está em
`docs/release.md`. Tags não são movidas.

## Skills

As skills seguem o formato `SKILL.md` com frontmatter `name` e
`description`, mais `references/`. O texto de instrução fica em prosa
direta, sem travessão como pontuação, sem clichês de abertura ou fechamento e
com verbos no imperativo. `bun run skills:validar` confere a estrutura e os
links.
