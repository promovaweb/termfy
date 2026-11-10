# Começar

## Pré-requisitos

- Bun 1.3.14 ou superior (`curl -fsSL https://bun.sh/install | bash`).
- Git e acesso de leitura aos repositórios `promovaweb/termfy` e
  `promovaweb/termfy-starter-kit`.
- Um terminal com cores de 24 bits para a TUI. A CLI e o MCP funcionam em
  qualquer terminal ou pipe.

## Criar o repositório

No GitHub, abra `promovaweb/termfy-starter-kit` e clique em **Use this
template**. Dê o nome do seu binário ao repositório novo. Clone e instale:

```bash
git clone https://github.com/promovaweb/mycli
cd mycli
bun install
```

## Dar identidade ao binário

```bash
bun run init -- --name mycli --title "My CLI" \
  --description "Query and update shop orders." \
  --author "Promovaweb" --repository https://github.com/promovaweb/mycli
```

O script reescreve `package.json`, `.env.example`, `README.md`, `AGENTS.md`,
`CHANGELOG.md` e os workflows. Ele não toca em `src/` nem em `docs/`, porque
esses leem a identidade do manifesto em tempo de execução. O nome define a
pasta de dados `~/.mycli/`, o prefixo das variáveis `MYCLI_HOME` e
`MYCLI_MASTER_KEY` e o esquema das URIs MCP `mycli://`.

O bootstrap não reescreve `CLISPEC.md` nem regenera `docs/opencli.json`.
Rode `bun run opencli` e atualize `bin` e `description` da spec para
coincidirem com `package.json` antes da validação completa.

## Conferir os três modos

```bash
bun run dev -- --version      # mycli seguido da versão de package.json
bun run dev -- --help         # comandos, opções globais e códigos de saída
bun run dev -- about --json   # envelope JSON com identidade e runtime
bun run dev -- mcp --list     # tools, resources e prompts registrados
bun run dev                   # abre a TUI; q sai
```

## Especificar antes de implementar

Peça ao agente para rodar a skill `termfy-spec`. Ela entrevista você e grava
`CLISPEC.md` na raiz: propósito, públicos, commands com arguments e options,
forma do `--json`, screens, tools, keys de configuração e credenciais. As
demais skills leem esse arquivo antes de implementar. Sem spec, o agente
adivinha; com spec, ele constrói o que foi combinado.

## Atualizar as skills

O starter kit traz as skills do framework em `.agents/skills/termfy-*`,
registradas em `skills-lock.json`. Quando o framework publicar uma versão
nova:

```bash
bun run skills:update
```

Se a pasta sumir ou o lock corromper, `bun run skills:install` refaz a
instalação. Não edite as skills no projeto; mudanças acontecem no framework.

## Validar

```bash
bun run validate
```

O comando encadeia typecheck, `bun test`, conferência das skills instaladas,
conferência de `docs/opencli.json`, `spec:check` e build em `dist/`.
Uma spec com referências a funcionalidades futuras gera erros até que
elas sejam implementadas, mesmo com `status: draft`. Termine as entregas
antes de publicar; não trate esses erros como uma validação aprovada.

## Primeiro commit

Reescreva a abertura do `README.md` com o propósito do produto, registre a
versão em `CHANGELOG.md` e faça o commit `release: mycli v<version>`, com a versão de `package.json`. O capítulo
[Publicar](08-publishing.md) cobre tag, release e binários.

## Pedir ajuda a um agente

Dentro do repositório, um agente lê `AGENTS.md` e as skills instaladas. Peça,
por exemplo: "adicione o comando `orders list` com filtro por status". A
skill `termfy-cli` o guia pelo registro, pelos testes e pela regeneração do
OpenCLI.
