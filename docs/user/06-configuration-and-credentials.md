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
`output.colors`, `tui.initialTab`, `tui.theme`, `tui.icons`, `tui.motion`,
`tui.mouse` e `telemetry.enabled`.

`tui.initialTab` aceita `overview` (padrão), `settings`, `credentials`,
`docs` ou `about`.

`tui.theme` aceita `terminal` (padrão), `night` ou `day`. O `terminal` herda
as cores do tema do terminal. `night` e `day` são paletas fixas em RGB.

`tui.icons` aceita `auto` (padrão), `nerd`, `unicode` ou `ascii`. O `auto`
usa `nerd` no Ghostty, no Kitty, no WezTerm e no Omarchy, `ascii` no console
Linux e `unicode` nos demais terminais. `tui.mouse` é boolean, com `true`
padrão; `false` devolve a seleção de texto ao terminal. `tui.motion` também
é boolean, com `true` padrão; `false` desliga as animações curtas de
diálogos e toasts.

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

## Editar pela TUI

A aba **Settings** mostra uma tabela com key, valor e padrão e um painel com
a descrição, o tipo e os valores aceitos. `Enter` ou `e` edita a key
selecionada pelo controle do tipo: `enum` abre o diálogo de escolha,
boolean alterna entre os dois valores e texto ou número abre um campo com
validação. `x` ou `Delete` volta ao padrão depois de uma confirmação. `r`
recarrega.

A gravação é a mesma de `config set` e `config unset`. Uma key `tui.*` vale
na próxima abertura da TUI; a tela avisa no toast. `tui.motion` e
`tui.theme` seguem a mesma regra.

A aba **Credentials** lista só os nomes do cofre. Os valores ficam fora da
tela. O painel ao lado mostra o arquivo, a origem da master key e o total
de credenciais. `a` adiciona um nome e depois o valor secreto. `Enter` ou `e` troca o valor. `d` ou
`Delete` remove com confirmação. `r` recarrega. O valor digitado não entra
no frame, no toast nem no resumo da barra.

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
