# Configuração e credenciais

Tudo que o binário persiste fica em `~/.mycli/`:

| Arquivo | Conteúdo | Permissão |
| --- | --- | --- |
| `settings.json` | preferências em texto claro | 0600 |
| `credentials.json` | envelope AES-256-GCM com os segredos | 0600 |
| `master.key` | chave mestra em hexadecimal, criada na primeira gravação | 0600 |

A pasta é criada com 0700. `MYCLI_HOME` troca a raiz, o que isola testes e CI.

## settings.json

Chaves em notação de ponto, com esquema tipado em `SETTINGS_SCHEMA`
(`src/config/settings.ts`). O starter kit reconhece `output.format`,
`output.colors`, `tui.initialTab`, `tui.theme` e `telemetry.enabled`.

`tui.theme` aceita `terminal` (padrão), `night` ou `day`. O `terminal` herda
as cores do tema do terminal. `night` e `day` são paletas fixas em RGB.

```bash
mycli config list
mycli config set output.format json
mycli config get tui.theme
mycli config unset telemetry.enabled
mycli config schema
```

`config set` converte o texto para o tipo declarado e recusa valores fora de
um `enum` com código 3. Chaves fora do esquema são aceitas como texto, para
dar espaço a extensões; para ganhar tipo, padrão e documentação, a chave
entra no esquema.

Segredos ficam fora do settings.json: o lugar deles é o cofre.

## credentials.json

O arquivo guarda um envelope:

```json
{ "version": 1, "algorithm": "aes-256-gcm", "iv": "...", "tag": "...", "data": "..." }
```

`data` é o JSON `{ "name": "value" }` cifrado. A tag de autenticação garante
que um arquivo editado ou cifrado com outra chave falhe ao decifrar, com
código 4.

```bash
mycli credentials set shop.token               # digita sem eco
printf '%s' "$TOKEN" | mycli credentials set shop.token --stdin
mycli credentials get shop.token               # mascarado
mycli credentials get shop.token --reveal
mycli credentials list
mycli credentials status
mycli credentials remove shop.token
```

O valor não passa por argumento de linha de comando. Em terminal, a
digitação é oculta; em pipe, vem pela primeira linha do stdin. Assim ele não
entra no histórico do shell nem na lista de processos.

Nomes seguem `service.purpose` em minúsculas: `shop.token`,
`openai.api_key`, `smtp.password`.

## Chave mestra

32 bytes. Fonte, em ordem:

1. `MYCLI_MASTER_KEY`, 64 caracteres hexadecimais (`openssl rand -hex 32`);
2. `~/.mycli/master.key`, gerado na primeira gravação.

Com a variável definida, o arquivo é ignorado. Em CI e em servidores, use a
variável quando não quiser criar uma chave em disco. A rotação é uma
exceção: `mycli credentials rotate-key` exige um cofre existente, gera
uma chave aleatória e a grava em `master.key` com 0600. Depois, remova
a variável antiga do shell, se estava definida.

Com `--from-env`, a chave antiga vem de `master.key` e a nova vem de
`MYCLI_MASTER_KEY`. A nova chave também é gravada em disco. Os dois modos
recifram o cofre; não execute gravações concorrentes durante a rotação.

## O que a cifra protege

Protege contra leitura casual do arquivo, cópia em backup ou sincronização de
pasta e varredura do disco por ferramentas que procuram tokens em texto
claro.

Não protege contra outro processo do mesmo usuário do sistema, que lê
`master.key` e decifra, nem contra um usuário root, nem contra a memória do processo enquanto
o valor está em uso. Para esses casos, injete a chave por variável a partir
de um gerenciador de segredos.

## Usar uma credencial no código

```ts
import { getCredential } from "../config/credentials.ts";

const token = getCredential("shop.token"); // Throws AppError with code 4 when missing
```

O valor não vai para log, erro, `data` do `--json` sem `--reveal`, resposta
de tool MCP nem frame da TUI. `mask(value)` mascara tudo até oito caracteres;
para valores maiores, mantém quatro iniciais e dois finais.

A skill `termfy-config` detalha o modelo de segurança e o passo a passo para
declarar chaves e consumir credenciais.
