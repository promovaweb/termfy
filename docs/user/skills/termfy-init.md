# termfy-init

A skill `termfy-init` prepara um repositório criado a partir do starter kit
e mantém as skills do framework instaladas. No modo de setup, ela aplica a
identidade do seu binário, instala as dependências, confere as skills e os
três modos e roda a validação completa. No modo de manutenção, ela instala,
atualiza ou repara as skills sem mexer no produto. No fim, você tem um
projeto com o nome certo em `package.json`, as skills conferidas e o
caminho aberto para a [termfy-clispec](termfy-clispec.md).

## Quando usar

Use a `termfy-init` nestas situações:

- Você acabou de criar o repositório com **Use this template** e o
  `bun run dev -- --version` ainda responde `termfy`.
- As skills de `.agents/skills/` estão desatualizadas, faltando ou com
  arquivos quebrados.
- O `bun run skills:check` falha dentro do `bun run validate`.

Prefira outra skill nestes casos:

- O setup já foi feito e você quer trocar título, cores, créditos ou o
  próprio nome do executável: use [termfy-brand](termfy-brand.md).
- Você quer descrever o que o binário faz: use
  [termfy-clispec](termfy-clispec.md).
- Você só tem a ideia e quer que o agente conduza tudo: use
  [termfy](termfy.md), que chama a `termfy-init` quando precisa.

## Como pedir

Para o setup de um projeto novo, com todos os campos de uma vez:

> Use a skill termfy-init para preparar este projeto com o nome mycli, o
> título My CLI, a descrição "Query shop orders from the terminal.", o autor
> Loja Exemplo e o repositório `https://github.com/loja-exemplo/mycli`.

Para atualizar as skills de um projeto que já existe:

> Use a skill termfy-init para atualizar as skills do Termfy no mycli.

Para reparar uma instalação quebrada:

> Use a skill termfy-init para reparar as skills: o skills:check diz que
> falta a pasta references da termfy-spec.

## O que a skill faz

Primeiro, a skill informa o modo escolhido (setup ou manutenção) e os
arquivos que vai conferir. Ela só pergunta quando o pedido não deixa claro
qual dos dois você quer.

No modo de setup:

1. Pergunta os campos que faltarem: nome do executável (minúsculas,
   números e hífen), título, descrição em uma frase, autor, URL do
   repositório e site.
2. Roda `git status --short` e preserva as mudanças locais.
3. Roda `bun install`.
4. Roda o bootstrap com os campos conhecidos:
   `bun run init -- --name mycli --title "My CLI" ...`.
5. Executa a manutenção das skills (descrita abaixo) e confere a
   compatibilidade.
6. Roda `bun run opencli` para regenerar `docs/opencli.json` com a nova
   identidade.
7. Confere os três modos com `bun run dev -- --version`,
   `bun run dev -- about --json` e `bun run dev -- mcp --list`. Sem
   terminal interativo, usa o teste `tests/tui.test.ts` para a TUI.
8. Roda `bun run validate`.
9. Reescreve a abertura do `README.md` com o propósito do produto e apaga
   o trecho sobre o template.
10. Passa para a [termfy-clispec](termfy-clispec.md).

No modo de manutenção:

1. Confere o Git, a versão em `package.json`, `.agents/skills/` e
   `skills-lock.json`. Avisa antes de sobrescrever alterações locais.
2. Lê os scripts `skills:install`, `skills:update` e `skills:check` e
   confirma a origem `https://github.com/promovaweb/termfy`.
3. Roda `bun run skills:update` para atualizar ou
   `bun run skills:install` para instalar e reparar. Quando os scripts
   alcançam outras bibliotecas, restringe a operação ao Termfy.
4. Roda `bun run skills:check`, lê os avisos e confere os links dos
   agentes, as origens no lock e o diff.
5. Reabre os arquivos atualizados e encerra. A identidade fica como estava.

## Exemplo

O bootstrap que a skill roda para o `mycli` e a saída que ele imprime:

```bash
bun run init -- --name mycli --title "My CLI" \
  --description "Query shop orders from the terminal." \
  --author "Loja Exemplo" \
  --repository https://github.com/loja-exemplo/mycli \
  --site https://loja-exemplo.com
```

