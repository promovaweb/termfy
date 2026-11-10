# Instruções para agentes

Este repositório é o framework Termfy: as skills que ensinam um agente a
criar e evoluir binários de terminal em Bun com TUI, CLI e servidor MCP stdio
no mesmo executável, as referências que elas usam e o guia do método em
`docs/user/`, publicado em PDF e EPUB em `ebook/`.

O código do binário não vive aqui. Ele vive no starter kit
[`promovaweb/termfy-starter-kit`](https://github.com/promovaweb/termfy-starter-kit),
template do GitHub que já traz estas skills instaladas em `.agents/skills/`.

## Idioma

Português do Brasil em skills, referências escritas aqui, guia e respostas,
com os termos técnicos em inglês preservados. Todo código do starter kit e
dos projetos derivados é em inglês (arquivos, identificadores, comentários,
mensagens, commands, options, keys e campos do `--json`), e as skills citam
esses nomes em inglês. Documentação copiada de outros projetos (pastas com o
marcador `.terceiros`) permanece no idioma original.

## Ordem de leitura

1. Este arquivo.
2. `docs/user/README.md` e o capítulo do guia ligado à tarefa.
3. A skill que será alterada e suas `references/`.
4. `skills/README.md` para a forma comum das skills.

## Regras

- Uma skill tem `SKILL.md` com frontmatter `name` (igual ao nome da pasta) e
  `description`, mais `references/` com ao menos um arquivo. Seções: leitura
  prévia, regras, passos, marcos e saída.
- Texto de instrução em prosa direta, verbos no imperativo, sem travessão
  como pontuação, sem clichês de abertura ou fechamento. Evite as famílias
  léxicas vetadas em `PROHIBITED-TERMOS-ABSOLUTOS.md` do Hub da Promovaweb;
  nomeie a consequência, a escolha, a comprovação ou a regra em vez do termo
  genérico.
- Documentação copiada de terceiros fica em subpasta própria dentro de
  `references/`, com a licença original e um arquivo `.terceiros`. Não a
  edite; substitua pela versão nova quando a fonte mudar.
- Caminhos citados nas skills apontam para o starter kit. Quando ele mudar a
  estrutura, atualize a skill e a seção "Compatibilidade" na mesma janela.
- O guia em `docs/user/` explica o método; não repita nele a referência de
  comandos do binário, que vive no starter kit e sai pelo `--skill`.
- Quando `docs/user/` mudar, avance `ebook/VERSION`, rode `bun run ebook` e
  faça commit dos artefatos em `ebook/`.
- Scripts em Bun. Node e npm não entram, exceto o `npx skills` citado como
  ferramenta de distribuição.

## Validação antes de concluir

```bash
bun run validate
```

Encadeia `skills:validate` (estrutura, frontmatter e links das skills) e
`ebook:verify` (manifesto, hashes, XML, links e fontes do ebook). Confira
`git status --short` ao final e preserve mudanças que já existiam.

## Publicação

Versão em `package.json`, entrada em `CHANGELOG.md`, tag `vX.Y.Z` e GitHub
Release com o PDF e o EPUB. O fluxo está em `docs/user/08-publicar.md`.
