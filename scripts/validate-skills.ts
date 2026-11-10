/**
 * Valida a estrutura das skills em skills/.
 *
 * Cada skill precisa de SKILL.md com frontmatter `name` igual ao nome da
 * pasta e `description` preenchida, além de uma pasta references/ com ao
 * menos um arquivo. Também confere que todo link relativo dentro de SKILL.md
 * e de references/*.md (nível raiz) aponta para um arquivo existente. As
 * subpastas de references/ guardam documentação copiada e ficam fora.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const raiz = "skills";
const erros: string[] = [];

for (const nome of readdirSync(raiz).sort()) {
  const pasta = join(raiz, nome);
  if (!statSync(pasta).isDirectory()) continue;
  const skill = join(pasta, "SKILL.md");
  if (!existsSync(skill)) {
    erros.push(`${pasta}: falta SKILL.md`);
    continue;
  }
  const texto = readFileSync(skill, "utf8");
  const fm = /^---\n([\s\S]*?)\n---/.exec(texto);
  if (!fm) {
    erros.push(`${skill}: falta frontmatter`);
    continue;
  }
  // The skills installer parses the frontmatter as YAML; a colon in an unquoted value skips the skill silently.
  try {
    Bun.YAML.parse(fm[1] ?? "");
  } catch (e) {
    erros.push(`${skill}: frontmatter YAML inválido (${e instanceof Error ? e.message : String(e)})`);
    continue;
  }
  const nomeFm = /^name:\s*(.+)$/m.exec(fm[1] ?? "")?.[1]?.trim();
  const desc = /^description:\s*(.+)$/m.exec(fm[1] ?? "")?.[1]?.trim();
  if (nomeFm !== nome) erros.push(`${skill}: name "${nomeFm}" difere da pasta "${nome}"`);
  if (!desc || desc.length < 20) erros.push(`${skill}: description ausente ou curta`);
  const refs = join(pasta, "references");
  if (!existsSync(refs) || readdirSync(refs).length === 0) erros.push(`${pasta}: references/ vazia ou ausente`);

  // Links são conferidos só nos arquivos escritos aqui: SKILL.md e o nível
  // raiz de references/. Subpastas guardam documentação copiada de terceiros,
  // com links relativos ao repositório de origem.
  const arquivos = [skill, ...(existsSync(refs) ? listarMdRaiz(refs) : [])];
  for (const arquivo of arquivos) {
    const conteudo = readFileSync(arquivo, "utf8");
    for (const m of conteudo.matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
      const alvo = m[1] as string;
      // Esquemas (https:, mailto:) e caminhos absolutos de site (/docs/...) ficam fora da conferência.
      if (/^[a-z]+:/.test(alvo) || alvo.startsWith("/")) continue;
      const caminho = resolve(dirname(arquivo), alvo);
      if (!existsSync(caminho)) erros.push(`${arquivo}: link quebrado para ${alvo}`);
    }
  }
}

function listarMd(pasta: string): string[] {
  const saida: string[] = [];
  for (const item of readdirSync(pasta)) {
    const caminho = join(pasta, item);
    if (statSync(caminho).isDirectory()) saida.push(...listarMd(caminho));
    else if (item.endsWith(".md") || item.endsWith(".mdx")) saida.push(caminho);
  }
  return saida;
}

if (erros.length) {
  for (const e of erros) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log("✓ skills válidas");

function listarMdRaiz(pasta: string): string[] {
  return readdirSync(pasta)
    .map((item) => join(pasta, item))
    .filter((caminho) => statSync(caminho).isFile() && caminho.endsWith(".md"));
}
