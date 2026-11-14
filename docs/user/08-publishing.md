# Publicar

Toda alteração publicada sai com versão, changelog, tag e GitHub Release.
Isso vale para o binário derivado e para o framework.

## O binário derivado

1. Atualize `version` em `package.json`.
2. Registre a mudança em `CHANGELOG.md`, no formato Keep a Changelog.
3. Rode `bun run validate`.
4. Commit `release: mycli vX.Y.Z` e tag `vX.Y.Z`. Envie a `main` e só
   essa tag: `git push origin main vX.Y.Z`.
5. O workflow `release.yml` compila os binários para linux-x64, linux-arm64,
   darwin-x64, darwin-arm64 e windows-x64, gera `SHA256SUMS` e publica a
   GitHub Release com as notas do changelog.
6. Confira a release e baixe um binário para testar `--version`.

Uma tag publicada não se move. Correção posterior recebe nova versão.

## Build local

```bash
bun run build          # dist/mycli para a plataforma atual
bun run build:all    # dist/mycli-<plataforma> para todas
./dist/mycli --version
```

`bun build --compile` embute a biblioteca nativa do OpenTUI, a documentação
de `docs/` e o `package.json`. Para compilar para outra plataforma, instale
antes os pacotes nativos de todos os alvos:
`bun install --frozen-lockfile --os="*" --cpu="*" --libc="*"`. O comando não
cita pacote de propósito: com `@opentui/core` no lugar, o Bun 1.4 não instala
`@opentui/core-linux-arm64-musl` e o alvo linux-arm64 falha.

## Instalar o binário

Copie o executável para um diretório do `PATH` ou publique a release e
oriente `curl -L <url> -o /usr/local/bin/mycli && chmod +x /usr/local/bin/mycli`.
Nenhum runtime precisa estar instalado na máquina de destino.

## O framework

1. Atualize `version` em `package.json` e, se `docs/user/` mudou,
   `ebook/VERSION`.
2. Registre em `CHANGELOG.md`.
3. Rode `bun run ebook` quando o guia mudou e `bun run validate`.
4. Commit `release: Termfy vX.Y.Z`, tag e push.
5. O workflow publica a release com o PDF e o EPUB do guia.
6. Nos projetos derivados, peça ao agente para usar `termfy-init` no modo
   de manutenção das skills para receber a versão publicada.

## No Hub da Promovaweb

Framework e starter kit são submódulos do Hub. Depois de publicar um deles,
o gitlink, a versão, o changelog, a tag e a release do Hub são atualizados,
conforme `RELEASES.md`.
