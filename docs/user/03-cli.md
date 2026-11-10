# CLI

## Registro declarativo

Cada comando é um objeto `Comando` em `src/cli/comandos/<nome>.ts`:

```ts
export const comandoPedidos: Comando = {
  nome: "pedidos",
  descricao: "Consulta pedidos da loja.",
  subcomandos: [listar, ver],
  codigosSaida: [CodigoSaida.CREDENCIAIS, CodigoSaida.REDE_OU_API],
};
```

O registro descreve nome, aliases, argumentos, opções, subcomandos, exemplos,
códigos de saída e a função `executar`. Quatro consumidores leem o mesmo
objeto:

| Consumidor | Arquivo | Saída |
| --- | --- | --- |
| parser | `src/cli/parser.ts` | argumentos e opções validados |
| ajuda | `src/cli/ajuda.ts` | `--help` da raiz e de cada comando |
| OpenCLI | `src/cli/opencli.ts` | `--opencli` e `docs/opencli.json` |
| documentação | `src/skill/index.ts` | referência gerada no `--skill cli` |

Uma opção sem `descricao` não existe para o parser, então ela não pode ficar
sem documentação.

## Argumentos e opções

- `--chave valor` e `--chave=valor` são equivalentes.
- Aliases curtos (`-h`, `-V`, `-y`) existem, mas não se agrupam.
- `--` encerra as opções; o que vem depois é argumento.
- Opções globais (`--help`, `--version`, `--json`, `--skill`, `--opencli`,
  `--no-color`) valem em qualquer posição.
- Valores fora da lista `valores`, argumentos obrigatórios ausentes e opções
  desconhecidas encerram com código 2 e uma mensagem que aponta o `--help`.

## O contrato de `executar`

```ts
executar: async (ctx) => {
  const token = obterCredencial("loja.token");      // sai com 4 se faltar
  const pedidos = await buscar(token, ctx.args[0]);  // lança erro.rede() em falha
  return {
    dados: { quantidade: pedidos.length, pedidos },
    texto: () => tabela(pedidos.map((p) => [p.id, p.status])),
  };
},
```

`dados` é o que sai em `--json`; `texto` é o que sai para pessoas. A camada
de entrada decide qual usar. O comando nunca chama `process.exit` nem monta
JSON à mão: ele devolve dados e lança `ErroApp` quando algo previsto falha.

## Saída em texto e em JSON

Em texto, dados vão para stdout e erros para stderr, em uma linha com o
código e o nome entre colchetes:

```text
erro Credencial "loja.token" não encontrada. Grave com: credentials set loja.token [4 CREDENCIAIS]
```

Em JSON, tudo vai para stdout:

```json
{ "ok": false, "comando": "meucli pedidos listar", "erro": { "codigo": 4, "nome": "CREDENCIAIS", "mensagem": "..." } }
```

`saida.formato = json` em settings.json torna o JSON padrão. `--json` sempre
vence.

## Códigos de saída

| Código | Nome | Quando |
| --- | --- | --- |
| 0 | `SUCESSO` | operação concluída |
| 1 | `ERRO_GENERICO` | falha inesperada |
| 2 | `USO_INVALIDO` | argumentos ou opções inválidos; binário sem argumentos fora de TTY |
| 3 | `CONFIGURACAO` | settings.json ausente, inválido ou chave desconhecida |
| 4 | `CREDENCIAIS` | cofre ilegível, chave mestra ausente ou credencial não encontrada |
| 5 | `REDE_OU_API` | rede ou resposta de API fora do esperado |
| 6 | `NAO_ENCONTRADO` | recurso inexistente |
| 7 | `PERMISSAO` | permissão negada no sistema de arquivos |
| 8 | `TERMINAL_INDISPONIVEL` | TUI sem TTY |
| 9 | `MCP` | servidor MCP falhou ou perdeu o transporte |
| 130 | `INTERROMPIDO` | cancelado pelo usuário |

A fonte é `src/app/saida.ts`. Uma família nova entra lá e em
`src/app/erros.ts`, com um atalho `erro.<familia>()`. Números não se
reutilizam.

## OpenCLI

A OpenCLI Specification descreve a interface de um CLI em JSON para que
pessoas e máquinas saibam invocá-lo sem ler o código. `meucli --opencli`
gera o documento a partir do registro; `bun run opencli` grava
`docs/opencli.json`; `bun run opencli:check` falha quando o arquivo diverge
do registro. Um agente pode preferir esse JSON ao `--help`: nomes, aliases,
valores aceitos e códigos de saída vêm sem formatação para interpretar.

## Adicionar um comando

1. Copie `template/comando/exemplo.ts` para `src/cli/comandos/<nome>.ts`.
2. Preencha a definição e implemente `executar`.
3. Registre em `src/cli/comandos.ts`.
4. Escreva o teste em `tests/cli.test.ts`, que roda o binário em subprocesso
   e confere stdout, stderr e código de saída.
5. Rode `bun run opencli` e `bun run validar`.
6. Se o comando trouxer conceito novo, escreva um parágrafo em `docs/cli.md`.

A skill `termfy-cli` percorre esses passos com o agente.
