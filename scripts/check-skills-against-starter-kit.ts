/** Check paths and package scripts cited by the framework skills. */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

export function skillFiles(root: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = join(root, entry.name);
    const skill = join(directory, "SKILL.md");
    if (existsSync(skill)) files.push(skill);
    const references = join(directory, "references");
    if (!existsSync(references)) continue;
    for (const reference of readdirSync(references, { withFileTypes: true })) {
      if (reference.isFile() && reference.name.endsWith(".md")) {
        files.push(join(references, reference.name));
      }
    }
  }
  return files.sort();
}

function pathExists(path: string, starterRoot: string): boolean {
  // Template filenames and globs must match at least one existing kit path.
  const pattern = path.replace(/<[^>]+>/g, "*");
  if (pattern.includes("*")) {
    return new Bun.Glob(pattern).scanSync({ cwd: starterRoot, onlyFiles: false, dot: true }).next().done === false;
  }
  return existsSync(resolve(starterRoot, path));
}

export function checkReferences(
  text: string,
  file: string,
  starterRoot: string,
  scripts: Record<string, unknown>,
): string[] {
  const failures: string[] = [];
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const location = `${file}:${index + 1}`;
    // Accept plain text, inline code, code blocks and Markdown link targets.
    // Avoid matching a suffix inside an absolute path, URL or relative import.
    const paths = new Set([...line.matchAll(
      /(?<![\w./-])((?:src|scripts|template|tests|docs|\.github)\/(?:<[^>\r\n]+>|[\w.*\/-])*)/g,
    )].map((match) => match[1]!.replace(/[.]+$/, "")));
    for (const path of paths) {
      if (!pathExists(path, starterRoot)) failures.push(`${location}: missing path ${path}`);
    }
    const commands = new Set([...line.matchAll(/\bbun[ \t]+run[ \t]+([\w:./-]+)/g)]
      .map((match) => match[1]!));
    for (const command of commands) {
      // `bun run src/main.ts` invokes a file, already checked as a path.
      if (command.includes("/")) continue;
      if (!Object.hasOwn(scripts, command)) {
        failures.push(`${location}: missing package script ${command}`);
      }
    }
  }
  return failures;
}

function main(): void {
  const frameworkRoot = resolve(dirname(import.meta.path), "..");
  const starterRoot = resolve(process.argv[2] ?? join(frameworkRoot, "../termfy-starter-kit"));
  try {
    if (process.argv.length > 3) throw new Error("Usage: bun run skills:check-paths [starter-kit-path]");
    const packagePath = join(starterRoot, "package.json");
    const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
    if (!pkg.scripts || typeof pkg.scripts !== "object" || Array.isArray(pkg.scripts)) {
      throw new Error(`${packagePath}: expected a scripts object`);
    }
    const files = skillFiles(join(frameworkRoot, "skills"));
    if (!files.length) throw new Error("No skill files found");
    const failures = files.flatMap((file) => checkReferences(
      readFileSync(file, "utf8"), file.slice(frameworkRoot.length + 1), starterRoot, pkg.scripts,
    ));
    if (failures.length) {
      for (const failure of failures) console.error(`✗ ${failure}`);
      process.exitCode = 1;
      return;
    }
    console.log(`✓ Paths and package scripts checked in ${files.length} files against ${starterRoot}`);
  } catch (error) {
    console.error(`✗ ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

if (import.meta.main) main();
