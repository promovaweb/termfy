# MCP

## O servidor embutido

`meucli mcp` conecta um `McpServer` ao transporte stdio. A partir daí, stdout
pertence ao JSON-RPC e qualquer diagnóstico vai para stderr. O processo só
termina quando o cliente fecha o transporte.

Configuração em um cliente:

```json
{ "mcpServers": { "meucli": { "command": "meucli", "args": ["mcp"] } } }
```

No Claude Code: `claude mcp add meucli -- meucli mcp`. Em desenvolvimento,
sem compilar: `"command": "bun", "args": ["run", "src/main.ts", "mcp"]`.

## O que o starter kit expõe

| Tipo | Nome | Função |
| --- | --- | --- |
| tool | `about` | identidade, runtime, plataforma, pasta de dados, créditos |
| tool | `exit_codes` | tabela de códigos de saída |
| tool | `skill` | documentação embutida, inteira ou por tópico |
| tool | `config_list` | chaves de settings.json em vigor e o esquema |
| tool | `config_get` | valor de uma chave |
| tool | `credentials_status` | arquivo, origem da chave mestra, quantidade e nomes |
| resource | `meucli://about` | identidade em JSON |
| resource | `meucli://exit-codes` | códigos em JSON |
| resource | `meucli://skill` | documentação completa |
| resource | `meucli://skill/{topico}` | uma seção; o template lista os tópicos |
| prompt | `operar` | instrui o agente a ler `skill cli` e cumprir uma tarefa pelo CLI com `--json` |

Nenhuma tool devolve o valor de uma credencial e nenhuma grava. Escrita
continua no CLI, onde há confirmação humana.

`meucli mcp --list` enumera tudo sem abrir o transporte. O servidor mantém um
catálogo durante o registro, então a lista e o que o cliente vê nunca
divergem.

## Regras para tools

- Nome em `snake_case`, `<grupo>_<acao>`.
- `title`, `description` que diz quando usar e o que devolve, `inputSchema`
  em Zod com `.describe()` em cada campo.
- Resposta com `content` em texto e `structuredContent` com o mesmo objeto.
  Falha prevista devolve `isError: true` com a ação sugerida.
- Tools que gravam ou chamam rede dizem isso na descrição.
- Respostas curtas. Paginação por `limite` e `cursor` quando a lista cresce.
- Tools que consomem APIs leem o token com `obterCredencial()` internamente.

## Economia de tokens

O OpenMCP, padrão para converter APIs web em servidores MCP, formaliza algo
que vale para qualquer servidor: o agente lê todas as descrições de tool a
cada conversa, então cada palavra a mais custa em todas as chamadas. O
Termfy aplica isso com uma tool de descoberta (`skill`) em vez de dezenas de
tools de documentação, descrições de duas frases e resources para dados
passivos.

## Adicionar uma tool

1. Copie `template/tool/exemplo.ts` para `src/mcp/tools/<grupo>.ts`.
2. Implemente reutilizando funções de `src/config/` e coletores do CLI.
3. Acrescente ao `catalogo.tools` e registre em `registrarTudo`
   (`src/mcp/servidor.ts`).
4. Teste em `tests/mcp.test.ts`, que sobe o binário e conversa pelo `Client`
   do SDK, e manualmente com `npx @modelcontextprotocol/inspector bun run src/main.ts mcp`.
5. Atualize a tabela em `docs/mcp.md`.

A skill `termfy-mcp` traz o contrato de tool, o guia de testes e a
documentação do SDK e da especificação MCP em `references/`.
