# Marca Termfy

O Termfy é o framework de skills da Promovaweb para construir binários de
terminal em Bun com três modos no mesmo executável: TUI para pessoas, CLI
com saída em texto ou `--json` para scripts e agentes, e servidor MCP via
stdio para agentes de IA. Sua identidade combina o petróleo e o turquesa da
Promovaweb com lima, cor própria do conector que liga o binário aos agentes.

## Conceito visual

O símbolo é um **terminal com conector**: uma janela de terminal com o
prompt e um conector lima na lateral. A janela e o prompt representam a TUI
e a CLI. O conector representa o servidor MCP, o canal pelo qual o mesmo
binário também conversa com agentes.

## Arquivos oficiais

| Arquivo | Uso |
| --- | --- |
| `logo/icon.svg` | ícone principal com placa petróleo |
| `logo/icon-light.svg` | ícone transparente sobre fundo claro |
| `logo/icon-dark.svg` | ícone transparente sobre fundo escuro |
| `logo/logo-light.svg` | assinatura horizontal sobre fundo claro |
| `logo/logo-dark.svg` | assinatura horizontal sobre fundo escuro |
| `logo/icon.png` | fallback raster de 512 × 512 px |
| `logo/logo-light.png`, `logo/logo-dark.png` | assinatura raster de 1300 × 508 px |
| `logo/icon-16w.png` a `logo/icon-512w.png` | favicons e ícones de aplicativo |

Use a variante correspondente ao fundo. Preserve 12,5% de área livre ao redor
do ativo. O tamanho mínimo é 24 px para o ícone e 140 px para a assinatura.
O nome na assinatura já está convertido em curvas (Manrope 750). Dimensões e
hashes de cada arquivo ficam em `manifest.json`.

## Sistema digital

- `colors/palette.json`: fonte editável da paleta;
- `tokens.json`: tokens agnósticos;
- `global.css`: webfontes, variáveis CSS e troca de tema;
- `tailwind-theme.js`: extensão para Tailwind CSS;
- `accessibility.md`: relatório de contraste;
- `typography/README.md`: hierarquia tipográfica;
- `fonts/`: Inter e Manrope latinas, com as licenças OFL;
- `style-guide.html`: guia visual de consulta rápida.

## Regras para agentes

1. Use os ativos desta pasta sem redesenhá-los.
2. Lima indica o conector, a integração com agentes e o destaque de ação;
   turquesa identifica a família.
3. Em fundo claro, o lima é `#4D7C0F`; o tom `#A3E635` só aparece em fundo
   escuro.
4. Estado nunca depende apenas de cor: inclua texto, ícone ou posição.
5. Use tokens semânticos e a variante correta para light ou dark mode.
6. Não aplique filtros, gradientes, sombras, rotações ou deformações.
