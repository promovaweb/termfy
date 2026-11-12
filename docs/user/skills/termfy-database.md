# termfy-database

A `termfy-database` dá ao binário um banco SQLite quando a spec pede que
ele guarde registros entre execuções. Ela copia os stubs de `template/db/`,
cria as tabelas por migration, escreve um repositório por tabela e liga
esse repositório aos commands, tools e screens. No fim, você tem o arquivo
`~/.<bin>/data.db`, migrations embutidas no executável, testes com banco em
memória verdes e o binário compilado aplicando o schema fora do
repositório.

## Quando usar

Use esta skill quando a spec aberta descrever informações que precisam
sobreviver ao fim do processo:

- um histórico de consultas que a pessoa quer rever depois;
- um cache local de pedidos baixados da API da loja;
- uma fila de tarefas que o binário processa aos poucos;
- notas ou registros próprios, criados pelo CLI e lidos pela TUI.

Não use para preferências nem para segredos. Preferência é key de
`settings.json`, declarada pela [termfy-config](termfy-config.md). Token e
senha vão para o cofre, também pela `termfy-config`. Se a necessidade de
guardar registros aparecer no meio de outra tarefa, volte à
[termfy-spec](termfy-spec.md) para registrar a mudança antes de implementar.
O esqueleto não tem banco. Ele só entra com pedido explícito.

## Como pedir

Para criar o banco pela primeira vez:

> Use a skill termfy-database para implementar a spec 0003, que guarda
> notas locais na tabela `notes` e expõe os commands `db status` e
> `db migrate`.

Para evoluir uma tabela que já saiu em release:

> Use a skill termfy-database para acrescentar a coluna `pinned` à tabela
> `notes`, conforme a spec 0004, sem editar a migration já publicada.

Para levar o repositório aos três modos:

> Use a skill termfy-database para ligar o repositório de notas ao command
> `notes list`, a uma tool MCP e a uma screen da TUI.

## O que a skill faz

1. Roda `git status --short` e lê a spec aberta em `specs/`. Ela confere que
   a seção Surface lista as tabelas com colunas e que o Design descreve a
   migration. Se faltar, ela devolve o trabalho à `termfy-spec`.
2. Na primeira vez no projeto, copia `template/db/database.ts` para
   `src/db/database.ts` e `template/db/migrations/index.ts` para
   `src/db/migrations/index.ts`, trocando os imports `../../src/` por `../`.
3. Troca o import da migration de notes no `index.ts` pela primeira
   migration da spec. A tabela de exemplo só fica quando a spec pede.
4. Cria a migration em `src/db/migrations/NNNN-<name>.ts`, com a próxima
   versão. Em seguida, registra a migration no `index.ts`.
5. Cria o repositório de cada tabela em `src/db/<resource>.ts`, a partir de
   `template/db/repository.ts`.
6. Quando a spec pede `db status` e `db migrate`, copia
   `template/db/command.ts` para `src/cli/commands/db.ts` e registra em
   `src/cli/commands.ts`.
7. Liga o repositório aos commands, tools e screens: abre o banco no `run`
   e fecha em `finally`.
8. Escreve os testes em `tests/<resource>.test.ts`, a partir de
   `template/db/example-test.ts`.
9. Documenta o banco em `docs/configuration.md` e os commands novos em
   `docs/cli.md`.
10. Roda `bun run build` e executa o binário de `dist/` numa pasta vazia,
    com `<BIN>_HOME` temporário, para provar que as migrations estão
    embutidas.
11. Confere à mão cada tabela de Surface contra os `CREATE TABLE` e
    `ALTER TABLE` das migrations.
12. Roda `bun run validate` e marca `[x]` nas tarefas `#termfy-database`
    concluídas na spec.

## Exemplo

A spec pede uma tabela de notas. A migration é o stub
`0001-create-notes.ts`, copiado para `src/db/migrations/`:

```ts
import type { Migration } from "./index.ts";

export const createNotes: Migration = {
  version: 1,
  name: "create_notes",
  up: `
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    ) STRICT;
    CREATE INDEX notes_created_at ON notes (created_at);
  `,
};
```

O registro importa cada migration de forma estática. `checkMigrations()`
roda na importação e recusa lacuna de versão ou SQL vazio:

```ts
import { createNotes } from "./0001-create-notes.ts";

export const migrations: readonly Migration[] = checkMigrations([createNotes]);
```

O repositório em `src/db/notes.ts` concentra o SQL da tabela. Cada função
recebe o `Database` aberto e usa parâmetros nomeados:

```ts
export function getNote(db: Database, id: number): Note {
  const row = db.query<NoteRow, { id: number }>(
    "SELECT id, title, body, created_at FROM notes WHERE id = $id",
  ).get({ id });
  if (!row) throw new AppError(ExitCode.NOT_FOUND, `Note ${id} not found.`);
  return toNote(row);
}
```

