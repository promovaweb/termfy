# Plano do guia didático

Registro interno das escolhas editoriais da reescrita de `docs/user/`. Não
entra no ebook nem no site.

## Escolhas confirmadas pelo Luiz (2026-11-11 e 2026-11-12)

| Checkpoint | Escolha | Rejeitadas |
| --- | --- | --- |
| Recorte | documentação abrangente do Termfy (skills, CLI, TUI, MCP, configuração, ciclo), com exemplos no texto do ebook | só tutorial narrativo; só referência exaustiva |
| Exemplos | trechos no próprio texto, com o `mycli` (pedidos de uma loja) e a uazapi no capítulo de integração | projetos de exemplo construídos à parte (`notes` e cliente uazapi), rejeitados em 2026-11-12 |
| Arquitetura | três partes (Fundamentos, Construir, Referência) e uma página por skill | skills agrupadas por etapa numa página só |
| Tom | professor ao lado: `você`, presente, imperativo nos passos; o porquê de cada regra em uma frase | manual técnico impessoal; narrativa com personagem |
| Exemplo da uazapi | só o `admintoken` no cofre; `--instance <nome>` resolve o token da instância em memória por `GET /instance/all`; MCP só leitura | token de cada instância no cofre |

Alcance: estas escolhas valem para este guia.

## Fatos da uazapi usados no exemplo

Fonte: `https://docs.uazapi.com/openapi-bundled.json` (uazapiGO 2.6.9),
consultada em 2026-11-11.

- Servidor: `https://{subdomain}.uazapi.com`.
- Header `admintoken`: cria e lista instâncias (`GET /instance/all`, que
  devolve `name` e `token` de cada instância).
- Header `token`: opera uma instância (`GET /instance/status`,
  `POST /instance/connect`, `POST /send/text`).
- `POST /send/text` exige `number` e `text`.

## Saídas

As saídas do esqueleto vêm do starter kit em execução, com o nome `mycli`.
Nos capítulos da Parte 2, as saídas dos commands novos ilustram o
comportamento descrito na spec; a abertura do guia avisa o leitor.
