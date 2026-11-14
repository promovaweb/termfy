# Integrar uma API

Muitos binários existem para conversar com um serviço externo. Este
capítulo mostra o caminho completo com um exemplo concreto: o `mycli`
passa a operar a API de WhatsApp da uazapi, para avisar os clientes da
loja sobre os pedidos. Você vê a especificação
virar spec, o token ir para o cofre, o client HTTP centralizar as
requests e os commands receberem a instância por parâmetro.

| Etapa | Skill | Resultado |
| --- | --- | --- |
| ler a documentação da API | [termfy-api-import](skills/termfy-api-import.md) | Surface e Tests da spec preenchidos |
| URL e token | [termfy-config](skills/termfy-config.md) | key `uazapi.baseUrl` e credencial `uazapi.admintoken` |
| client HTTP | [termfy-api](skills/termfy-api.md) | `src/api/uazapi.ts` com timeout, retry e erros |
| commands | [termfy-cli](skills/termfy-cli.md) | `instances list`, `instances status`, `messages send` |
| tools e tela | [termfy-mcp](skills/termfy-mcp.md) e [termfy-tui](skills/termfy-tui.md) | leitura pelo agente e aba Instances |

## O contrato da uazapi

A API usa dois tokens com papéis diferentes. Entender isso antes de pedir
qualquer código evita guardar segredo demais no cofre.

| Header | Para que serve | Endpoints usados no exemplo |
| --- | --- | --- |
| `admintoken` | administrar o servidor: listar e criar instâncias | `GET /instance/all` |
| `token` | operar uma instância (um número de WhatsApp) | `GET /instance/status`, `POST /instance/connect`, `POST /send/text` |

O servidor fica em `https://{subdomain}.uazapi.com`, com `free` ou `api`
no lugar do subdomínio. A resposta de `GET /instance/all` traz, para cada
instância, `id`, `name`, `status` e o `token` dela:

```json
[
  {
    "id": "r183e2ef9597845",
    "name": "instancia-1",
    "token": "abc123xyz",
    "status": "connected",
    "profileName": "Meu WhatsApp"
  },
  {
    "id": "r283e2ef9597846",
    "name": "instancia-2",
    "token": "def456xyz",
    "status": "disconnected"
  }
]
```

Daí sai a escolha do exemplo: só o `admintoken` vai para o cofre. Quando
um command recebe `--instance instancia-1`, o client lista as instâncias,
acha o token pelo nome e usa esse token em memória, sem gravá-lo. Trocar
o token de uma instância no painel não exige nenhuma ação no binário.

## 1. Importar a documentação

Peça ao agente:

> Use a skill termfy-api-import com a especificação
> `https://docs.uazapi.com/openapi-bundled.json`. Quero listar instâncias,
> ver o status e conectar uma instância e enviar texto. O admintoken fica
> no cofre e cada command recebe a instância por --instance.

A skill lê a especificação OpenAPI, separa as operações pedidas e
preenche a spec com o que encontrou. Ela não implementa nada: o resultado
é texto na spec, para você aprovar.

```markdown
## Surface

- Adiciona a setting `uazapi.baseUrl`: `string`, padrão
  `https://free.uazapi.com`, URL do servidor uazapi.
- Adiciona a credencial `uazapi.admintoken`: usada por `instances list`,
  `instances status`, `instances connect`, `messages send` e
  `instances_list`; painel da uazapi.
- Adiciona o command `instances list`: List the instances on the server;
  sem options; `data` `{ count, instances[] }`; exit codes 3, 4 e 5.
- Adiciona o command `instances status`: Show whether one instance is
  connected; `--instance <name>`; `data` `{ name, connected, loggedIn,
  phone }`; exit codes 2, 4, 5 e 6.
- Adiciona o command `messages send`: Send a text message;
  `--instance <name>`, `--number <phone>`, `--text <message>`; `data`
  `{ instance, id, chatId, status }`; exit codes 2, 4, 5 e 6.
- Adiciona a tool `instances_list`: lista instâncias sem tokens; efeito
  `network`.
