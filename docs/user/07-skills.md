# Skills

Skills são pastas com um `SKILL.md` (instruções para o agente) e uma pasta
`references/` (material de apoio). Um agente de IA que trabalha no projeto
lê o `AGENTS.md`, escolhe a skill compatível com a tarefa e segue os passos.

## As dezoito skills

| Skill | Quando o agente usa |
| --- | --- |
| `termfy` | a pessoa descreve a ferramenta em uma frase; orquestra as demais com dois checkpoints |
| `termfy-api-import` | a pessoa envia a documentação de uma API; vira a seção Surface de uma spec |
| `termfy-api` | criar o client HTTP de um serviço externo, com token do cofre e testes locais |
| `termfy-command-set` | gerar uma família `recurso verbo` com tools e screen de uma vez |
| `termfy-test` | cobrir CLI, MCP, TUI e config com os testes de aceite da spec antes de marcar seus itens |
| `termfy-review` | auditar uma entrega e relatar por gravidade, sem editar |
| `termfy-release` | publicar versão, changelog, tag e release com binários |
| `termfy-mcp-client` | configurar o binário nos clientes de agente e validar |
| `termfy-brand` | ajustar nome, título, descrição, autor, links, créditos e paleta, em todas as superfícies do binário |
| `termfy-clispec` | entrevistar a pessoa para entender o que o binário precisa fazer e escrever o `CLISPEC.md`, a visão macro única: propósito, públicos, modos, fora de escopo e índice das specs |
| `termfy-spec` | entrevistar a pessoa a cada evolução e escrever `specs/NNNN-slug.md`: mudanças na superfície, como o binário vai funcionar, como o código deve ser feito, tarefas e testes |
| `termfy-database` | guardar dados entre execuções em SQLite, só quando a pessoa pede, com migrations embutidas no binário |
| `termfy-init` | fazer o setup de um binário ou manter as skills de um projeto existente |
| `termfy-cli` | criar ou alterar comandos, opções, saída, códigos de saída e OpenCLI |
| `termfy-tui` | criar ou alterar telas, componentes, tema e teclas |
| `termfy-mcp` | criar ou alterar tools, resources e prompts; testar com o Inspector |
| `termfy-config` | declarar chaves de configuração, consumir credenciais, revisar o cofre |
| `termfy-docs` | melhorar a documentação embutida, passar no `docs:check` e reler o `--skill` como um agente |

Cada `SKILL.md` segue a mesma forma: o que ler antes, regras que não mudam,
passos, marcos de progresso e o que relatar ao final. As regras repetem o
contrato do framework (toda opção documentada, segredos fora de argumentos,
stdout só para dados), para que o agente não dependa de ter lido o guia.

## O CLISPEC.md e as specs

Antes de implementar, o agente precisa saber o que construir. O contrato,
descrito na skill `termfy-spec`, tem dois documentos em Markdown puro, sem
front matter. O agente cria e edita os dois à mão; o binário não os lê nem
os embute.

**`CLISPEC.md`**, um por binário, na raiz, guarda a visão macro. A skill
`termfy-clispec` entrevista a pessoa em blocos curtos (problema, públicos e
modos, capacidades, dados e integrações, limites) e grava a identidade, as
seções `Purpose`, `Audiences`, `Out of scope`, `Surface`, `Specs` e
`Notes`. `Surface` descreve em tabelas o que já foi entregue: commands,
screens, MCP, settings, credenciais e, quando há banco, as tabelas SQLite
em `### Storage`, com os nomes do código. `Specs` é o índice das specs com
título e status. O `CLISPEC.md` não tem checklist: ele descreve o binário,
não o trabalho pendente.

**`specs/NNNN-slug.md`**, um por evolução, guarda o que muda. A skill
`termfy-spec` entrevista a pessoa a cada evolução (objetivo, comportamento,
superfície, dados e integrações, desenho do código, aceite) e grava a linha
`Status:` (`draft`, `in_progress`, `done` ou `archived`) e as seções
`Goal`, `Behavior` (como o binário vai funcionar), `Design` (como o código
deve ser feito), `Surface` (o que entra, muda ou sai da superfície),
`Tasks` (checklist com a tag da skill responsável no fim de cada item),
`Tests` (checklist de aceite) e `Notes`.

