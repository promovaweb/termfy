# Paleta do Termfy

| Família | Base | Papel |
| --- | --- | --- |
| Petróleo | `#00161E` | estrutura, texto e superfícies escuras |
| Turquesa | `#2AD5BE` | janela do terminal e vínculo com a Promovaweb |
| Lima | `#A3E635` | conector do servidor MCP e destaque do produto |

A escala `accent` deriva da escala `lime` do Tailwind CSS. O tom 500,
`#A3E635`, é o lima do logo sobre fundo escuro. O tom 600, `#4D7C0F`, é o
tom escuro do logo para fundo claro; ele ocupa a posição 600 para manter o
par do logo na escala, então o salto entre 500 e 600 é maior que entre os
demais tons. Os tons 50 a 300 e 700 a 950 seguem a escala do Tailwind; 400 e
900 são intermediários calculados.

No light mode, use acento textual `#4D7C0F`. No dark mode, use `#A3E635`.
A escala completa e os estados ficam em `palette.json`; os pares aprovados
ficam em `../accessibility.md`.
