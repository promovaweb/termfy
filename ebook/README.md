# Ebook do framework

`Termfy-Guia-do-Framework-v<versão>.pdf` e `.epub` são gerados a partir de
`docs/user/`, na ordem de `docs/user/reading-order.txt`, por
`bun run ebook`. Os aliases `ebook-termfy.pdf` e `ebook-termfy.epub` apontam
para a edição vigente e `build.json` registra versão, hashes e fontes.

A versão do ebook vive em `VERSION` e avança quando o conteúdo de `docs/user/`
muda de forma relevante; ela é independente da versão do pacote.

`bun run ebook:verify` confere versão, hashes, XML do EPUB, links internos,
seções obrigatórias e fontes incorporadas sem gerar nada. Requer Pandoc,
WeasyPrint, ImageMagick, xmllint, poppler-utils e unzip.