As skills de implementação leem a spec aberta, seguem o Behavior e o Design
e marcam `[x]` em cada tarefa e teste concluídos. Cada item de `Surface`
precisa aparecer em uma tarefa ou um teste. Enquanto a spec está aberta, o
código fica à frente do `CLISPEC.md`. Isso é esperado. Com todos os itens
marcados, o agente fecha a spec: aplica `Surface` às tabelas do
`CLISPEC.md`, troca o status para `done` na spec e no índice e registra a
data em `Notes`.

O banco de dados é opcional. O esqueleto não tem banco. Um binário só
ganha um quando a pessoa pede para guardar dados entre execuções. Nesse
caso, `termfy-database` cria `~/.<bin>/data.db` com SQLite, muda o schema
só por migrations embutidas no binário, faz backup antes de migrar e lista
as tabelas em `Surface`, que chegam a `### Storage` quando a spec fecha.

Nenhum script confere esses documentos. `bun run validate` cobre o código e
a documentação embutida; a correspondência entre `CLISPEC.md`, specs e
código é conferida pela leitura, na revisão de `termfy-review`: cada linha
de `Surface` existe no código, cada `getCredential("<name>")` aparece nas
credenciais, as tabelas das migrations batem com `### Storage` e o índice
tem uma linha por arquivo de `specs/`.

## A sequência

A ordem de uso, do `termfy-init` à release, com o que cada skill deixa
pronto para a seguinte, está no capítulo
[Sequência de uso das skills](09-workflow.md).

## As referências

`references/` traz o que a skill cita:

- `termfy-cli`: contrato de comando, saída texto/JSON e o JSON Schema oficial
  da OpenCLI 0.1.
- `termfy-tui`: o guia de design modern unix, o guia de testes por frame e
  39 páginas da documentação oficial do OpenTUI 0.8.3.
- `termfy-mcp`: contrato de tool, guia de testes, princípio de economia de
  tokens do OpenMCP, documentação do MCP TypeScript SDK 1.x e páginas da
  especificação MCP (conceitos de servidor, transporte stdio, tools,
  resources, prompts, segurança local, Inspector e depuração).
- `termfy-config`: modelo de segurança do cofre e declaração de chaves.
- `termfy-brand`: onde cada campo da identidade fica e que superfícies o
  leem, mais os papéis da paleta.
- `termfy-docs`: checklist de cobertura e forma da documentação embutida e o
  guia de escrita para pessoas e agentes.
- `termfy-init`: checklist do bootstrap.
- `termfy-clispec`: roteiro da entrevista e guia da visão macro (Purpose,
  Audiences, Out of scope e lista de specs iniciais).
- `termfy-spec`: resumo do contrato das specs, roteiro da entrevista por
  evolução e guia para escrever Behavior e Design.
- `termfy-database`: regras de migrations e de repositórios SQLite.

Pastas com documentação copiada de outros projetos levam um marcador
`.terceiros`. Validadores de texto de instrução ignoram essas pastas, porque o
texto não foi escrito aqui. As licenças originais acompanham as cópias.

## Como chegam ao projeto

O starter kit já traz as skills em `.agents/skills/`, com links para os
agentes configurados. O arquivo `skills-lock.json` registra a origem, o
caminho e o hash de cada skill.

Peça ao agente para usar `termfy-init` no modo de manutenção das skills.
Ela instala, atualiza ou repara as cópias do Termfy e confere o lock, os
links dos agentes e a compatibilidade, preservando a identidade, o
`CLISPEC.md` e as specs.

Por exemplo: "Use termfy-init para reparar as skills ausentes deste
projeto". O agente executa os comandos internos e apresenta o resultado.
As mudanças nas instruções são feitas no framework e distribuídas para os
projetos derivados.

## Compatibilidade

As skills citam caminhos do starter kit (`src/cli/registry.ts`,
`template/command/example.ts`). Cada `SKILL.md` declara, na seção
"Compatibilidade", a faixa do starter kit que cobre. Quando o starter kit muda a estrutura, as skills são atualizadas
na mesma janela e as duas versões sobem juntas.

## Escrever uma skill nova

Quando um projeto derivado tem um domínio próprio (uma API, um formato de
arquivo, um fluxo de aprovação), vale escrever uma skill do projeto, em
`skills/` do próprio repositório ou em um repositório de skills da equipe.
Siga a mesma forma: frontmatter com `name` e `description`, leitura prévia,
regras, passos, marcos e saída. Texto em prosa direta, verbos no imperativo,
sem clichês de abertura ou fechamento. Valide a estrutura com um script como
`scripts/validate-skills.ts` do framework.
