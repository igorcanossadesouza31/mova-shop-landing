# Beluvi Pet — site da loja

Site de página única da **Beluvi Pet**: caminhas e Kit Passeio personalizados com o
nome do pet. HTML, CSS e JavaScript puros — não precisa instalar nada nem rodar build.

## Ver o site

Abra `index.html` no navegador. Para testar como se estivesse publicado:

```
npx http-server beluvi -p 8080
```

## Arquivos

| Arquivo | O que tem |
| --- | --- |
| `index.html` | Conteúdo, emblemas e os desenhos das peças (SVG feito à mão) |
| `style.css` | Cores da marca, tipografia, layout e animações |
| `script.js` | Personalizador do nome, patinhas flutuantes, faixa, dúvidas e formulário |
| `assets/` | Logo e fotos dos produtos |

## O que você precisa trocar antes de publicar

Tudo que é provisório está reunido no topo do `script.js`:

```js
var WHATSAPP  = '5511000000000';   // 55 + DDD + número, só dígitos
var INSTAGRAM = 'beluvipet';
```

Trocar o número ali já atualiza o botão flutuante, os links de contato, o rodapé
e o envio do formulário. O e-mail aparece no `index.html`, na seção `#pedido`
e no rodapé (`contato@beluvipet.com.br`).

## Como o personalizador funciona

O campo do topo grava o nome em todos os elementos `.p-nome` da página ao mesmo
tempo — a caminha do topo e as seis peças da seção "Tudo com o nome dele".

- Cada `<text class="p-nome">` traz um `data-base` com o tamanho de fonte em
  unidades do próprio SVG. O JavaScript reduz esse valor conforme o nome cresce,
  então nome comprido continua cabendo na peça.
- A cor vem de uma única variável CSS, `--peca-cor`. Todo o resto do desenho
  (tom claro, tom escuro, vivo, gravação) é derivado dela com `color-mix`, então
  trocar a cor repinta a peça inteira.
- A cor da linha do bordado troca sozinha: em tecido claro o nome sai escuro,
  em tecido escuro sai em creme.

### Acrescentar uma cor

Duplique um botão em `#cores-perso` no `index.html` e mude os dois valores:

```html
<button type="button" class="cor" style="--amostra:#93A38A" data-cor="#93A38A"
        aria-pressed="false"><span class="sr">Verde</span></button>
```

O texto dentro de `<span class="sr">` é o nome que aparece embaixo das bolinhas.

## Formulário

Hoje o botão "Enviar meu pedido" abre o WhatsApp com a mensagem já montada
(nome, peça, cor, porte e o recado). Para receber por e-mail, crie um formulário
no [Formspree](https://formspree.io) ou similar e:

1. No `index.html`, troque a abertura da tag por
   `<form action="https://formspree.io/f/SEU_ID" method="POST" class="formulario" id="formulario">`
2. No `script.js`, apague o bloco marcado com `ENVIO PELO WHATSAPP`.

## Fotos

As fotos em `assets/` saíram das artes da própria marca. Quando tiver fotos novas,
basta substituir os arquivos mantendo os mesmos nomes — o site continua funcionando.

## Acessibilidade e desempenho

- Navegação por teclado com foco visível, textos alternativos nas imagens e
  rótulos nos campos do formulário.
- Todas as animações param quando o visitante liga "reduzir movimento" no sistema.
- Responsivo de 390 px até telas largas, sem rolagem lateral.
