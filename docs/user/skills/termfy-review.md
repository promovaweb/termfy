# termfy-review

A `termfy-review` audita uma entrega contra a spec aberta (Behavior,
Design, Surface, Tasks e Tests) e faz a conferência manual do `CLISPEC.md`
e das specs contra o código. Ela não edita arquivos. No fim, você tem um
relatório com os achados ordenados de P0 a P3, cada um com `arquivo:linha`
e a correção sugerida, a lista das verificações executadas e a resposta
sobre a spec poder ou não ser fechada.

## Quando usar

Use esta skill nestas situações:

- a implementação da spec 0002 (`orders list`, `orders_list` e a screen
  `orders`) terminou e os testes passaram;
- você vai fazer merge de uma branch e quer uma leitura independente antes;
- a spec tem todos os itens `[x]` e você precisa saber se ela pode fechar;
- você suspeita que um segredo, como `shop.token`, aparece em alguma saída.

Não use para corrigir. A revisão só relata. As correções voltam para a
skill da área: [termfy-cli](termfy-cli.md), [termfy-mcp](termfy-mcp.md),
[termfy-tui](termfy-tui.md) ou [termfy-config](termfy-config.md). Para
escrever testes que faltam, use a [termfy-test](termfy-test.md). Para
fechar a spec e gravar o `CLISPEC.md`, use a [termfy-spec](termfy-spec.md).

## Como pedir

Para auditar uma entrega completa:

> Use a skill termfy-review para auditar a spec 0002 e dizer se ela pode
> ser fechada.

Para uma checagem dirigida:

> Use a skill termfy-review para conferir se `shop.token` vaza em
> `orders list --json`, na tool `orders_list` ou no frame da screen
> `orders`.

Para revisar antes de um merge:

> Use a skill termfy-review para revisar o diff desta branch contra a spec
> aberta e o `CLISPEC.md`, sem alterar nada.

## O que a skill faz

1. Roda `git status --short` e lê o diff com `git diff --stat`, `git diff`
   e `git diff --cached`. Fixa os arquivos e os itens sob revisão. Lê também
   os arquivos novos, porque `git diff` não mostra o conteúdo deles.
2. Lê a spec inteira e confere a linha `Status:` com
   `rg -n '^Status:|^- \[[xX ]\]' specs/0002-*.md`.
3. Roda `bun run typecheck` e `bun test`. Para cada item `[x]` de Tasks e
   Tests, localiza um teste que exercita a entrega. Procura testes
   desligados com `rg -n '\b(test|it|describe)\.(skip|todo|only)|expect\(' tests`.
4. Confronta Behavior e Design com o código: saídas em texto e em `--json`,
   mensagens de erro, exit codes, teclas, tools, arquivos criados e funções
   compartilhadas entre CLI, MCP e TUI.
5. Faz a conferência manual do `CLISPEC.md`. As buscas
   `rg -n 'name: "' src/cli/commands.ts src/cli/commands`,
   `rg -n 'registerTool|registerResource|registerPrompt' src/mcp`,
   `rg -no 'getCredential\("[^"]+"\)' src` e
   `rg -n 'CREATE TABLE|ALTER TABLE' src` listam o lado do código. A skill
   compara cada nome com as tabelas de Surface e com `### Storage`.
6. Verifica descriptions de commands, options e arguments, roda
   `bun run opencli:check` e `bun run docs:check`, segue cada
   `getCredential` até os consumidores, procura `console.log` alcançado pelo
   MCP e cores literais fora de `src/tui/theme.ts`.
7. Classifica os achados pela tabela de gravidade e propõe a menor correção
   suficiente, sem executá-la.
8. Roda `git status --short` de novo e relata qualquer arquivo que os
   testes tenham gerado, sem reverter nada.

## Exemplo

A revisão da spec 0002 do `mycli` termina com este relatório. Os achados
são ilustrativos e mostram o formato, com uma linha por achado:

```text
1. [P1] src/mcp/tools/orders.ts:31 | Um console.log no callback de orders_list escreve em stdout e quebra a conversa JSON-RPC. | Remover o log ou enviar o diagnóstico, sem segredo, para stderr.
2. [P2] src/cli/commands/orders.ts:18 | A option --status não tem description; o --help e o opencli.json saem incompletos. | Acrescentar a description e rodar bun run opencli.
3. [P2] specs/0002-orders.md:41 | O item "orders list --json sem shop.token sai com 4" está [x], mas nenhum teste confere o exit code. | Desmarcar o item ou pedir o teste à termfy-test.
4. [P3] src/tui/screens/orders.ts:22 | Cor literal "#ff5555" fora de src/tui/theme.ts. | Trocar por uma cor do tema.

Verificações
- bun run typecheck: exit 0
- bun test: 48 pass, 0 fail
- bun run opencli:check: exit 1 (ver achado 2)
- bun run docs:check: exit 0
- Conferência manual: Surface da spec bate com o registry; shop.token aparece em Credentials.

Spec 0002: não pode fechar. Itens pendentes: achados 1 a 3.
```

Repare que o achado 3 aponta um item marcado sem teste. A suíte passou,
mas um `[x]` precisa de teste verde que exercite aquela entrega.

## Regras que a skill segue

- **Revisão não edita.** Sem build, commit, instalação ou `bun run opencli`.
  Ela também não roda `bun run validate`, porque ele inclui build.
  Assim o repositório chega ao fim da revisão como estava no começo.
- **Behavior e Design são a régua.** Desvio sem registro em `## Notes` da
  spec é achado. Preferência pessoal de estilo não é defeito.
- **`[x]` exige teste.** Um item marcado precisa de teste verde no código
  atual. Resultado antigo ou teste sem assertion pertinente não aprova.
- **Busca aponta candidato.** A skill lê o código e segue as chamadas antes
  de relatar um vazamento, porque um match de `rg` sozinho não prova nada.
- **Segredo não vai para o relatório.** Se encontrar um token gravado, ela
  descreve o lugar sem copiar o valor.
- **Sem serviço externo.** Falhas são reproduzidas com testes locais e
  fixtures sintéticas, fora da pasta real de configuração da pessoa.
- **Limitação declarada.** Se uma checagem não pôde rodar, o relatório diz
  qual e o impacto. A entrega não é aprovada enquanto faltar confirmação
  essencial.
- **Conferência manual é daqui.** Nenhum script lê `CLISPEC.md` nem
  `specs/`. A revisão é o momento de comparar Surface, Credentials,
  `### Storage` e o índice `## Specs` com o código.
- **Gravidade pelo efeito.** P0 para segredo exposto ou perda de registros
  ampla, P1 para fluxo principal inutilizável, P2 para contrato descumprido
  localizado, P3 para apresentação e manutenção. Ocorrências da mesma causa
  viram um achado só.

## O que ela entrega

O relatório traz, nesta ordem:

- os achados de P0 a P3, cada um com gravidade, `arquivo:linha`,
  comportamento observado, consequência e correção sugerida;
- as verificações executadas, com comando e exit code;
- os itens da spec ainda pendentes;
- a resposta sobre a spec poder ser fechada pelo fluxo da `termfy-spec`;
- os pontos que precisam de resposta da pessoa.

Sem achados, a skill diz isso e cita o que conferiu, sem prometer ausência
de falhas fora do escopo. Nenhum arquivo do repositório muda. Fixtures
temporárias criadas pelos testes são conferidas e removidas.

## Próxima skill

Corrigidos os achados pelas skills da área, siga para a
[termfy-docs](termfy-docs.md), que relê a documentação embutida antes do
fechamento da spec.
