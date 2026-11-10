# Configuração e credenciais

Tudo que o binário persiste fica em `~/.meucli/`:

| Arquivo | Conteúdo | Permissão |
| --- | --- | --- |
| `settings.json` | preferências em texto claro | 0600 |
| `credentials.json` | envelope AES-256-GCM com os segredos | 0600 |
| `master.key` | chave mestra em hexadecimal, criada na primeira gravação | 0600 |

A pasta nasce com 0700. `MEUCLI_HOME` troca a raiz, o que isola testes e CI.

## settings.json

Chaves em notação de ponto, com esquema tipado em `ESQUEMA_SETTINGS`
(`src/config/settings.ts`). O starter kit reconhece `saida.formato`,
`saida.cores`, `tui.abaInicial`, `tui.tema` e `telemetria.ativa`.

```bash
meucli config list
meucli config set saida.formato json
meucli config get tui.tema
meucli config unset telemetria.ativa
meucli config schema
```

`config set` converte o texto para o tipo declarado e recusa valores fora de
um `enum` com código 3. Chaves fora do esquema são aceitas como texto, para
dar espaço a extensões; para ganhar tipo, padrão e documentação, a chave
entra no esquema.

Segredos nunca entram em settings.json.

## credentials.json

O arquivo guarda um envelope:

```json
{ "versao": 1, "algoritmo": "aes-256-gcm", "iv": "...", "tag": "...", "dados": "..." }
```

`dados` é o JSON `{ "nome": "valor" }` cifrado. A tag de autenticação garante
que um arquivo editado ou cifrado com outra chave falhe ao decifrar, com
código 4.

```bash
meucli credentials set loja.token               # digita sem eco
printf '%s' "$TOKEN" | meucli credentials set loja.token --stdin
meucli credentials get loja.token               # mascarado
meucli credentials get loja.token --reveal
meucli credentials list
meucli credentials status
meucli credentials remove loja.token
```

O valor nunca passa por argumento de linha de comando. Em terminal, a
digitação é oculta; em pipe, vem pela primeira linha do stdin. Assim ele não
entra no histórico do shell nem na lista de processos.

Nomes seguem `servico.finalidade` em minúsculas: `loja.token`,
`openai.api_key`, `smtp.senha`.

## Chave mestra

32 bytes. Fonte, em ordem:

1. `MEUCLI_MASTER_KEY`, 64 caracteres hexadecimais (`openssl rand -hex 32`);
2. `~/.meucli/master.key`, gerado na primeira gravação.

Com a variável definida, o arquivo é ignorado. Em CI e em servidores, use a
variável e não grave a chave em disco.

## O que a cifra protege

Protege contra leitura casual do arquivo, cópia em backup ou sincronização de
pasta e varredura do disco por ferramentas que procuram tokens em texto
claro.

Não protege contra outro processo da mesma conta, que lê `master.key` e
decifra, nem contra quem tem root, nem contra a memória do processo enquanto
o valor está em uso. Para esses casos, injete a chave por variável a partir
de um gerenciador de segredos.

## Usar uma credencial no código

```ts
import { obterCredencial } from "../config/credenciais.ts";

const token = obterCredencial("loja.token"); // ErroApp(4) quando não existe
```

O valor não vai para log, erro, `dados` do `--json` sem `--reveal`, resposta
de tool MCP nem frame da TUI. `mascarar()` mantém quatro caracteres iniciais
e dois finais para exibição.

A skill `termfy-config` detalha o modelo de segurança e o passo a passo para
declarar chaves e consumir credenciais.
