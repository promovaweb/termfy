# termfy-api

A skill `termfy-api` liga o seu binário a um serviço HTTP externo. Ela cria
um client único em `src/api/<service>.ts`, usado pelo CLI, pela TUI e pelo
servidor MCP, com a credencial lida do cofre, a URL lida de `settings.json`,
timeout por tentativa e retries limitados. No fim, você tem funções de
domínio tipadas e um arquivo `tests/api-<service>.test.ts` que testa o
client contra um servidor local feito com `Bun.serve`.

## Quando usar

- Você vai consumir uma API pela primeira vez, como a de WhatsApp da
  uazapi. Ela pede autenticação, URL configurável e tratamento de erro.
- Um command, uma tool ou uma screen precisa de uma operação remota nova.

Não use esta skill para criar a família de commands que consome o client:
para isso use [termfy-command-set](termfy-command-set.md). Para declarar só
uma setting ou credencial nova, sem HTTP, use
[termfy-config](termfy-config.md). Se o contrato do serviço ainda não está
na spec, comece pela skill `termfy-spec`.

## Como pedir

Para uma integração nova:

> Use a skill termfy-api para integrar a API da uazapi: listar instâncias
> com o admintoken e enviar texto pela instância escolhida em `--instance`.

Para o client do domínio padrão do guia:

> Use a skill termfy-api para criar o client da loja com `listOrders`,
> lendo `shop.baseUrl` e a credencial `shop.token`.

Para revisar um client que já existe:

> Use a skill termfy-api para revisar o client da loja: o POST de criação
> de pedido está com retry e pode duplicar pedidos.

## O que a skill faz

1. Roda `git status --short` e lê a spec aberta em `specs/` (status
   `in_progress`): Surface, Behavior, Design e os itens `#termfy-api`.
2. Lê a documentação oficial do serviço para autenticação, endpoints,
   paginação, limites e idempotência. Contrato ausente volta para a spec.
3. Cria `src/api/<service>.ts`, separando montagem da request, execução com
   timeout, retries, validação e normalização.
4. Declara a key `<service>.baseUrl` em `SETTINGS_SCHEMA`, no arquivo
   `src/config/settings.ts`, com `key`, `type`, `default` e `description`.
5. Lê a credencial com `getCredential("<service>.token")` a cada chamada.
6. Cria `tests/api-<service>.test.ts` com um dublê em `Bun.serve` e uma
   pasta temporária no lugar de `~/.<bin>/`.
7. Liga o client aos consumidores previstos e atualiza
   `docs/configuration.md`. Roda `bun test` e `bun run typecheck`. Se a CLI
   mudou, roda `bun run opencli` antes de `bun run validate`. Marca `[x]`
   nos itens implementados e testados da spec.

## Exemplo

A uazapi atende em `https://{subdomain}.uazapi.com`. O header `admintoken`
autoriza `GET /instance/all`, que lista as instâncias com `name`, `token` e
`status`. O header `token` opera uma instância: `GET /instance/status`,
`POST /instance/connect` e `POST /send/text` com `number` e `text`. Só o
admintoken vai para o cofre. O token da instância é resolvido em memória
pelo nome recebido em `--instance <nome>`.

A setting entra em `SETTINGS_SCHEMA`. Você grava a URL real com
`mycli config set uazapi.baseUrl https://minhaloja.uazapi.com`.

```ts
{
  key: "uazapi.baseUrl",
  type: "string",
  default: "https://subdomain.uazapi.com",
  description: "Base URL of the uazapi server.",
},
```

O client fica em `src/api/uazapi.ts`:

