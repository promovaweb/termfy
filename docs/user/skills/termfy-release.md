# termfy-release

A `termfy-release` publica uma versão do binário derivado. Ela escolhe o
número pelo SemVer, move as notas de `Unreleased` para a seção da versão no
`CHANGELOG.md`, roda `bun run validate`, cria o commit e a tag e acompanha o
workflow `.github/workflows/release.yml`. No fim, você tem uma GitHub
Release com os cinco executáveis e o `SHA256SUMS`, mais a prova de que um
asset baixado responde `--version` com o número publicado.

## Quando usar

Use esta skill nestas situações:

- as specs 0002 e 0003 do `mycli` estão `done` e você quer publicar o
  `orders list` para os operadores da loja;
- um bug corrigido precisa chegar às instalações existentes do binário;
- o workflow de uma versão anterior falhou e a correção precisa de uma
  versão nova;
- você quer só preparar a versão (número, changelog, validação) sem
  enviar nada ainda.

Não use com spec aberta sem antes falar com a pessoa: feche a spec pela
[termfy-spec](termfy-spec.md) primeiro. Para publicar o próprio framework
Termfy ou o starter kit, siga o fluxo de cada repositório; esta skill roda
no repositório do binário derivado. Para ligar o binário publicado aos
agentes, use a [termfy-mcp-client](termfy-mcp-client.md) depois.

## Como pedir

Para publicar de ponta a ponta:

> Use a skill termfy-release para publicar o mycli com as specs 0002 e
> 0003 fechadas.

Para preparar sem enviar:

> Use a skill termfy-release para preparar a versão do mycli: escolha o
> número, atualize o changelog e rode a validação, sem commit nem tag.

Para refazer depois de uma falha:

> Use a skill termfy-release para publicar uma correção do mycli depois que
> o workflow da v0.6.2 falhou na compilação.

## O que a skill faz

1. Confere `git status --short`, `git branch --show-current`,
   `git remote -v` e `gh auth status`. Trabalha na `main` atualizada com
   `git fetch origin`, sem descartar mudanças locais.
2. Lê o changelog, o diff desde a última tag e o índice `## Specs` do
   `CLISPEC.md`. Escolhe X.Y.Z e confere que a tag não existe com
   `git tag --list "$release_tag"` e
   `git ls-remote --tags origin "refs/tags/$release_tag"`.
3. Atualiza `version` no `package.json`. Move as notas de `Unreleased` para
   `## [X.Y.Z] - YYYY-MM-DD` no `CHANGELOG.md`.
4. Roda `bun run opencli` se o registry mudou. Depois roda
   `bun run validate` e corrige as falhas antes de seguir.
5. Revisa o diff e faz o commit `release: <bin> vX.Y.Z` só com os arquivos
   da versão.
6. Cria a tag `vX.Y.Z` nesse commit e faz push de `main` e da tag
   específica, com `git push origin main` e `git push origin "$release_tag"`.
7. Localiza a execução do workflow com
   `gh run list --workflow release.yml --commit "$release_commit"` e
   acompanha com `gh run watch "$release_run_id" --exit-status`.
8. Confere a release com `gh release view "$release_tag"`, baixa o asset da
   máquina com `gh release download`, valida o SHA-256 e roda `--version`.
9. Se o workflow falhar, lê o log com `gh run view "$release_run_id"
   --log-failed`, corrige a causa e publica outra versão.

## Exemplo

O `mycli` estava na 0.6.1. Desde então, a spec 0002 acrescentou o command
`orders list` e a tool `orders_list`, sem quebrar nada. Capacidade nova
compatível antes da 1.0.0 pede minor, então a versão é 0.7.0.

O `CHANGELOG.md` fica assim, em português e no formato Keep a Changelog:

```markdown
## [Unreleased]

## [0.7.0] - 2026-11-12

### Adicionado

- Command `orders list` e tool MCP `orders_list`, que listam os pedidos
  da loja com a credencial `shop.token` (spec 0002).

## [0.6.1] - 2026-11-03
```

O workflow procura o cabeçalho `## [0.7.0]` e usa o texto até a próxima
versão como notas da release. Por isso a seção não pode ficar vazia.

