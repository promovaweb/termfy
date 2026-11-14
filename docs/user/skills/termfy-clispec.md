# termfy-clispec

A skill `termfy-clispec` entrevista você para entender o que o binário
precisa fazer e escreve o `CLISPEC.md`, a visão macro única do binário, em
Markdown puro na raiz do repositório. O arquivo guarda a identidade, o
propósito, os públicos e seus modos, o que fica fora do escopo, a
superfície já entregue e o índice das specs. No fim, você tem o
`CLISPEC.md` escrito e os arquivos das specs iniciais criados em `specs/`
como `draft`, prontos para a [termfy-spec](termfy-spec.md).

## Quando usar

Use a `termfy-clispec` nestas situações:

- O projeto acabou de passar pela [termfy-init](termfy-init.md) e ainda
  não tem `CLISPEC.md`. O starter kit não traz esse arquivo.
- O propósito do `mycli` mudou: além de consultar pedidos, ele passa a
  atender os operadores da expedição.
- Um público novo chegou, como um agente que vai operar o binário pelo MCP.
- Um limite mudou: algo que estava fora do escopo passa a entrar.
- Você quer uma visão geral escrita do que o binário é.

Prefira outra skill nestes casos:

- Detalhar uma evolução (um command novo, uma screen, uma tool): use a
  [termfy-spec](termfy-spec.md). O `CLISPEC.md` não planeja trabalho.
- Trocar nome, título ou descrição: use a [termfy-brand](termfy-brand.md).
- Partir da documentação de uma API: escreva o `CLISPEC.md` aqui primeiro e
  depois use a [termfy-api-import](termfy-api-import.md).

## Como pedir

Para o primeiro `CLISPEC.md`, logo depois do setup:

> Use a skill termfy-clispec para descrever o mycli: ele lista os pedidos
> da loja, mostra o detalhe de um pedido e avisa quando chega um novo. Eu
> uso no terminal e o CI exporta os pedidos do dia.

Para registrar um público novo:

> Use a skill termfy-clispec para incluir no mycli um agente que responde
> perguntas sobre pedidos pelo MCP.

Para revisar os limites:

> Use a skill termfy-clispec para tirar do escopo do mycli o suporte a
> várias lojas e registrar o motivo.

## O que a skill faz

1. Lê o estado de partida com `git status --short`, o `CLISPEC.md` (quando
   existe) e os arquivos de `specs/`.
2. Conduz a entrevista em cinco blocos, nesta ordem:
   - **Problema:** que tarefa você faz hoje sem o binário e o que dá
     trabalho nela.
   - **Públicos e modos:** a pessoa que digita, o script ou CI que chama o
     binário, o agente que opera pelo MCP.
   - **Capacidades:** o que o binário precisa saber fazer, em verbos.
     A skill pergunta qual delas entra primeiro.
   - **Integrações e armazenamento:** serviços externos, credenciais,
     preferências ajustáveis e, só se as capacidades sugerirem, histórico
     guardado entre execuções.
   - **Limites:** o que o binário não faz, mesmo parecendo próximo.
3. A cada bloco respondido, escreve a seção correspondente e mostra o
   trecho para você.
4. Preenche `## Surface` com o que o esqueleto já entrega, lido do código:
   `bun run dev -- --opencli` para os commands, `src/tui/screens/index.ts`
   para as screens, `bun run dev -- mcp --list` para tools, resources e
   prompts, `SETTINGS_SCHEMA` para as keys e as chamadas a
   `getCredential()` para as credenciais.
5. Monta com você a lista de specs iniciais, uma por capacidade
   entregável, na ordem de entrega. Para cada spec aprovada, grava
   `specs/NNNN-slug.md` com o próximo número livre e `Status: draft`.
   Depois, acrescenta a linha ao índice `## Specs`.
6. Faz a conferência manual: seções na ordem, identidade igual ao
   `package.json` e uma linha do índice por arquivo de `specs/`, com título
   e status iguais aos da spec.
7. Indica a [termfy-spec](termfy-spec.md) para detalhar a primeira spec.

## Exemplo

O `CLISPEC.md` do `mycli` logo depois da entrevista. A Surface traz só o
que o esqueleto já entrega; os pedidos chegam a ela quando as specs forem
fechadas.