```ts
import { error } from "../app/errors.ts";
import { getCredential } from "../config/credentials.ts";
import { getPath, readSettings } from "../config/settings.ts";

export interface Instance { name: string; token: string; status: string }

function baseUrl(): URL {
  const raw = getPath(readSettings(), "uazapi.baseUrl");
  let url: URL; try { url = new URL(String(raw)); } catch {
    throw error.config("uazapi.baseUrl is not a valid URL.", { key: "uazapi.baseUrl" });
  }
  const localTest = process.env.NODE_ENV === "test" && url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !localTest) {
    throw error.config("uazapi.baseUrl must use HTTPS.", { key: "uazapi.baseUrl" });
  }
  return url;
}

async function call(method: "GET" | "POST", path: string, headers: Record<string, string>,
  body: unknown, retry: boolean): Promise<unknown> {
  const url = new URL(path, baseUrl());
  const attempts = retry ? 3 : 1;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        method, redirect: "error", signal: AbortSignal.timeout(5000),
        headers: { ...headers, "content-type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      if (attempt < attempts) { await Bun.sleep(250 * 2 ** attempt); continue; }
      throw error.network("uazapi request failed.",
        { service: "uazapi", method, status: null, body: null, attempts: attempt });
    }
    if (response.status >= 500 && attempt < attempts) {
      await response.body?.cancel(); await Bun.sleep(250 * 2 ** attempt); continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw error.network(`uazapi returned HTTP ${response.status}.`,
        { service: "uazapi", method, status: response.status, body: "[omitted]", attempts: attempt });
    }
    return response.status === 204 ? null : await response.json();
  }
  throw error.network("uazapi request failed.", { service: "uazapi", method, attempts });
}

export async function listInstances(): Promise<Instance[]> {
  const admintoken = getCredential("uazapi.admintoken");
  const raw = await call("GET", "/instance/all", { admintoken }, undefined, true);
  if (!Array.isArray(raw)) throw error.network("Unexpected uazapi response.", { service: "uazapi" });
  return raw.map((item) => ({
    name: String(item?.name ?? ""), token: String(item?.token ?? ""), status: String(item?.status ?? ""),
  }));
}

/** Sends one text message. No retry: repeating the POST sends it twice. */
export async function sendText(instance: string, number: string, text: string) {
  const found = (await listInstances()).find((i) => i.name === instance);
  if (!found) throw error.notFound(`Instance "${instance}" not found.`, { instance });
  const token = found.token;
  await call("POST", "/send/text", { token }, { number, text }, false);
  return { instance, number, sent: true };
}
```

O command `instances list` projeta só `name` e `status`, sem o token:

```console
$ mycli credentials set uazapi.admintoken
$ mycli instances list
  loja     connected
  suporte  disconnected
$ mycli instances list --json
{
  "ok": true,
  "command": "mycli instances list",
  "data": {
    "count": 2,
    "instances": [
      { "name": "loja", "status": "connected" },
      { "name": "suporte", "status": "disconnected" }
    ]
  }
}
```

Sem o admintoken no cofre, a chamada para antes de qualquer request:

```console
$ mycli send text --instance loja --number 5511999999999 --text "Pedido enviado"
error Credential "uazapi.admintoken" not found. Save it with: mycli credentials set uazapi.admintoken [4 CREDENTIALS]
```

## Regras que a skill segue

- **Um client por serviço.** O `fetch` fica no client, que devolve objetos
  tipados, sem o envelope `{ ok, command }`. Assim CLI, TUI e MCP recebem o
  mesmo erro e o mesmo retry. Cada camada monta a própria apresentação.
- **Token só pelo cofre.** O client chama `getCredential` com o nome
  literal. Token por argument, option ou campo de tool fica no histórico do
  shell e no log do agente.
- **Erro de credencial preservado.** O `AppError` de código 4 sobe intacto
  para que você receba a orientação de gravar a credencial ausente.
- **URL validada antes do token.** O protocolo e a origem são conferidos
  antes do envio. HTTP fica restrito ao loopback dos testes, para o token
  não trafegar em texto claro.
- **Timeout novo a cada tentativa.** `AbortSignal.timeout` é recriado por
  tentativa, porque um sinal já vencido abortaria a tentativa seguinte.
- **Retry só no que pode repetir.** GET ganha até três tentativas em falha
  de rede e 5xx. POST de envio fica com uma: repetir enviaria a mensagem
  duas vezes. 401, 403 e 404 viram código 5 sem retry, pois repetir não
  muda o resultado. O 429 segue `Retry-After` dentro do orçamento.
- **Detalhes sanitizados.** `details` traz serviço, método, status e corpo
  resumido. Token, cookies e headers de autenticação ficam de fora porque
  `details` aparece no `--json`.
- **Teste sem rede real.** O dublê roda em `127.0.0.1` com porta 0 e a
  pasta de configuração é temporária. O teste não depende da API real nem
  do cofre da pessoa.

## O que ela entrega

A skill relata arquivos, operações, política de retry e timeout, key, nome
da credencial e testes. Pendências aparecem sem valores de credenciais.

| Arquivo | Mudança |
| --- | --- |
| `src/api/<service>.ts` | client novo com as funções de domínio |
| `src/config/settings.ts` | key `<service>.baseUrl` em `SETTINGS_SCHEMA` |
| `tests/api-<service>.test.ts` | testes com `Bun.serve` em loopback |
| `docs/configuration.md` | key e credencial documentadas |
| `specs/<spec>.md` | itens `#termfy-api` marcados com `[x]` |

## Próxima skill

Entregue commands, tools e screen que usam o client com
[termfy-command-set](termfy-command-set.md), ou um command isolado com
[termfy-cli](termfy-cli.md).
