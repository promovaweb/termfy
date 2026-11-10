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
git clone https://github.com/promovaweb/meucli
cd meucli
bun install
```

## Dar identidade ao binário

```bash
bun run iniciar -- --nome meucli --titulo "Meu CLI" \
  --descricao "Consulta e atualiza pedidos da loja." \
  --autor "Promovaweb" --repositorio https://github.com/promovaweb/meucli
```

O script reescreve `package.json`, `.env.example`, `README.md`, `AGENTS.md`,
`CHANGELOG.md` e os workflows. Ele não toca em `src/` nem em `docs/`, porque
esses leem a identidade do manifesto em tempo de execução. O nome define a
pasta de dados `~/.meucli/`, o prefixo das variáveis `MEUCLI_HOME` e
`MEUCLI_MASTER_KEY` e o esquema das URIs MCP `meucli://`.

## Conferir os três modos

```bash
bun run dev -- --version      # meucli 0.1.0
bun run dev -- --help         # comandos, opções globais e códigos de saída
bun run dev -- about --json   # envelope JSON com identidade e runtime
bun run dev -- mcp --list     # tools, resources e prompts registrados
bun run dev                   # abre a TUI; q sai
```

## Atualizar as skills

O starter kit traz as skills do framework em `.agents/skills/termfy-*`,
registradas em `skills-lock.json`. Quando o framework publicar uma versão
nova:

```bash
bun run skills:update
```

Se a pasta sumir ou o lock corromper, `bun run skills:instalar` refaz a
instalação. Não edite as skills no projeto; mudanças acontecem no framework.

## Gerar o guia do usuário

```bash
bun run ebook
```

A pasta `docs/` do starter kit, a mesma que o binário imprime por `--skill`,
vira `ebook/<Titulo>-Guia-do-Usuario-v0.1.0.pdf` e `.epub`, com o título novo
na capa. Faça isso depois do bootstrap e sempre que `docs/` mudar, avançando
`ebook/VERSION`.

## Validar

```bash
bun run validar
```

O comando encadeia typecheck, `bun test`, conferência das skills instaladas,
conferência de `docs/opencli.json`, conferência do ebook e o build do binário
em `dist/`.

## Primeiro commit

Reescreva a abertura do `README.md` com o propósito do produto, registre a
versão em `CHANGELOG.md` e faça o commit `release: meucli v0.1.0`. O capítulo
[Publicar](08-publicar.md) cobre tag, release e binários.

## Pedir ajuda a um agente

Dentro do repositório, um agente lê `AGENTS.md` e as skills instaladas. Peça,
por exemplo: "adicione o comando `pedidos listar` com filtro por status". A
skill `termfy-cli` o guia pelo registro, pelos testes e pela regeneração do
OpenCLI.
