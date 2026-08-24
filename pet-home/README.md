# Pet Home — site da loja

Site de página única para a Pet Home: caminhas e comedouros personalizados para cachorro.
HTML, CSS e JavaScript puros — não precisa instalar nada nem rodar build.

## Ver o site

Abra `index.html` no navegador. Para testar como se estivesse publicado:

```
npx http-server pet-home -p 8080
```

## Arquivos

| Arquivo | O que tem |
| --- | --- |
| `index.html` | Conteúdo e os desenhos das peças (todos em SVG, feitos à mão) |
| `style.css` | Cores, tipografia, layout e animações |
| `script.js` | Personalizador, abas, sanfona de dúvidas e formulário |

## O que trocar antes de publicar

1. **WhatsApp e e-mail** — no topo de `script.js`:

   ```js
   var WHATSAPP = '5500000000000';              // 55 + DDD + número
   var EMAIL_PEDIDOS = 'contato@pethome.com.br';
   ```

   O número já é aplicado em todos os links (botão flutuante, contato, rodapé).
   O e-mail aparece escrito na seção de contato e no rodapé do `index.html` —
   troque nos dois lugares também.

2. **Instagram** — procure por `instagram.com` no `index.html`.

3. **Preços** — estão nos cards da seção "Exemplos", dentro de `<p class="preco">`.
   Os valores atuais são exemplos.

4. **Receber os pedidos por e-mail** — hoje o formulário abre o aplicativo de
   e-mail do visitante com a mensagem pronta (`mailto:`). Para os pedidos caírem
   direto na sua caixa de entrada, siga o comentário logo acima do `<form>` no
   `index.html`: basta criar um formulário no Formspree (ou serviço parecido),
   colocar `action` e `method` no `<form>` e apagar o bloco marcado como
   "ENVIO VIA MAILTO" no `script.js`.

## Como mexer no catálogo

Cada produto é um `<article class="produto">` dentro de um dos três painéis
(`#painel-caminhas`, `#painel-comedouros`, `#painel-kits`).

- O desenho é um `<svg>` que se colore sozinho: a cor vem da variável
  `--produto-cor` declarada no `style` do `<article>`, e as bolinhas de cor do
  card trocam essa variável. Para acrescentar uma cor nova, copie um `<button
  class="cor">` e mude o `data-cor` e o `--amostra`.
- Se mudar o desenho de uma peça, ajuste também o `viewBox` do `<svg>` para
  ficar colado no contorno novo — é isso que mantém todas as peças no mesmo
  tamanho aparente entre os cards.
- Ao criar um produto novo, adicione o nome dele na lista `<select id="f-produto">`
  do formulário e no `data-pedir` do botão "Quero este".

## Tamanhos e conteúdo

A tabela de tamanhos, os materiais, os depoimentos e as perguntas frequentes
são texto comum no `index.html` — pode editar direto. Os depoimentos são
exemplos e devem ser trocados por depoimentos reais antes de publicar.

## Detalhes técnicos

- Fontes: Baloo 2, Nunito Sans e DM Mono, carregadas do Google Fonts.
- Responsivo de 320 px até telas largas; menu vira sanfona abaixo de 860 px.
- Respeita `prefers-reduced-motion`: quem tiver animações desligadas no sistema
  vê o site inteiro parado, sem perder conteúdo.
- Navegável por teclado, com foco visível e as abas operando por setas.
