# Publicar

Toda alteração publicada sai com versão, changelog, tag e GitHub Release.
Isso vale para o binário derivado e para o framework.

## O binário derivado

1. Atualize `version` em `package.json`.
2. Registre a mudança em `CHANGELOG.md`, no formato Keep a Changelog.
3. Rode `bun run validar`.
4. Commit `release: meucli vX.Y.Z`, tag `vX.Y.Z`, `git push origin main --tags`.
5. O workflow `release.yml` compila os binários para linux-x64, linux-arm64,
   darwin-x64, darwin-arm64 e windows-x64, gera `SHA256SUMS` e publica a
   GitHub Release com as notas do changelog.
6. Confira a release e baixe um binário para testar `--version`.

Uma tag publicada não se move. Correção posterior recebe nova versão.

## Build local

```bash
bun run build          # dist/meucli para a plataforma atual
bun run build:todos    # dist/meucli-<plataforma> para todas
./dist/meucli --version
```

`bun build --compile` embute a biblioteca nativa do OpenTUI, a documentação
de `docs/` e o `package.json`. Para compilar para outra plataforma, instale
antes os pacotes nativos de todos os alvos:
`bun install --os="*" --cpu="*" @opentui/core`.

## Instalar o binário

Copie o executável para um diretório do `PATH` ou publique a release e
oriente `curl -L <url> -o /usr/local/bin/meucli && chmod +x /usr/local/bin/meucli`.
Nenhum runtime precisa estar instalado na máquina de destino.

## O framework

1. Atualize `version` em `package.json` e, se `docs/user/` mudou,
   `ebook/VERSION`.
2. Registre em `CHANGELOG.md`.
3. Rode `bun run ebook` quando o guia mudou e `bun run validar`.
4. Commit `release: Termfy vX.Y.Z`, tag e push.
5. O workflow publica a release com o PDF e o EPUB do guia.
6. Nos projetos derivados, `bun run skills:update` traz as skills novas.

## No Hub da Promovaweb

Framework e starter kit são submódulos do Hub. Depois de publicar um deles,
o gitlink, a versão, o changelog, a tag e a release do Hub são atualizados,
conforme `RELEASES.md`.
