# Começar

## Pré-requisitos

- Bun 1.4.4 ou superior (`curl -fsSL https://bun.sh/install | bash`).
- Git e acesso de leitura aos repositórios `promovaweb/termfy` e
  `promovaweb/termfy-starter-kit`.
- Um terminal com cores de 24 bits para a TUI. A CLI e o MCP funcionam em
  qualquer terminal ou pipe.

## Preparar o projeto com o agente

Crie o repositório pelo botão **Use this template** do
`promovaweb/termfy-starter-kit` e abra o clone no seu agente. As skills já
acompanham o template. Para fazer o setup, escreva:

> Use a skill termfy-init para preparar este projeto. O executável será
> mycli, com o título My CLI, para consultar e atualizar pedidos da loja.
> O autor é Promovaweb e o repositório é `https://github.com/promovaweb/mycli`.

A skill instala as dependências, aplica a identidade e confere as skills.
Também regenera a descrição OpenCLI e encaminha a descrição do produto
para `termfy-clispec`. O agente executa os comandos internos e mostra os
arquivos alterados e o resultado das verificações.

O nome escolhido define a pasta `~/.mycli/`, as variáveis `MYCLI_HOME` e
`MYCLI_MASTER_KEY` e o esquema das URIs MCP `mycli://`. Para alterar a
identidade de um produto existente, use `termfy-brand`.

Para desenvolver a ferramenta inteira, descreva o produto ao agente
usando `termfy`. Ela chama `termfy-init` durante o setup e
continua pelas skills de especificação e implementação.

## Conferir os três modos

```bash
bun run dev -- --version      # mycli seguido da versão de package.json
bun run dev -- --help         # comandos, opções globais e códigos de saída
bun run dev -- about --json   # envelope JSON com identidade e runtime
bun run dev -- mcp --list     # tools, resources e prompts registrados
bun run dev                   # abre a TUI; q sai
```

## Especificar antes de implementar

Peça ao agente para rodar a skill `termfy-clispec`. Ela entrevista você
para entender o que o binário precisa fazer e grava o `CLISPEC.md` na raiz:
propósito, públicos e modos, o que fica de fora e a lista de specs
iniciais. Depois, a skill `termfy-spec` entrevista você a cada evolução e
grava uma spec em `specs/`: commands com arguments e options, forma do
`--json`, screens, tools, keys de configuração e credenciais, como o
binário vai funcionar e como o código deve ser feito, com tarefas e testes.
As demais skills leem a spec aberta antes de implementar e, ao final,
`spec close` incorpora a evolução ao `CLISPEC.md`. Sem spec, o agente
adivinha; com spec, ele constrói o que foi combinado.

## Atualizar as skills pelo agente

Para manter as skills de um projeto existente, escreva:

> Use termfy-init no modo de manutenção para atualizar as skills do Termfy
> deste projeto e conferir a compatibilidade com o starter kit.

O agente confere a instalação, executa a atualização e verifica o lock e os
links dos agentes. Se faltarem arquivos, a mesma skill pode reparar a
instalação. Nesse modo, ela preserva o nome do produto, o `CLISPEC.md` e
as specs, sem repetir o setup.

As alterações nas skills são feitas no framework. O projeto derivado recebe
as versões distribuídas pela manutenção conduzida pelo agente.

## Validar

```bash
bun run validate
```

O comando encadeia typecheck, `bun test`, conferência das skills instaladas,
conferência de `docs/opencli.json`, `spec:check` e build em `dist/`.
O que uma spec aberta planeja e o código ainda não tem não gera erro; o
código à frente do `CLISPEC.md` aparece como `pending`. Termine as
entregas e feche a spec com `spec close` antes de publicar.

## Primeiro commit

Reescreva a abertura do `README.md` com o propósito do produto, registre a
versão em `CHANGELOG.md` e faça o commit `release: mycli v<version>`, com a versão de `package.json`. O capítulo
[Publicar](08-publishing.md) cobre tag, release e binários.

## Pedir ajuda a um agente

Dentro do repositório, um agente lê `AGENTS.md` e as skills instaladas. Peça,
por exemplo: "adicione o comando `orders list` com filtro por status". A
skill `termfy-cli` o guia pelo registro, pelos testes e pela regeneração do
OpenCLI.