```

Neste exemplo, `messages send` fica restrito à CLI, porque o envio altera
um serviço externo. As tools MCP apenas consultam as instâncias e você
executa o envio pelo comando.

## 2. URL e token

A [termfy-config](skills/termfy-config.md) declara a key em
`src/config/settings.ts`, junto das keys do esqueleto:

```ts
{
  key: "uazapi.baseUrl",
  type: "string",
  default: "https://free.uazapi.com",
  description: "Base URL of the uazapi server, such as https://free.uazapi.com or https://api.uazapi.com.",
},
```

Você grava o token uma vez, sem que ele passe por argumento nem fique
no histórico do shell:

```bash
mycli config set uazapi.baseUrl https://api.uazapi.com
mycli credentials set uazapi.admintoken
```

Sem `--stdin`, o `credentials set` pede o valor no terminal, sem eco. Num
CI, use `--stdin` com o segredo vindo do ambiente.

## 3. O client HTTP

A [termfy-api](skills/termfy-api.md) cria `src/api/uazapi.ts` como o
único arquivo que chama `fetch`. Commands, tools e a tela chamam as
funções dele, então os três modos falam com a API do mesmo jeito.

A base é uma função de request que aplica o contrato do client:
timeout por tentativa, retry só para leitura e erro sem segredo.

```ts
const TIMEOUT_MS = 5_000;
const READ_ATTEMPTS = 3;

type Auth = { admintoken: string } | { token: string };

async function request(method: "GET" | "POST", path: string, auth: Auth, body?: unknown): Promise<unknown> {
  const url = new URL(path, baseUrl());
  const attempts = method === "GET" ? READ_ATTEMPTS : 1;
  let last: AppError | undefined;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        redirect: "error",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { accept: "application/json", ...(body ? { "content-type": "application/json" } : {}), ...auth },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      last = error.network(`uazapi did not answer ${method} ${path}.`, { service: "uazapi", method, path, status: null, attempts: attempt });
      continue;
    }
    const text = (await response.text()).slice(0, 8 * 1024);
    if (response.ok) return JSON.parse(text);
    last = error.network(`uazapi answered ${response.status} for ${method} ${path}.`, { service: "uazapi", method, path, status: response.status, attempts: attempt });
    if (response.status < 500) break;
  }
  throw last!;
}
```

Quatro escolhas aparecem no código:

- **POST tem uma tentativa só.** Se a rede cair depois que o servidor
  enviou a mensagem, repetir enviaria duas vezes.
- **4xx não repete.** Um 401 por token errado não melhora na segunda
  tentativa.
- **`redirect: "error"`.** Um redirect poderia levar o token para outra
  origem.
- **`error.network` sai com exit code 5** e leva método, caminho e status
  nos `details`. O token não entra na mensagem.

Sobre essa base ficam as funções de domínio. A resolução da instância por
nome é o centro do exemplo:

```ts
function admin(): Auth {
  return { admintoken: getCredential("uazapi.admintoken") };
}

/** Token of one instance, looked up by name. NOT_FOUND (6) when absent. */
async function instanceToken(name: string): Promise<string> {
  const found = parseInstances(await request("GET", "/instance/all", admin())).find((i) => i.name === name);
  if (!found) throw error.notFound(`Instance "${name}" not found. Run: mycli instances list`, { instance: name });
  return found.token;
}

/** Lists the server instances, without their tokens. */
export async function listInstances(): Promise<Instance[]> {
  return parseInstances(await request("GET", "/instance/all", admin())).map(({ token: _token, ...rest }) => rest);
}

/** Sends a text message. Never retried: a repeat would send twice. */
export async function sendText(name: string, number: string, text: string): Promise<SentMessage> {
  const data = await request("POST", "/send/text", { token: await instanceToken(name) }, { number, text });
  return toSentMessage(data, number);
}
```

`getCredential` lança o erro de credencial (exit code 4) quando o token
não está no cofre, antes de qualquer request. `listInstances` remove o
`token` de cada item: nenhum command, tool ou tela recebe o segredo de
uma instância.

## 4. Commands com a instância por parâmetro

A [termfy-cli](skills/termfy-cli.md) cria a família `instances` e o
command `messages send`. A option `--instance` é declarada uma vez e
reaproveitada:

```ts
export const instanceOption: OptionDefinition = {
  name: "--instance",
  aliases: ["-i"],
  argument: { name: "name" },
  description: "Instance name, as shown by `instances list`.",
};

export function requireInstance(options: Record<string, unknown>): string {
  const name = options.instance;
  if (typeof name !== "string" || !name) throw error.usage("Missing --instance <name>. Run: mycli instances list");
  return name;
}

