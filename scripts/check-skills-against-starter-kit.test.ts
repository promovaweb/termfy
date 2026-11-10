import { afterEach, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { checkReferences, skillFiles } from "./check-skills-against-starter-kit.ts";

const temporaryDirectories: string[] = [];

function fixture(files: string[]): string {
  const root = mkdtempSync(join(tmpdir(), "termfy-paths-"));
  temporaryDirectories.push(root);
  for (const file of files) {
    const path = join(root, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, "");
  }
  return root;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("checks inline and plain paths, placeholders, hidden globs and file commands", () => {
  const root = fixture(["src/main.ts", "src/cli/commands/about.ts", ".github/workflows/ci.yml"]);
  const text = [
    "`src/main.ts`, src/cli/commands/<name>.ts and .github/workflows/*.yml.",
    "bun run dev; bun run src/main.ts mcp",
    "[source](src/main.ts)",
  ].join("\n");
  expect(checkReferences(text, "skill.md", root, { dev: "bun run src/main.ts" })).toEqual([]);
});

test("reports every missing reference with its source line", () => {
  const root = fixture([]);
  expect(checkReferences([
    "`src/missing.ts` and docs/missing.md",
    "bun run missing:script",
    "tests/*.ts",
    "bun run scripts/missing.ts",
  ].join("\n"), "skill.md", root, {})).toEqual([
    "skill.md:1: missing path src/missing.ts",
    "skill.md:1: missing path docs/missing.md",
    "skill.md:2: missing package script missing:script",
    "skill.md:3: missing path tests/*.ts",
    "skill.md:4: missing path scripts/missing.ts",
  ]);
});

test("allows only the temporary spec references", () => {
  const root = fixture([]);
  expect(checkReferences(
    "src/spec/schema.ts src/spec/ src/cli/commands/spec.ts docs/spec.md tests/spec.test.ts bun run spec:check",
    "skill.md", root, {},
  )).toEqual([]);
  expect(checkReferences("docs/spec-extra.md bun run spec:other", "skill.md", root, {})).toHaveLength(2);
});

test("scans SKILL.md and root reference Markdown without descending into third-party folders", () => {
  const root = fixture([
    "README.md", "sample/SKILL.md", "sample/references/guide.md",
    "sample/references/opentui/third-party.md", "sample/references/mcp-sdk/third-party.md",
    "sample/references/mcp-spec/third-party.md", "sample/references/schema.json",
  ]);
  expect(skillFiles(root)).toEqual([
    join(root, "sample/SKILL.md"), join(root, "sample/references/guide.md"),
  ]);
});

test("does not treat URLs or relative imports as root paths", () => {
  const root = fixture([]);
  expect(checkReferences(
    'https://example.com/docs/page.md /tmp/src/main.ts "../src/main.ts"',
    "skill.md", root, {},
  )).toEqual([]);
});