```text
✓ package.json: termfy → mycli
✓ .env.example
✓ README.md
✓ AGENTS.md
✓ CHANGELOG.md: history started at 0.1.0

Done. Check with: bun run dev -- --version && bun run dev -- --help
Then run: bun run validate
```

Depois do bootstrap, o bloco `termfy` do `package.json` fica assim:

```json
{
  "name": "mycli",
  "version": "0.1.0",
  "bin": { "mycli": "src/main.ts" },
  "termfy": {
    "bin": "mycli",
    "title": "My CLI",
    "author": "Loja Exemplo",
    "site": "https://loja-exemplo.com",
    "repository": "https://github.com/loja-exemplo/mycli",
    "framework": "https://github.com/promovaweb/termfy"
  }
}
```

A conferência dos modos confirma o nome novo:

```text
$ bun run dev -- --version
mycli 0.1.0
$ bun run dev -- config path
  Directory         /home/voce/.mycli
  settings.json     /home/voce/.mycli/settings.json
  credentials.json  /home/voce/.mycli/credentials.json
  master.key        /home/voce/.mycli/master.key
```

## Regras que a skill segue

- **O agente roda os comandos.** A skill executa o setup e a manutenção e
  não entrega a você uma lista de comandos para copiar. Isso evita passos
  esquecidos e mantém o relato fiel ao que rodou.
- **O nome do executável segue `^[a-z][a-z0-9-]{1,39}$`.** O bootstrap
  recusa outro formato com exit code 2, porque o nome vira a pasta
  `~/.mycli/`, o prefixo `MYCLI_HOME` e `MYCLI_MASTER_KEY` e o esquema
  `mycli://` das URIs MCP.
- **O bootstrap não cria `CLISPEC.md` nem `specs/`.** O starter kit não
  traz nenhum dos dois. A visão macro sai da entrevista da
  `termfy-clispec`. A primeira spec recebe o número 0001.
- **O bootstrap não altera `src/` nem `docs/`.** Os dois leem a
  identidade do manifest em tempo de execução, então não precisam de
  reescrita.
- **O projeto novo começa em 0.1.0.** O bootstrap troca a versão e cria um
  `CHANGELOG.md` próprio. O histórico do template não pertence ao seu
  binário.
- **Manutenção preserva o produto.** Ela não roda o bootstrap, não
  renomeia o binário e não recria o `CLISPEC.md` nem as specs. A pessoa
  que pediu uma atualização de skills não espera ver o produto mudar.
- **Compatibilidade conferida, não presumida.** A skill só declara a
  instalação compatível depois de ler os avisos do `skills:check`.
- **Setup não publica.** Commit, push, tag e GitHub Release ficam com a
  `termfy-release`. Elas só acontecem quando você pedir.
- **Validação vermelha não vira produto pronto.** Com `bun run validate`
  falhando, a skill relata que só a preparação terminou.

O `bun run validate` encadeia typecheck, testes, `skills:check`,
`opencli:check`, `docs:check` e build. Ele não lê o `CLISPEC.md` nem as
specs: a conferência desses arquivos com o código é manual.

## O que ela entrega

No setup, a skill relata:

- o nome do binário e os caminhos de configuração (`~/.mycli/`);
- a origem das skills instaladas (o `skills-lock.json` registra origem e
  hash, sem versão SemVer);
- os comandos conferidos e os testes executados;
- o que ficou pendente.

Arquivos que mudam no setup: `package.json`, `.env.example`, `README.md`,
`AGENTS.md`, `CHANGELOG.md`, `.github/workflows/*.yml`,
`docs/opencli.json`, `.agents/skills/` e `skills-lock.json`.

Na manutenção, a skill relata as skills alteradas. Mudam só
`.agents/skills/`, os links dos agentes e o `skills-lock.json`.

## Próxima skill

Depois do setup, siga para a [termfy-clispec](termfy-clispec.md), que
entrevista você e escreve o primeiro `CLISPEC.md`. Se quiser ajustar
cores ou créditos antes, passe pela [termfy-brand](termfy-brand.md).
