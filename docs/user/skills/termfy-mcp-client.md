# termfy-mcp-client

A `termfy-mcp-client` configura um binário Termfy, publicado ou em
desenvolvimento, nos clientes de agente Claude Code, Codex, Cursor,
OpenCode e Gemini CLI. Ela não cria tools nem muda o servidor: o modo
`mcp` já existe no executável. No fim, você tem a entrada do servidor no
arquivo do cliente, no escopo pedido, sem nenhum segredo gravado nela. Você
também tem a prova de que a conexão funciona: o Inspector e o próprio
cliente chamam a tool `skill` e recebem a seção CLI da documentação.

## Quando usar

Use esta skill nestas situações:

- a release v0.7.0 do `mycli` saiu e você quer usar a tool `orders_list`
  no Claude Code;
- os desenvolvedores precisam da mesma entrada no projeto, num `.mcp.json`
  compartilhado;
- você está desenvolvendo e quer que o Cursor rode `src/main.ts` direto,
  sem compilar a cada mudança;
- o cliente mostra o servidor `mycli` com erro, timeout ou sem tools.

Não use para criar ou alterar tools, resources e prompts: isso é da
[termfy-mcp](termfy-mcp.md). Para gravar `shop.token` no cofre ou declarar
uma credencial nova, use a [termfy-config](termfy-config.md). Para publicar
o executável que o cliente vai rodar, use antes a
[termfy-release](termfy-release.md).

## Como pedir

Para um binário publicado:

> Use a skill termfy-mcp-client para configurar o mycli publicado no Claude
> Code, no escopo de projeto, e validar a tool `orders_list`.

Para desenvolvimento local:

> Use a skill termfy-mcp-client para ligar o mycli em desenvolvimento ao
> Cursor, rodando `src/main.ts` com Bun.

Para diagnosticar uma falha:

> Use a skill termfy-mcp-client para descobrir por que o Codex não lista as
> tools do mycli.

## O que a skill faz

1. Identifica o cliente, a versão instalada e o escopo (usuário ou
   projeto). Lê o arquivo de configuração existente antes de escrever.
2. Localiza o executável e roda `mycli --version`. Em desenvolvimento, roda
   `bun run src/main.ts --version` na raiz do projeto e anota o caminho
   absoluto do Bun e do entry point.
3. Roda `mycli mcp --list` e confere a presença de `skill`. Roda também
   `mycli doctor` para conferir a configuração e o acesso ao cofre. Avisos
   de stdin e stdout sem TTY são esperados nesse cenário.
4. Adiciona a entrada do cliente. No Claude Code, o formato básico é
   `claude mcp add mycli -- mycli mcp`. Nos demais, aplica o bloco JSON ou
   TOML do cliente com os caminhos reais.
5. Valida o JSON ou o TOML, revisa o diff e recarrega a conexão ou reinicia
   o cliente.
6. Roda `npx @modelcontextprotocol/inspector mycli mcp` (ou
   `npx @modelcontextprotocol/inspector bun run src/main.ts mcp` em
   desenvolvimento). Seleciona stdio, conecta, lista as tools e chama
   `skill` com `{"topic":"cli"}`.
7. No cliente configurado, envia o primeiro prompt de teste e confere no
   histórico que a tool `skill` foi chamada.

## Exemplo

O `mycli` 0.7.0 está instalado em `/usr/local/bin/mycli`. Você quer a
entrada no projeto, então a skill usa o escopo de projeto do Claude Code
com o caminho absoluto:

```bash
claude mcp add --scope project mycli -- /usr/local/bin/mycli mcp
```

O comando grava esta entrada em `.mcp.json`, na raiz do projeto:

```json
{
  "mcpServers": {
    "mycli": {
      "type": "stdio",
      "command": "/usr/local/bin/mycli",
      "args": ["mcp"]
    }
  }
}
```

Repare no que não está ali: nenhum `shop.token`, nenhuma master key, nenhum
`env` com segredo. O servidor lê o token do cofre com `getCredential()`.
Antes, você grava a credencial pela CLI, com o mesmo usuário que roda o
cliente:

```bash
mycli credentials set shop.token
mycli credentials status
```

No Codex, a mesma entrada vai para `~/.codex/config.toml`:

```toml
[mcp_servers.mycli]
command = "/usr/local/bin/mycli"
args = ["mcp"]
```

Em desenvolvimento, sem compilar, o Cursor recebe o Bun e o entry point
como caminhos absolutos em `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mycli": {
      "command": "/home/ana/.bun/bin/bun",
      "args": ["run", "/home/ana/mycli/src/main.ts", "mcp"]
    }
  }
}
```

Com a entrada carregada, a skill envia ao agente o prompt de teste:

> No servidor MCP mycli, chame a tool skill com topic cli. Leia o resultado
> e resuma como usar os commands e a saída JSON. Não altere arquivos nem
> execute operações de escrita.

A conexão está confirmada quando o histórico de tools mostra a chamada a
`skill` com `{"topic":"cli"}` e o retorno em Markdown. Uma resposta em
texto do agente, sem chamada de tool, não confirma nada.

## Regras que a skill segue

- **Só o cliente e o escopo pedidos.** Entradas existentes, comentários e
  outras preferências do arquivo ficam intactos.
- **Caminho absoluto quando o `PATH` falha.** Aplicativos gráficos podem
  herdar um `PATH` diferente do shell. Command e arguments vão em campos
  separados, não numa string só como `bun run src/main.ts mcp`.
- **`mcp` como argument, sem `--json` nem `--list`.** No processo
  persistente, stdout pertence ao JSON-RPC. `mcp --list` imprime o catálogo
  e termina, então o cliente perderia o servidor.
- **Segredo fora da configuração.** Token, credencial e master key não
  entram em `args`, `env` nem no arquivo do cliente. Esses arquivos costumam
  ir para o Git. O cofre existe para guardar o token cifrado.
- **Mesmo usuário e mesma pasta de dados.** Um cliente com outro ambiente lê
  outro cofre. A correção é ajustar o ambiente de lançamento, sem copiar o
  cofre para o cliente.
- **Catálogo não é conexão.** `mcp --list` mostra o que está registrado, mas
  não negocia o protocolo. Por isso a skill faz uma chamada real pelo
  Inspector e pelo cliente.
- **Inspector é ferramenta externa.** O `npx` roda só no diagnóstico. Ele
  não acrescenta Node nem npm ao executável Termfy.
- **Uma entrada por nome e escopo.** Para alternar entre publicado e local,
  a skill substitui a entrada existente em vez de criar outra.
- **Diagnóstico por etapa.** Diante de falha, a skill separa inicialização
  do processo, negociação, descoberta de tools e execução. Ela não aumenta
  timeout antes de achar a etapa lenta nem troca stdio por HTTP.

## O que ela entrega

No relatório final, a skill informa:

- o cliente e a versão;
- o arquivo e o escopo alterados, como `.mcp.json`,
  `~/.codex/config.toml`, `.cursor/mcp.json`, `opencode.json` ou
  `~/.gemini/settings.json`;
- o command e os arguments configurados, sem segredos;
- o resultado de `--version`, `mcp --list`, do Inspector e da primeira
  chamada no cliente.

Ela separa o que testou do que ficou como instrução pendente, por exemplo
quando o cliente não está instalado na máquina. Nenhum arquivo do
repositório do binário muda, só a configuração do cliente.

## Próxima skill

Com o binário ligado aos agentes, o ciclo recomeça na próxima evolução:
volte à [termfy-spec](termfy-spec.md) para especificar o que vem depois.
