# termfy-api-import

A skill `termfy-api-import` recebe a documentação de uma API (OpenAPI ou
Swagger, coleção Postman, página de referência, PDF ou texto colado) e a
converte em uma spec de evolução em `specs/NNNN-slug.md`. Ela lê a
documentação inteira, propõe a forma do CLI e grava commands por recurso,
tools MCP, settings e credenciais na `## Surface` da spec, com Behavior,
Design, Tasks e Tests. O resultado não é código. No fim, você tem uma spec
pronta para a `termfy-api` criar o client e para a `termfy-command-set`
gerar os commands.

## Quando usar

Use a `termfy-api-import` nestas situações:

- Você tem a especificação OpenAPI de um serviço e quer um CLI para ele.
- Você tem só exemplos de `curl` colados de uma página de referência.
- Você quer acrescentar ao binário um grupo de commands que espelha uma
  API externa.

Prefira outra skill nestes casos:

- O projeto ainda não tem `CLISPEC.md`: passe antes pela
  [termfy-clispec](termfy-clispec.md).
- A evolução não parte de uma documentação de API: use a
  [termfy-spec](termfy-spec.md).
- A spec já existe e falta escrever o client HTTP: use a `termfy-api`.

## Como pedir

Os exemplos usam a API de WhatsApp da uazapi. O `mycli` da loja ganha o
envio de mensagens para avisar os clientes sobre os pedidos.

Com a especificação OpenAPI pública:

> Use a skill termfy-api-import para converter
> `https://docs.uazapi.com/openapi-bundled.json` em uma spec do mycli.
> Quero listar as instâncias, ver o status, conectar e enviar texto.

Com um recorte menor, só leitura:

> Use a skill termfy-api-import para criar uma spec do mycli só com a
> listagem e o status das instâncias da uazapi, a partir da especificação
> em `https://docs.uazapi.com/openapi-bundled.json`.

Com exemplos colados:

> Use a skill termfy-api-import com estes exemplos de `curl` da uazapi:
> `GET /instance/all` com o header `admintoken` e `POST /send/text` com o
> header `token`.

## O que a skill faz

1. Roda `git status --short`, lê o `CLISPEC.md` e lista os arquivos de
   `specs/`. Sem `CLISPEC.md`, encaminha para a `termfy-clispec`.
2. Obtém a documentação. Uma URL é baixada para `tmp/`, fora do controle de
   versão. Com OpenAPI, lê o arquivo com `bun -e` e percorre `servers`,
   `paths`, `parameters`, `requestBody`, `responses` e
   `components.securitySchemes`.
3. Monta uma tabela de trabalho com recursos, endpoints, parâmetros,
   autenticação, servers, paginação e erros.
4. Aplica o mapeamento: agrupa endpoints por recurso, espelha cada command
   de leitura em uma tool MCP e define settings e credenciais.
5. Mostra a proposta como tabela (command, endpoint, options, credencial).
   Você escolhe o que entra agora e o que fica para depois.
6. Cria a spec pelo ciclo da `termfy-spec`: próximo número livre,
   `Status: draft` e linha no índice do `CLISPEC.md`. Se uma spec aberta
   já cobre a API, edita essa spec.
7. Grava a Surface, o Goal com o recorte, o Behavior por command, o Design
   com client, paginação e rate limit, as Tasks por recurso, os Tests e as
   Notes com a fonte e as dúvidas.
8. Relê a spec contra o contrato da `termfy-spec` e indica a sequência de
   skills.

## Exemplo

A proposta que a skill mostra antes de gravar:

| Command | Endpoint | Options | Credencial |
| --- | --- | --- | --- |
| `instances list` | `GET /instance/all` | | `uazapi.admintoken` |
| `instances status` | `GET /instance/status` | `--instance <name>` | `uazapi.admintoken` |
| `instances connect` | `POST /instance/connect` | `--instance <name>` | `uazapi.admintoken` |
| `messages send` | `POST /send/text` | `--instance`, `--number`, `--text` | `uazapi.admintoken` |

O mapeamento sugere `uazapi.api_key` para uma API key em header. Neste
exemplo, a pessoa escolheu `uazapi.admintoken`, o nome do header na
documentação. A skill registrou a escolha. Trechos da spec gravada em
`specs/0004-uazapi-whatsapp.md`:

