# Testar, revisar e publicar

Uma spec só fecha quando os testes de aceite passam. Uma versão só sai
quando as specs dela estão fechadas e a revisão não encontrou problema
grave. Este capítulo mostra as três skills que cuidam disso:
[termfy-test](skills/termfy-test.md),
[termfy-review](skills/termfy-review.md) e
[termfy-release](skills/termfy-release.md).

## 1. Testes nos três modos

Peça:

> Use a skill termfy-test para cobrir os testes da spec 0001.

A skill lê a seção `## Tests` da spec e escreve um teste para cada item,
no modo certo. O starter kit já traz um exemplo de cada padrão em
`tests/`.

| Modo | Como o teste roda | Arquivo de referência |
| --- | --- | --- |
| CLI | o binário num subprocesso, com pasta de dados temporária | `tests/cli.test.ts` |
| MCP | uma conversa real pelo stdio, com o `Client` do SDK | `tests/mcp.test.ts` |
| TUI | a interface no renderer de teste do OpenTUI, conferida pelo frame | `tests/tui.test.ts` |
| config | settings e cofre numa pasta temporária | `tests/config.test.ts` |

### CLI num subprocesso

O teste roda `src/main.ts` como você rodaria e confere exit code,
stdout e stderr. A variável `<BIN>_HOME` aponta para uma pasta
temporária. Assim o teste não mexe no seu `~/.mycli/`:

```ts
async function run(args: string[], stdin?: string) {
  const proc = Bun.spawn(["bun", "run", "src/main.ts", ...args], {
    cwd: join(import.meta.dir, ".."),
    env: { ...process.env, [HOME_VARIABLE]: dir, NO_COLOR: "1" },
    stdin: stdin === undefined ? "ignore" : new Response(stdin),
    stdout: "pipe",
    stderr: "pipe",
  });
  const [stdout, stderr] = await Promise.all([new Response(proc.stdout).text(), new Response(proc.stderr).text()]);
  return { code: await proc.exited, stdout, stderr };
}

test("config get of an unknown key exits with 3", async () => {
  const r = await run(["config", "get", "does.not.exist", "--json"]);
  expect(r.code).toBe(3);
  expect(JSON.parse(r.stdout).error.name).toBe("CONFIG");
});
```

### MCP pelo stdio

O teste abre o servidor como um cliente de agente abriria e chama as
tools pelo protocolo:

```ts
client = new Client({ name: "test", version: "0.0.0" });
await client.connect(new StdioClientTransport({
  command: "bun",
  args: ["run", "src/main.ts", "mcp"],
  env: { ...(process.env as Record<string, string>), [HOME_VARIABLE]: dir },
  stderr: "ignore",
}));

test("credentials_status does not expose values", async () => {
  const r = await client.callTool({ name: "credentials_status", arguments: {} });
  expect(Object.keys(r.structuredContent as object)).not.toContain("values");
});
```

Esse teste pega um problema comum: um `console.log` esquecido escreve
texto em stdout, quebra o JSON-RPC e a conversa com o agente cai.

### TUI pelo frame

O renderer de teste desenha a interface em memória. O teste envia teclas
e confere o texto do frame:

```ts
const setup = await createTestRenderer({ width: 120, height: 32 });
mountTui(setup.renderer, {});
await setup.renderOnce();
expect(setup.captureCharFrame()).toContain("Overview");
```

Com cada teste verde, a skill marca `[x]` no item correspondente de
`## Tests`. Um item só é marcado depois que o teste roda.

## 2. Revisão por gravidade

Peça:

> Use a skill termfy-review para revisar a entrega da spec 0001.

A skill lê o diff, a spec e o código e roda as verificações. Ela não
edita nada: relata cada achado com gravidade, arquivo, linha, efeito e
correção sugerida.

| Nível | Quando | Exemplo |
| --- | --- | --- |
| P0 | segredo real exposto ou perda de dados imediata | valor do cofre devolvido por uma tool |
| P1 | fluxo principal quebrado ou proteção essencial ausente | texto em stdout interrompe o JSON-RPC |
| P2 | comportamento errado localizado ou contrato descumprido | exit code errado; option sem description |
| P3 | apresentação ou manutenção, sem mudar o resultado | comentário em português no código |

Um relatório tem esta forma:

```text
1. [P2] src/cli/commands/orders.ts:31 | Sem shop.token, orders list sai com 5 em vez de 4. | Deixar o erro de getCredential subir sem convertê-lo em erro de rede.
2. [P3] src/api/shop.ts:12 | Comentário em português. | Traduzir para inglês.

Testes: bun run validate passou (62 testes).
Conferência manual: orders_list está no código e falta na Surface da spec.
```

Você escolhe o que corrigir. Depois das correções, peça uma revisão nova
até não restar P0, P1 nem P2.

## 3. Fechar a spec

Com todas as tarefas e testes marcados, peça à
[termfy-spec](skills/termfy-spec.md) para fechar a spec. O agente aplica
a Surface às tabelas do `CLISPEC.md`, troca o status para `done` e
registra a data. O capítulo
[Descrever e especificar](10-describe-and-specify.md) mostra o ciclo.

## 4. Publicar

Peça:

> Use a skill termfy-release para publicar a versão 0.2.0 do mycli.

A skill segue esta ordem:

1. Confere `git status`, a branch e o índice de specs. Uma spec
   `in_progress` com código no repositório indica entrega incompleta.
2. Atualiza `version` no `package.json` e move as entradas de
   `Unreleased` para a versão nova no `CHANGELOG.md`.
3. Roda `bun run opencli` se o registry mudou e `bun run validate`.
4. Faz o commit `release: mycli v0.2.0` e cria a tag `v0.2.0`.
5. Envia a `main` e só essa tag.
6. Acompanha o workflow `release.yml`, que compila os cinco executáveis e
   gera o `SHA256SUMS`.
7. Baixa o executável da sua plataforma, confere o checksum e roda
   `--version`.

O changelog segue o formato Keep a Changelog e pode citar as specs:

```markdown
## [0.2.0] - 2026-11-14

### Adicionado

- Command `orders list` e tool `orders_list` para consultar pedidos
  (spec 0001).
```

Uma tag publicada não se move. Se o workflow falhar, a correção sai numa
versão nova.

## 5. Conectar o agente

Com o binário instalado no `PATH`, a
[termfy-mcp-client](skills/termfy-mcp-client.md) grava a configuração no
cliente de agente que você usa e confere a conexão. A configuração mínima
é a mesma que a aba Overview sugere:

```json
{ "command": "mycli", "args": ["mcp"] }
```

## Próximo passo

A Parte 3 traz a referência completa: [CLI](03-cli.md), [TUI](04-tui.md),
[MCP](05-mcp.md), [configuração](06-configuration-and-credentials.md),
[publicação](08-publishing.md) e uma página por skill.