```markdown
# My CLI

`mycli`: Query shop orders from the terminal.

## Purpose

A pessoa que opera a loja consulta pedidos abrindo o painel web várias
vezes por dia. O binário traz pedidos, status e exportação para o terminal
e para o CI, usando a API da loja com um token guardado no cofre. Ele não
guarda pedidos localmente.

## Audiences

| Público | Modo | Necessidade |
| --- | --- | --- |
| operador da loja | TUI e CLI texto | ver pedidos abertos e o status de cada um |
| CI | CLI `--json` | exportar os pedidos do dia |
| agente | MCP | responder perguntas sobre pedidos |

## Out of scope

- Criar, editar ou cancelar pedidos: o binário só lê.
- Várias lojas na mesma instalação.

## Surface

### Commands

| Command | Função | Options | `data` no `--json` | Exit codes | Credenciais |
| --- | --- | --- | --- | --- | --- |
| `tui` | Open the terminal interface. | `--tab <overview\|about>` | | 8 | |
| `about` | Show version, executable, runtime and credits. | | `{ bin, title, version, ... }` | | |
| `config set` | Write a value to settings.json. | | | 3, 6, 7 | |
| `credentials set` | Save or replace a credential. | `--stdin` | | 4, 7, 130 | |
| `mcp` | Start the MCP server over stdio. | `--list` | | 9 | |

### Screens

| Screen | Função | Teclas |
| --- | --- | --- |
| `overview` | visão geral do binário | `←` `→`, `q` |
| `about` | identidade, versão e créditos | `←` `→`, `q` |

### MCP

| Tipo | Nome | Função | Efeito |
| --- | --- | --- | --- |
| tool | `about` | identidade e runtime | `read` |
| tool | `config_get` | valor de uma key | `read` |
| resource | `mycli://exit-codes` | tabela de exit codes | `read` |
| prompt | `operate` | guia o agente pela CLI | |

### Settings

| Key | Tipo | Padrão | Função |
| --- | --- | --- | --- |
| `output.format` | `enum` (`text`, `json`) | `text` | formato padrão da saída |
| `tui.theme` | `enum` (`night`, `day`) | `night` | paleta da TUI |

## Specs

| ID | Título | Status |
| --- | --- | --- |
| 0001 | Cliente da API da loja | draft |
| 0002 | Listar pedidos | draft |
| 0003 | Exportar pedidos | draft |

## Notes

- 2026-11-12: visão macro registrada em entrevista.
- 2026-11-12: dúvida aberta: a API da loja pagina por cursor ou por página?
```

O exemplo mostra parte das linhas do esqueleto para caber na página. No
seu projeto, a Surface lista cada command, screen, tool, resource, prompt
e key que o código registra.

## Regras que a skill segue

- **Entrevista antes de escrever.** Uma seção sem resposta vira pergunta
  ou nota datada em `## Notes`. Suposição escrita como fato engana as
  skills que vêm depois.
- **Blocos curtos.** Poucas perguntas por vez, confirmação em uma frase e
  até três caminhos por escolha aberta, com o recomendado primeiro e espaço
  para resposta livre. Quando a sua frase já responde um bloco, a skill
  confirma o que entendeu em vez de perguntar de novo.
- **Seções fixas, nesta ordem.** `## Purpose`, `## Audiences`,
  `## Out of scope`, `## Surface`, `## Specs` e `## Notes`, com Notes
  presente mesmo vazia. A ordem fixa facilita a conferência manual.
- **Sem tarefas no `CLISPEC.md`.** Checklist, `## Tasks` e testes ficam
  nas specs. O `CLISPEC.md` descreve o binário, não o trabalho pendente.
- **Surface descreve o entregue.** Ela muda quando uma spec é fechada, pela
  aplicação da Surface da spec às tabelas. Assim, cada linha corresponde a
  algo que existe no código.
- **Código antigo entra por uma spec de adoção.** Para registrar algo que
  já existe sem spec, a skill cria uma spec que lista esse código na
  Surface e a fecha. O histórico fica na spec.
- **Identidade vem do `package.json`.** A linha abaixo do título traz o
  `bin` e a `description`. Para mudar a identidade, a skill encaminha para
  a `termfy-brand`.
- **Armazenamento local só quando você pede.** O padrão é guardar só
  settings e credenciais. Se você precisa de histórico, a skill anota em
  `## Purpose` o que é guardado e indica a `termfy-database` na spec que
  criar as tabelas.
- **Prosa no seu idioma, nomes em inglês.** Commands, keys, tools e
  screens aparecem como no código, porque é por esses nomes que a
  conferência acontece.
- **Specs iniciais pequenas.** Cada uma entrega algo testável com um
  comando, cabe em um ciclo de implementação e depende só das anteriores
  da lista. Slugs em kebab-case e em inglês (`shop-client`,
  `orders-list`); títulos no seu idioma.

## O que ela entrega

A skill relata:

- o caminho do `CLISPEC.md`;
- os públicos e os modos registrados;
- as specs criadas, com número e título;
- as dúvidas abertas em `## Notes`;
- o resultado da conferência manual;
- a spec sugerida para a `termfy-spec`.

Arquivos que mudam: `CLISPEC.md` e os arquivos novos de `specs/`, como
`specs/0001-shop-client.md`, `specs/0002-orders-list.md` e
`specs/0003-orders-export.md`. O código não muda nesta etapa.

## Próxima skill

Siga para a [termfy-spec](termfy-spec.md) com a primeira spec da lista.
Quando o ponto de partida é a documentação de uma API, use a
[termfy-api-import](termfy-api-import.md) no lugar.