```markdown
# 0004 Mensagens por WhatsApp com a uazapi

Status: draft

## Goal

O operador quer avisar clientes pelo WhatsApp sem sair do terminal.
Esta spec cobre instâncias (listar, status, conectar) e envio de texto.
Fora desta evolução: grupos, mídia e webhooks.

## Behavior

`mycli instances list` imprime nome e status de cada instância; com
`--json`, devolve `{ count, instances[] }`. `mycli messages send
--instance loja --number 5511999990000 --text "Pedido enviado"` imprime
o id da mensagem; com `--json`, devolve `{ message }`. Sem
`uazapi.admintoken` no cofre, sai com 4 e sugere
`mycli credentials set uazapi.admintoken`. Instância inexistente sai com
6. Resposta 429 ou 5xx sai com 5, com `details.status`.

## Design

- `uazapi/client.ts`: base URL de `uazapi.baseUrl`; header `admintoken`
  para `GET /instance/all` e header `token` para as rotas da instância.
- `uazapi/instances.ts`: resolve o `token` da instância pelo nome
  recebido em `--instance`.
- Rate limit: conferir os cabeçalhos de retry na especificação.

## Surface

- Adiciona o command `instances list`: List WhatsApp instances; `data`
  `{ count, instances[] }`; exit codes 4 e 5; credencial
  `uazapi.admintoken`.
- Adiciona o command `messages send`: Send a text message;
  `--instance <name>`, `--number <phone>`, `--text <text>`; `data`
  `{ message }`; exit codes 4, 5 e 6; credencial `uazapi.admintoken`.
- Adiciona a tool `instances_list`: espelha `instances list`; efeito
  `network`.
- Adiciona a tool `messages_send`: espelha `messages send`; efeito
  `write`, pedida pela pessoa.
- Adiciona a setting `uazapi.baseUrl`: `string`, padrão
  `https://{subdomain}.uazapi.com`.
- Adiciona a credencial `uazapi.admintoken`: usada pelos commands e
  tools da uazapi; obtida no painel da uazapi.

## Tasks

- [ ] Setting `uazapi.baseUrl` e credencial `uazapi.admintoken` `#termfy-config`
- [ ] Client da uazapi com os headers `admintoken` e `token` `#termfy-api`
- [ ] Família `instances` e tool `instances_list` `#termfy-command-set`
- [ ] Command `messages send` e tool `messages_send` `#termfy-command-set`

## Tests

- [ ] `mycli instances list --json` devolve `{ count, instances[] }`
- [ ] `messages send` sem `uazapi.admintoken` sai com exit code 4
- [ ] `instances status --instance inexistente` sai com exit code 6

## Notes

- 2026-11-12: fonte `https://docs.uazapi.com/openapi-bundled.json`.
- 2026-11-12: o server tem a variável `{subdomain}`; a pessoa grava a
  URL real com `mycli config set uazapi.baseUrl`.
- 2026-11-12: conferir se `GET /instance/all` devolve o `token` de cada
  instância.
```

O trecho omite as entradas de `instances status` e `instances connect`,
que seguem o mesmo formato.

## Regras que a skill segue

- **Ler tudo antes de propor.** Com OpenAPI, o arquivo é a fonte. Com
  texto, a skill extrai a mesma lista e marca o incerto em `## Notes`, para
  a dúvida não virar código errado.
- **Agrupar por recurso, não por endpoint.** `GET /instance/all` e
  `GET /instance/status` viram `instances list` e `instances status`.
  Commands agrupados ficam juntos no `--help` e na família `recurso verbo`.
- **Começar pequeno.** Leituras (`list`, `show`) de todos os recursos
  relevantes e escritas só dos recursos que você citou. O resto fica no
  `## Goal` como fora desta evolução, uma linha por recurso.
- **Parâmetros viram options e arguments.** Query param vira option em
  kebab-case (`page_size` vira `--page-size`); path param vira argument
  obrigatório. Body com até cinco campos vira uma option por campo, como
  `--number` e `--text`; corpo maior vira `--input <file>`.
- **Autenticação vira credencial, base URL vira setting.** A credencial
  aponta a seção da documentação em "Como obter". A base URL vira
  `service.baseUrl` com `servers[0].url` como padrão. Exemplos de token da
  documentação ficam fora da spec, porque são valores de terceiros.
- **Exit codes por família.** Cada command recebe 4 (credencial) e 5 (rede
  ou API), mais 6 quando o endpoint devolve 404. Um 401 ou 403 causado por
  credencial também sai com 4.
- **Tools só de leitura por padrão.** Cada command de leitura vira uma
  tool em `snake_case` com efeito `network`. Escritas viram tool só quando
  você pede, com efeito `write` e descrição que avisa o efeito, porque um
  agente pode chamar a tool sem você olhar.
- **Paginação e rate limit no Design.** O esquema da API (cursor, página,
  cabeçalhos) fica registrado para a `termfy-api` implementar.
- **Proposta antes de gravar.** Você vê a tabela e escolhe o que entra.
  Nada vira código nesta etapa.
- **`CLISPEC.md` só no fechamento.** As entradas vivem na Surface da spec
  até ela ser fechada pelo ciclo da `termfy-spec`. Assim, a Surface do
  `CLISPEC.md` descreve só o que existe no código.

## O que ela entrega

A skill relata:

- a fonte lida;
- o número de recursos e endpoints encontrados;
- o ID e o caminho da spec;
- o que entrou na Surface e o que ficou fora;
- as dúvidas em `## Notes`;
- as skills seguintes.

Arquivos que mudam: `specs/NNNN-slug.md` e o índice `## Specs` do
`CLISPEC.md`. A cópia da documentação fica em `tmp/`, fora do Git.

## Próxima skill

Siga a sequência indicada pela skill: a `termfy-config` para a setting e
a credencial, a `termfy-api` para o client e a `termfy-command-set` para
cada recurso. Com todos os itens marcados, feche a spec com a
[termfy-spec](termfy-spec.md).
