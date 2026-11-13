# Acessibilidade das cores

Este relatório foi calculado pela fórmula de contraste da WCAG 2.2 a partir
de `brand/colors/palette.json`. Uma aprovação numérica não substitui o teste
do componente, dos estados e do arquivo rasterizado.

| Modo | Uso | Primeiro plano | Fundo | Proporção | Mínimo | Resultado |
| --- | --- | --- | --- | ---: | ---: | --- |
| light | texto principal | `#001117` | `#FFFFFF` | 19.22:1 | 4.5:1 | Aprovado |
| light | texto principal em superfície | `#001117` | `#F2F8F9` | 17.91:1 | 4.5:1 | Aprovado |
| light | texto secundário | `#2D4C58` | `#FFFFFF` | 9.19:1 | 4.5:1 | Aprovado |
| light | acento usado como texto | `#4D7C0F` | `#FFFFFF` | 4.99:1 | 4.5:1 | Aprovado |
| light | acento em superfície | `#4D7C0F` | `#F2F8F9` | 4.65:1 | 4.5:1 | Aprovado |
| light | indicador de foco | `#15626A` | `#FFFFFF` | 7.03:1 | 3:1 | Aprovado |
| dark | texto principal | `#F2F8F9` | `#000A0E` | 18.64:1 | 4.5:1 | Aprovado |
| dark | texto principal em superfície | `#F2F8F9` | `#001117` | 17.91:1 | 4.5:1 | Aprovado |
| dark | texto secundário | `#B2C6CE` | `#000A0E` | 11.30:1 | 4.5:1 | Aprovado |
| dark | acento usado como texto | `#A3E635` | `#000A0E` | 13.27:1 | 4.5:1 | Aprovado |
| dark | acento em superfície | `#A3E635` | `#001117` | 12.75:1 | 4.5:1 | Aprovado |
| dark | indicador de foco | `#5EEDE1` | `#000A0E` | 13.98:1 | 3:1 | Aprovado |

O lima `#A3E635` sobre branco fica em 1.51:1. Não use o tom 500 em fundo
claro: lá o acento é o tom 600, `#4D7C0F`.
