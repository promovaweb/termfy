# Guardar dados

O esqueleto não tem banco. Preferências ficam em `settings.json` e
segredos no cofre. Um binário ganha banco SQLite só quando a spec pede que
ele lembre informações entre execuções: um histórico, um cache, uma fila,
registros próprios. Este capítulo mostra esse caminho com a tabela de
notas que o starter kit traz como stub em `template/db/`.

## Quando pedir um banco

| Você precisa guardar | Onde fica | Skill |
| --- | --- | --- |
| uma preferência (tema, URL, formato) | `settings.json` | [termfy-config](skills/termfy-config.md) |
| um token ou senha | `credentials.json`, cifrado | [termfy-config](skills/termfy-config.md) |
| registros do domínio que crescem com o uso | `~/.<bin>/data.db` | [termfy-database](skills/termfy-database.md) |

Se a necessidade aparecer no meio do trabalho, volte à spec antes. A
skill de banco recusa criar tabelas que a spec não lista, porque a tabela
faz parte da superfície do binário.

## 1. A spec com a tabela

Na entrevista da [termfy-spec](skills/termfy-spec.md), diga que o binário
precisa guardar os registros. A Surface ganha a tabela com colunas e
tipos:

```markdown
## Surface

- Adiciona a tabela `notes`: `id INTEGER` chave primária,
  `title TEXT NOT NULL`, `body TEXT NOT NULL` (padrão vazio),
  `created_at TEXT NOT NULL`.
- Adiciona o command `notes add`: Save a note; `title`, `--body <text>`;
  `data` `{ id, title, body, createdAt }`; exit codes 2, 3 e 7.

## Tasks

- [ ] Migration `0001-create-notes` e repositório `src/db/notes.ts`
  `#termfy-database`
- [ ] Command `notes add` `#termfy-cli`
```

## 2. Peça a implementação

> Use a skill termfy-database para a spec 0003. Copie os stubs de
> template/db e crie a tabela notes.

A skill copia `database.ts` e o registro de migrations para `src/db/`,
cria a migration da spec e o repositório, liga o repositório aos commands
e escreve os testes.

## 3. A migration

Cada mudança de schema é um arquivo novo em `src/db/migrations/`,
numerado em sequência:

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

O registro `src/db/migrations/index.ts` importa cada arquivo de forma
estática. Isso é o que faz o SQL entrar no binário compilado: o
executável roda em máquinas onde o repositório não existe.

```ts
import { createNotes } from "./0001-create-notes.ts";

export const migrations: readonly Migration[] = checkMigrations([createNotes]);
```

`checkMigrations` recusa versão repetida, buraco na sequência e SQL vazio
quando o módulo carrega. Um erro desses quebra todos os testes na hora,
antes de chegar à release.

Três regras valem para o schema:

- **Migration publicada não muda.** Precisa de uma coluna nova? Crie a
  `0002` com `ALTER TABLE`.
- **Não há rollback.** Antes de migrar um banco que já tem schema, o
  binário copia o arquivo para `data.db.v<versão>.bak`.
- **Banco mais novo que o binário é recusado** com exit code 3. Um binário
  antigo não grava sobre um schema que ele não conhece.

## 4. O repositório

O SQL fica só no repositório. Commands, tools e telas chamam as funções
dele:

```ts
/** Inserts a note and returns it with its id. */
export function addNote(db: Database, input: { title: string; body?: string }, now = new Date()): Note {
  const row = db.query<NoteRow, { title: string; body: string; createdAt: string }>(
    "INSERT INTO notes (title, body, created_at) VALUES ($title, $body, $createdAt) RETURNING id, title, body, created_at",
  ).get({ title: input.title, body: input.body ?? "", createdAt: now.toISOString() });
  return toNote(row!);
}

/** Returns one note or raises NOT_FOUND. */
export function getNote(db: Database, id: number): Note {
  const row = db.query<NoteRow, { id: number }>("SELECT id, title, body, created_at FROM notes WHERE id = $id").get({ id });
  if (!row) throw new AppError(ExitCode.NOT_FOUND, `Note ${id} not found.`);
  return toNote(row);
}
```

Os parâmetros são nomeados (`$title`), sem concatenar valores no SQL. As
linhas viram objetos em camelCase (`createdAt`), que é a forma que o
`--json` devolve. Linha ausente vira `NOT_FOUND`, exit code 6.

## 5. O command usa o repositório

O command abre o banco no `run` e fecha no `finally`:

```ts
run: (ctx) => {
  const db = openDatabase();
  try {
    const note = addNote(db, { title: ctx.args[0]!, body: ctx.options.body as string | undefined });
    return { data: note, text: () => `Saved note ${note.id}.` };
  } finally {
    db.close();
  }
},
```

`openDatabase()` abre `~/.<bin>/data.db`, liga foreign keys, usa WAL e
aplica as migrations pendentes. A pessoa não precisa rodar nenhum passo
de instalação: o primeiro command que abre o banco cria o arquivo.

Se a spec pedir, a skill também copia o command `db`, com `db status`
(versão do schema e migrations pendentes) e `db migrate`.

## 6. Testes em memória

Cada teste abre o seu banco em memória, sem mexer em `~/.<bin>/`:

```ts
describe("notes repository", () => {
  let db: Database;
  beforeEach(() => { db = openDatabase(":memory:"); });
  afterEach(() => db.close());

  test("adds, lists, reads and removes", () => {
    const note = addNote(db, { title: "First" }, new Date("2026-11-10T12:00:00.000Z"));
    expect(listNotes(db)).toEqual([note]);
    removeNote(db, note.id);
    expect(listNotes(db)).toEqual([]);
  });

  test("a database newer than the binary is refused", () => {
    db.run("PRAGMA user_version = 999");
    expect(() => migrate(db)).toThrow(AppError);
  });
});
```

Por fim, a skill roda `bun run build` e executa o binário de `dist/` numa
pasta vazia, com `<BIN>_HOME` temporário. Se o banco for criado ali, as
migrations estão embutidas.

## Próximo passo

O capítulo [Testar, revisar e publicar](13-test-review-release.md) fecha o
ciclo: testes nos três modos, revisão por gravidade e release.