O teste abre um banco `:memory:` por caso. Assim os testes não usam `~/.<bin>/`:

```ts
describe("notes repository", () => {
  let db: Database;
  beforeEach(() => { db = openDatabase(":memory:"); });
  afterEach(() => db.close());

  test("adds, lists, reads and removes", () => {
    const note = addNote(db, { title: "First" }, new Date("2026-11-10T12:00:00.000Z"));
    expect(listNotes(db)).toEqual([note]);
    expect(getNote(db, note.id).title).toBe("First");
    removeNote(db, note.id);
    expect(listNotes(db)).toEqual([]);
  });

  test("a database newer than the binary is refused", () => {
    db.run("PRAGMA user_version = 999");
    expect(() => migrate(db)).toThrow(AppError);
  });
});
```

Meses depois, a spec 0004 pede notas fixadas. A migration 0001 já saiu em
release, então a skill cria `0002-add-notes-pinned.ts` com
`ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0` e acrescenta
`addNotesPinned` à lista do `index.ts`. Ao abrir um banco na versão 1,
`migrate()` copia o arquivo para `data.db.v1.bak` antes de aplicar a 2.

A seção Surface da spec lista a tabela. A linha vai para `### Storage`
do `CLISPEC.md` quando a spec fecha:

```markdown
| Tabela | Coluna | Tipo | Chave primária | Not null |
| --- | --- | --- | --- | --- |
| `notes` | `id` | `INTEGER` | sim | sim |
| `notes` | `title` | `TEXT` | não | sim |
| `notes` | `body` | `TEXT` | não | sim |
| `notes` | `created_at` | `TEXT` | não | sim |
```

## Regras que a skill segue

- **Sem pedido, sem banco.** A pasta `src/db/` só aparece quando a spec fala
  em guardar registros. Assim o binário não carrega peso que ninguém pediu.
- **Um arquivo por binário.** O banco fica em `~/.<bin>/data.db`, obtido por
  `databasePath()`. Com `<BIN>_HOME`, testes e CI usam uma pasta
  descartável.
- **Schema muda só por migration.** Uma migration por arquivo, versões a
  partir de 1, em sequência. Migration publicada não é editada, porque
  bancos já instalados aplicaram a versão antiga.
- **Import estático.** O registro importa cada arquivo. O build embute o
  SQL. O binário compilado roda onde o repositório não existe, então ler
  `.sql` do disco quebraria a instalação.
- **`openDatabase()` aplica as pendentes.** Ele liga foreign keys, usa WAL
  e aplica cada migration na sua transação. Um banco mais novo que o
  binário é recusado com exit code 3, para que uma versão antiga não grave
  sobre um schema que ela não conhece.
- **`bun:sqlite`, sem ORM.** O driver vem com o Bun. Nenhuma dependência
  entra no `package.json`. O executável leva o driver junto.
- **SQL só no repositório.** Commands, tools e screens chamam as mesmas
  funções. Os três modos leem e gravam do mesmo jeito.
- **Segredo fica no cofre.** Token lido por `getCredential()` não vai para
  tabela, porque `data.db` não é cifrado.
- **Erros viram `AppError`.** CONFIG (3) para banco ilegível ou schema
  incompatível, PERMISSION (7) para pasta sem acesso, NOT_FOUND (6) para
  linha ausente. A pessoa vê uma mensagem, não o stack trace do driver.
- **Backup no lugar de rollback.** Não há migration de volta. Por isso
  `migrate()` copia o arquivo com `VACUUM INTO` antes de mudar um schema
  existente. Para voltar, a pessoa fecha o binário e troca `data.db` pelo
  backup.
- **Tabelas na superfície.** Nenhum script compara o schema com a spec. A
  skill confere lendo as migrations. A `termfy-review` repete a leitura.

## O que ela entrega

No relatório final, a skill lista:

- as tabelas criadas e a versão do schema;
- os arquivos novos, em geral `src/db/database.ts`,
  `src/db/migrations/index.ts`, `src/db/migrations/NNNN-<name>.ts`,
  `src/db/<resource>.ts` e `tests/<resource>.test.ts`;
- `src/cli/commands/db.ts` e o registro em `src/cli/commands.ts`, quando a
  spec pede `db status` e `db migrate`;
- os commands, tools e screens que usam o banco;
- o resultado dos testes e do binário compilado numa pasta vazia;
- as alterações em `docs/configuration.md` e `docs/cli.md`;
- os itens `#termfy-database` marcados na spec.

## Próxima skill

Com o repositório pronto, siga para a [termfy-cli](termfy-cli.md) ou a
[termfy-command-set](termfy-command-set.md), que criam os commands que
chamam as funções. Depois vêm a [termfy-mcp](termfy-mcp.md), a
[termfy-tui](termfy-tui.md) e a [termfy-test](termfy-test.md).
