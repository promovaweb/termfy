# Skills

Skills são pastas com um `SKILL.md` (instruções para o agente) e uma pasta
`references/` (material de apoio). Um agente de IA que trabalha no projeto
lê o `AGENTS.md`, escolhe a skill compatível com a tarefa e segue os passos.

## As dezoito skills

| Skill | Quando o agente usa |
| --- | --- |
| `termfy` | a pessoa descreve a ferramenta em uma frase; orquestra as demais com dois checkpoints |
| `termfy-api-import` | a pessoa envia a documentação de uma API; vira `changes.add` de uma spec |
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
descrito em `docs/spec.md` do starter kit, tem dois documentos.

**`CLISPEC.md`**, um por binário, na raiz, guarda a visão macro. A skill
`termfy-clispec` entrevista a pessoa em blocos curtos (problema, públicos e
modos, capacidades, dados e integrações, limites) e grava identidade,
quatro seções fixas (`Purpose`, `Audiences`, `Out of scope`, `Notes`), a
superfície entregue no front matter (`commands`, `screens`, `mcp`,
`settings`, `credentials` e, quando há banco, `storage.tables`, com os
nomes do código) e o índice das specs. O
`CLISPEC.md` não tem checklist nem `status`: ele descreve o binário, não o
trabalho pendente.

**`specs/NNNN-slug.md`**, um por evolução, guarda o que muda. A skill
`termfy-spec` entrevista a pessoa a cada evolução (objetivo, comportamento,
superfície, dados e integrações, desenho do código, aceite) e grava o
front matter `changes` (o que entra, muda ou sai da superfície) e seis
seções: `Goal`, `Behavior` (como o binário vai funcionar), `Design` (como o
código deve ser feito), `Tasks` (checklist com `{#id}` e a tag da skill
responsável), `Tests` (checklist de aceite) e `Notes`.

As skills de implementação leem a spec aberta com
`<bin> spec show <id> --json`, seguem o Behavior e o Design e editam a spec
pelo binário, sem YAML nem checkbox à mão: `spec start` ao começar,
`spec task add` e `spec test add` para itens novos (o `{#id}` é gerado) e
`spec done <id> <item>` ao concluir cada entrega. Cada entrada de
`changes` precisa aparecer pelo nome em uma tarefa ou um teste; o
`spec check` avisa a que ficou sem. Enquanto a
spec está aberta, o código fica à frente do `CLISPEC.md`, e
`<bin> spec check` relata essas entradas como `pending`, sem aviso nem
erro. Com todos os itens marcados, `<bin> spec close <id>` aplica
`changes` ao `CLISPEC.md`, marca a spec como `done` e registra a data em
`## Notes`.

O banco de dados é opcional. O esqueleto não tem banco, e um binário só
ganha um quando a pessoa pede para guardar dados entre execuções. Nesse
caso, `termfy-database` cria `~/.<bin>/data.db` com SQLite, muda o schema
só por migrations embutidas no binário, faz backup antes de migrar e
declara as tabelas em `storage.tables`, que `spec check` compara com o que
as migrations criam.

O binário lê o próprio contrato: `spec show` sem ID imprime a visão macro;
`spec list` mostra as specs com progresso; `spec check` valida e cruza com o
código. As tools MCP `spec` e `specs` devolvem o mesmo conteúdo a um
agente. `bun run spec:check` entra em `bun run validate` e ainda confere
que todo `getCredential("<name>")` do código aparece em `credentials` do
`CLISPEC.md` ou de uma spec aberta. Um `CLISPEC.md` no contrato antigo, com
checklist, é convertido por `spec migrate`. O binário compilado lê o
`CLISPEC.md` embutido no build; para conferir uma edição local, rode pelo
código-fonte com `bun run dev`.

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
- `termfy-brand`: mapa da identidade (onde cada dado vive e quem o lê) e os
  papéis da paleta.
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
`template/command/example.ts`). Cada versão do framework declara a faixa do
starter kit que cobre no `README.md` e na seção "Compatibilidade" de cada
`SKILL.md`. Quando o starter kit muda a estrutura, as skills são atualizadas
na mesma janela e as duas versões sobem juntas.

## Escrever uma skill nova

Quando um projeto derivado tem um domínio próprio (uma API, um formato de
arquivo, um fluxo de aprovação), vale escrever uma skill do projeto, em
`skills/` do próprio repositório ou em um repositório de skills da equipe.
Siga a mesma forma: frontmatter com `name` e `description`, leitura prévia,
regras, passos, marcos e saída. Texto em prosa direta, verbos no imperativo,
sem clichês de abertura ou fechamento. Valide a estrutura com um script como
`scripts/validate-skills.ts` do framework.
