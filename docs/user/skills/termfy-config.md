# termfy-config

A skill `termfy-config` mantém o que o seu binário guarda em `~/.<bin>/`:
as preferências em `settings.json`, os segredos no cofre cifrado
`credentials.json`, a master key e as variáveis de ambiente que mudam esse
comportamento. Ela acrescenta keys ao `SETTINGS_SCHEMA` e liga credenciais
aos commands e às tools que as consomem. No fim, você tem a key visível em
`config schema`, a credencial lida com segurança e testes isolados da sua
pasta pessoal.

## Quando usar

- Você precisa de uma preferência nova, como `shop.baseUrl` ou o tamanho de
  página de `orders list`.
- Um command ou uma tool vai ler a credencial `shop.token`.
- Você quer mudar a política da master key, por exemplo para CI.
- O cofre não abre e você quer entender a pasta `~/.mycli/`.

Para o client HTTP que usa a URL e o token, use
[termfy-api](termfy-api.md): ela chama esta skill para declarar a key. Para
um command que só lê uma setting já existente, use
[termfy-cli](termfy-cli.md).

## Como pedir

Para uma key nova:

> Use a skill termfy-config para acrescentar `shop.baseUrl` e
> `shop.pageSize` ao schema, com tipo, padrão e descrição.

Para consumir uma credencial:

> Use a skill termfy-config para o command `orders list` e a tool
> `orders_list` lerem a credencial `shop.token` do cofre.

Para preparar o CI:

> Use a skill termfy-config para documentar como rodar o `mycli` no CI com
> `MYCLI_MASTER_KEY`, sem gravar `master.key` em disco.

## O que a skill faz

1. Lê a spec aberta em `specs/`: as settings e credenciais da Surface, o
   Behavior, o Design e os itens `#termfy-config`. Sem spec que cubra o
   pedido, chama a skill `termfy-spec` antes.
2. Lê `docs/configuration.md` e os arquivos de `src/config/`: `paths.ts`,
   `settings.ts`, `crypto.ts` e `credentials.ts`.
3. Para uma key: acrescenta a definição em `SETTINGS_SCHEMA`, lê o valor com
   `getPath(readSettings(), "group.key")` e testa em
   `tests/config.test.ts` a conversão e o padrão.
4. Para uma credencial: chama `getCredential(name)` no início do `run` ou
   do callback da tool, antes de qualquer efeito. Acrescenta
   `ExitCode.CREDENTIALS` em `exitCodes` do command.
5. Documenta a key ou a credencial em `docs/configuration.md` e na
   `longDescription` do command que a usa.
6. Roda `bun run validate` ao concluir o escopo e marca `[x]` nos itens.

## Exemplo

Duas keys novas entram em `SETTINGS_SCHEMA`, no `src/config/settings.ts`:

```ts
{
  key: "shop.baseUrl",
  type: "string",
  default: "https://api.example.com",
  description: "Base URL for the shop API.",
},
{
  key: "shop.pageSize",
  type: "number",
  default: 10,
  description: "Default number of orders returned by orders list.",
},
```

O command lê os dois valores e a credencial em tempo de chamada:

```ts
import { getPath, readSettings } from "../../config/settings.ts";
import { getCredential } from "../../config/credentials.ts";

const settings = readSettings();
const baseUrl = String(getPath(settings, "shop.baseUrl"));
const pageSize = Number(getPath(settings, "shop.pageSize") ?? 10);
const token = getCredential("shop.token");
```

O `config schema` já mostra as keys. O `config set` converte o texto para
o tipo declarado:

```console
$ mycli config schema
Known keys

  output.format      Default CLI output format when --json is not given. [enum: text|json; default "text"]
  ...
  shop.baseUrl       Base URL for the shop API. [string; default "https://api.example.com"]
  shop.pageSize      Default number of orders returned by orders list. [number; default 10]
$ mycli config set shop.pageSize ten
error "shop.pageSize" expects a number; got "ten". [3 CONFIG]
$ mycli config set shop.pageSize 25
✓ shop.pageSize = 25
```

A credencial entra pelo prompt ou por `--stdin`, sem argument. A
leitura mascara o valor por padrão:

```console
$ printf '%s\n' "$SHOP_TOKEN" | mycli credentials set shop.token --stdin
✓ credential "shop.token" saved to /home/ana/.mycli/credentials.json
$ mycli credentials get shop.token
shp_************op
$ mycli credentials get shop.token --json
{
  "ok": true,
  "command": "mycli credentials get",
  "data": { "name": "shop.token", "masked": "shp_************op", "length": 20 }
}
```

No CI, a master key vem da variável de ambiente, em 64 caracteres hex. O
nome da variável sai do nome do binário em maiúsculas:

```bash
export MYCLI_MASTER_KEY="$(cat /run/secrets/mycli-master-key)"
mycli orders list --json
```

## Regras que a skill segue

- **Preferência em settings, segredo no cofre.** O que dá acesso a um
  serviço vai para `credentials.json`, porque `settings.json` fica em texto
  claro.
- **Key nova no schema.** Com `key`, `type`, `default` e `description`, a key
  ganha conversão, padrão e linha em `config schema`. Fora do schema ela é
  aceita como texto livre, sem validação.
- **Nome de credencial em `service.purpose`.** Minúsculas, como
  `shop.token` ou `openai.api_key`. O cofre rejeita outro formato com
  código 2.
- **`getCredential` sem desvio.** A função lança `AppError` com código 4
  quando o valor falta. Capturar esse erro para seguir sem o valor esconde
  da pessoa o passo que falta.
- **Segredo fora de saída.** O valor não aparece em argument, log, mensagem
  de erro, `--json` sem `--reveal`, resposta de tool ou frame da TUI.
  `mask()` cobre qualquer exibição.
- **Permissões 0600 e 0700.** Arquivos e pasta mantêm esses modos para
  outros usuários da máquina não lerem o cofre.
- **Variável antes do arquivo.** `<BIN>_MASTER_KEY` tem prioridade sobre
  `master.key`. Em CI e servidores, a variável evita gravar a chave em
  disco.
- **Rotação sem apagar o cofre.** `credentials rotate-key` decifra com a
  chave atual e grava uma nova em `master.key`. Com `--from-env`, a chave
  antiga vem de `master.key` e a nova vem da variável.
- **Testes isolados.** `<BIN>_HOME` aponta para uma pasta temporária, como
  em `tests/config.test.ts`, para o teste não ler o cofre da pessoa.

O cofre protege contra leitura casual, backup e varredura de disco. Ele não
protege contra outro processo do mesmo usuário do sistema, que lê
`master.key`. Para esse cenário, injete a variável a partir de um
gerenciador de segredos.

## O que ela entrega

A skill lista as keys ou credenciais adicionadas, os arquivos alterados e
os testes executados. Valores de credenciais ficam fora da resposta.

| Arquivo | Mudança |
| --- | --- |
| `src/config/settings.ts` | keys novas em `SETTINGS_SCHEMA` |
| `tests/config.test.ts` | conversão e padrão das keys |
| `docs/configuration.md` | tabela de keys e nomes de credenciais |
| `src/cli/commands/<nome>.ts` | `getCredential` e `ExitCode.CREDENTIALS` |
| `src/mcp/tools/<grupo>.ts` | leitura da credencial e `isError` |
| `specs/<spec>.md` | itens `#termfy-config` marcados com `[x]` |

## Próxima skill

Com a key e a credencial no lugar, implemente o acesso ao serviço com
[termfy-api](termfy-api.md). Para expor a leitura a agentes, siga com
[termfy-mcp](termfy-mcp.md).