Os comandos de envio, com as variáveis da tarefa:

```bash
release_bin='mycli'
release_version='0.7.0'
release_tag="v$release_version"
git commit -m "release: $release_bin $release_tag"
release_commit=$(git rev-parse HEAD)
git tag "$release_tag" "$release_commit"
git push origin main
git push origin "$release_tag"
```

A tag `v0.7.0` dispara o workflow pelo gatilho `v*`. Ele instala as
dependências, valida, compila com `bun run build:all` e publica estes
assets, com os nomes definidos em `scripts/build.ts`:

| Alvo | Asset |
| --- | --- |
| Linux x64 | `mycli-linux-x64` |
| Linux arm64 | `mycli-linux-arm64` |
| macOS x64 | `mycli-darwin-x64` |
| macOS arm64 | `mycli-darwin-arm64` |
| Windows x64 | `mycli-windows-x64.exe` |
| Checksums | `SHA256SUMS` |

Numa máquina Linux x64, a conferência final é esta:

```bash
release_download=$(mktemp -d)
release_asset="$release_bin-linux-x64"
gh release download "$release_tag" --pattern "$release_asset" --pattern SHA256SUMS --dir "$release_download"
(cd "$release_download" && sha256sum --check --ignore-missing SHA256SUMS)
chmod u+x "$release_download/$release_asset"
"$release_download/$release_asset" --version
```

A última linha imprime `mycli 0.7.0`.

## Regras que a skill segue

- **SemVer pelo efeito.** Contrato incompatível pede major, capacidade nova
  compatível pede minor, correção pede patch. Vale o maior incremento do
  conjunto, porque um script antigo quebra pelo item mais grave.
- **Antes da 1.0.0, a política do projeto.** Sem política declarada, minor
  para incompatibilidade ou capacidade nova e patch para correção. A faixa
  0.x não esconde migração: o changelog descreve a chamada antiga e a nova.
- **Changelog em português, Keep a Changelog.** Versões anteriores ficam
  como estão. A data é a da publicação real.
- **Validação antes do envio.** Sem `bun run validate` com exit code 0, não
  há commit de release. O workflow repete essa validação e uma falha após
  a publicação da tag exige outra versão para a correção.
- **Specs fechadas primeiro.** Uma spec `in_progress` com código no
  repositório indica entrega incompleta. Se ela não puder fechar, a skill
  pergunta se a versão sai parcial e registra isso no changelog.
- **Commit só da versão.** Nada de `git add .` sem revisão. Mudanças de
  outras tarefas ficam fora.
- **Tag publicada não se mexe.** Sem mover, apagar ou recriar tag e sem
  force push. Cada download da v0.7.0 precisa entregar o mesmo arquivo.
  Correção ganha outra versão, mesmo depois de workflow falho.
- **Push da tag específica.** `git push origin "$release_tag"` envia só a
  tag da versão, sem levar tags de outras entregas.
- **Concluída só com o asset testado.** A skill confere o workflow, os
  cinco executáveis, os checksums e o `--version` de um asset baixado. O
  build local não substitui o que foi publicado.
- **Sem release manual para esconder falha.** Se o workflow falhar, a
  correção passa pelo projeto e por uma versão nova. Se a mesma causa
  persistir, a skill para e relata o diagnóstico.

## O que ela entrega

No relatório final, a skill informa:

- a versão anterior e a nova, com o motivo do incremento;
- o commit, a tag e a URL da release;
- o resultado do `bun run validate` e do workflow;
- os nomes dos assets publicados;
- o resultado da verificação do SHA-256 e do `--version`.

Os arquivos que mudam no repositório são `package.json`, `CHANGELOG.md` e,
quando o registry mudou, `docs/opencli.json`. Num pedido só de preparação,
a skill para com esses arquivos prontos e validados, sem commit nem tag. Se
algo falhar, o relatório diz a etapa e traz o trecho útil do log.

## Próxima skill

Com a release publicada, siga para a
[termfy-mcp-client](termfy-mcp-client.md), que configura o executável nos
clientes de agente e valida a conexão MCP.