const status: Command = {
  name: "status",
  description: "Show whether one instance is connected and logged in.",
  options: [instanceOption],
  exitCodes: [ExitCode.USAGE, ExitCode.NOT_FOUND, ExitCode.CREDENTIALS, ExitCode.NETWORK_OR_API],
  examples: [`${manifest.bin} instances status --instance sales`, `${manifest.bin} instances status -i sales --json`],
  run: async (ctx) => {
    const s = await instanceStatus(requireInstance(ctx.options));
    return {
      data: s,
      text: () => table([["Instance", s.name], ["Connected", s.connected ? "yes" : "no"], ["Phone", s.phone ?? "-"]]),
    };
  },
};
```

O command não sabe nada de HTTP. Ele valida a entrada, chama o client e
devolve `data` para o `--json` e `text` para o terminal. O registry cuida
do envelope, da ajuda e do exit code.

Você lista as instâncias e usa o nome escolhido nas chamadas seguintes:

```bash
mycli instances list
mycli instances status --instance instancia-1 --json
mycli messages send -i instancia-1 --number 5511999999999 --text "Pedido enviado"
```

```text
● instancia-1      connected     Meu WhatsApp
○ instancia-2      disconnected
```

```json
{
  "ok": true,
  "command": "mycli instances status",
  "data": {
    "name": "instancia-1",
    "connected": true,
    "loggedIn": true,
    "phone": "5511999999999"
  }
}
```

E os erros chegam com o código certo:

| Situação | Mensagem | Exit code |
| --- | --- | --- |
| faltou `--instance` | `Missing --instance <name>. Run: mycli instances list` | 2 |
| token não está no cofre | `Credential "uazapi.admintoken" not found. Save it with: mycli credentials set uazapi.admintoken` | 4 |
| `admintoken` inválido | `uazapi answered 401 for GET /instance/all.` | 5 |
| instância com outro nome | `Instance "vendas" not found. Run: mycli instances list` | 6 |

Um script decide o que fazer pelo exit code, sem interpretar a mensagem.

## 5. Tools e tela

A [termfy-mcp](skills/termfy-mcp.md) registra `instances_list` chamando
a mesma `listInstances`. Falha prevista vira `isError: true`, com a
mensagem do `AppError`:

```ts
server.registerTool(
  "instances_list",
  {
    title: "List uazapi instances",
    description: "Use when the user asks which WhatsApp instances exist or which are connected. Returns name, status and profile, without tokens.",
    inputSchema: {},
  },
  async () => {
    try {
      const instances = await listInstances();
      const d = { count: instances.length, instances };
      return { content: [{ type: "text", text: JSON.stringify(d, null, 2) }], structuredContent: d };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { content: [{ type: "text", text: message }], isError: true };
    }
  },
);
```

A [termfy-tui](skills/termfy-tui.md) monta a aba Instances com
`listPanel`, carregando a lista no `onEnter` e mostrando o status da
instância selecionada. Ao criar a aba, a skill acrescenta `instances` aos
valores aceitos de `tui.initialTab`, para que você possa abrir a TUI
direto nela.

## 6. Testar sem a API real

Nenhum teste chama a uazapi de verdade. A
[termfy-api](skills/termfy-api.md) sobe um servidor local com
`Bun.serve`, que responde como a especificação. Depois, aponta
`uazapi.baseUrl` para ele. HTTP sem TLS é aceito só em `127.0.0.1` e
`localhost`, justamente para esses testes.

```ts
const server = Bun.serve({
  port: 0,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/instance/all") {
      if (req.headers.get("admintoken") !== "admin-test") return new Response("{}", { status: 401 });
      return Response.json([{ id: "1", name: "sales", token: "inst-test", status: "connected" }]);
    }
    if (url.pathname === "/send/text") {
      sends++;
      return new Response("{}", { status: 500 });
    }
    return new Response("{}", { status: 404 });
  },
});
```

Com esse servidor, os testes de aceite da spec viram verificações
diretas: o `admintoken` vai no header certo, a lista sai sem tokens, um
nome desconhecido sai com 6 e um 500 no envio resulta em uma única
request (`sends === 1`), sem reenvio.

## Próximo passo

Com as tarefas e os testes marcados, a spec fecha e o `CLISPEC.md` ganha
a superfície nova. O capítulo [Guardar dados](12-store-data.md) mostra o
caso de um binário que precisa guardar informações entre execuções.
