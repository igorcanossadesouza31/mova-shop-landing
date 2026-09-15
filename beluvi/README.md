# Beluvi Pet — site da loja

Site de página única da **Beluvi Pet**: caminhas e Kit Passeio personalizados com o
nome do pet. HTML, CSS e JavaScript puros — não precisa instalar nada nem rodar build.

## Ver o site

Abra `index.html` no navegador. Para testar como se estivesse publicado:

```
npx http-server beluvi -p 8080
```

## Como a página está organizada

1. **Banner** — foto grande da caminha ocupando a tela inteira, com a logo, a chamada
   e os dois botões. No celular a foto vira um bloco inteiro em cima do texto.
2. **Faixa rolante** — recados curtos com os emblemas de cachorro, gato, patinha, osso,
   coração e presente.
3. **Abas** — cinco abas que abrem um assunto de cada vez: Personalizar, A Caminha,
   Kit Passeio, Como funciona e Dúvidas.
4. **Produtos** — a linha inteira embaixo das abas, com foto, descrição e botão.
5. **Depoimentos**, **formulário de pedido** e **rodapé**.

Os links do menu e do rodapé já abrem a aba certa e rolam até ela.

## Arquivos

| Arquivo | O que tem |
| --- | --- |
| `index.html` | Conteúdo, emblemas e os desenhos das peças (SVG feito à mão) |
| `style.css` | Cores da marca, tipografia, layout e animações |
| `script.js` | Personalizador do nome, abas, patinhas flutuantes, dúvidas e formulário |
| `assets/` | Logo, banner e fotos dos produtos |

## O que trocar quando algo mudar

### Contato

Fica tudo no topo do `script.js`:

```js
var WHATSAPP  = '5511911245639';   // 55 + DDD + número, só dígitos
var EMAIL     = 'empresabeluvi@gmail.com';
var INSTAGRAM = 'beluvipet';
```

Trocar ali atualiza de uma vez o botão flutuante, os links de contato, o rodapé e o
envio do formulário.

### Preços

Hoje todo produto mostra "Sob consulta". Para colocar o valor, procure no `index.html`
por `produto-preco` e troque o texto:

```html
<p class="produto-preco">A partir de <b>R$ 289</b></p>
```

O `<b>` já sai grande e na fonte da marca.

### Fotos

Substitua os arquivos em `assets/` mantendo os mesmos nomes. O banner tem duas versões:
`banner-beluvi.jpg` (computador) e `banner-beluvi-celular.jpg` (celular, mais fechado
no produto).

## Como o personalizador funciona

O campo da aba "Personalizar" grava o nome em todos os elementos `.p-nome` da página ao
mesmo tempo — a caminha, as seis peças ilustradas e os cards de almofada e bandana lá
embaixo nos produtos.

- Cada `<text class="p-nome">` traz um `data-base` com o tamanho de fonte em unidades do
  próprio SVG. O JavaScript reduz esse valor conforme o nome cresce, então nome comprido
  continua cabendo na peça.
- A cor vem de uma única variável CSS, `--peca-cor`. O resto do desenho (tom claro, tom
  escuro, vivo, gravação) é derivado dela com `color-mix`, então trocar a cor repinta a
  peça inteira.
- A cor da linha do bordado troca sozinha: em tecido claro o nome sai escuro, em tecido
  escuro sai em creme.

### Acrescentar uma cor

Duplique um botão em `#cores-perso` no `index.html` e mude os dois valores:

```html
<button type="button" class="cor" style="--amostra:#93A38A" data-cor="#93A38A"
        aria-pressed="false"><span class="sr">Verde</span></button>
```

O texto dentro de `<span class="sr">` é o nome que aparece embaixo das bolinhas.

## Formulário

Hoje o botão "Enviar meu pedido" abre o WhatsApp com a mensagem já montada (nome, peça,
cor, porte e o recado). Para receber por e-mail, crie um formulário no
[Formspree](https://formspree.io) ou similar e:

1. No `index.html`, troque a abertura da tag por
   `<form action="https://formspree.io/f/SEU_ID" method="POST" class="formulario" id="formulario">`
2. No `script.js`, apague o bloco marcado com `ENVIO PELO WHATSAPP`.

## Acessibilidade e desempenho

- Abas com papéis ARIA e navegação por setas do teclado, foco visível, textos
  alternativos nas imagens e rótulos em todos os campos.
- Todas as animações param quando o visitante liga "reduzir movimento" no sistema.
- Responsivo de 390 px até telas largas, sem rolagem lateral.
