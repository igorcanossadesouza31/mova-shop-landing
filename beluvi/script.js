/* =========================================================
   BELUVI PET — comportamento da página
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIGURAÇÃO — é só aqui que ficam os seus dados
     --------------------------------------------------------- */
  var WHATSAPP  = '5511911245639';              // 55 + DDD + número, só dígitos
  var EMAIL     = 'empresabeluvi@gmail.com';
  var INSTAGRAM = 'beluvipet';

  /* --- LOJA NA NUVEMSHOP ---
     Enquanto LOJA estiver vazio, os botões "Quero esta" continuam levando ao
     formulário de pedido aqui do site. Assim que você colar o endereço da sua
     loja abaixo, eles passam a abrir a Nuvemshop, onde ficam o carrinho e o
     pagamento — e o formulário vira só um caminho alternativo.

     LOJA: o endereço da sua loja, sem barra no final.
           Ex: 'https://beluvi.lojavirtualnuvem.com.br'

     PRODUTOS: o link de cada produto dentro da loja. Copie da barra de
           endereços ao abrir o produto na sua Nuvemshop e cole só o final.
           Ex: '/produtos/caminha-beluvi'
           Deixe '' no que ainda não tiver cadastrado — esse botão continua
           levando ao formulário, sem quebrar nada. */
  var LOJA = '';

  var PRODUTOS = {
    'Caminha Beluvi':              '',
    'Kit Passeio completo':        '',
    'Plaquinha de identificação':  '',
    'Porta-saquinho':              '',
    'Chaveiro do tutor':           '',
    'Porta-guia de parede':        '',
    'Almofada combinando':         '',
    'Bandana':                     ''
  };

  function linkDaLoja(produto) {
    if (!LOJA) return '';
    var caminho = PRODUTOS[produto];
    return caminho ? LOJA + caminho : LOJA;
  }

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
    a.href = 'https://wa.me/' + WHATSAPP;
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) {
    a.href = 'mailto:' + EMAIL;
    if (a.textContent.indexOf('@') > -1) a.textContent = EMAIL;
  });
  document.querySelectorAll('a[href^="https://instagram.com/"]').forEach(function (a) {
    a.href = 'https://instagram.com/' + INSTAGRAM;
  });

  if (LOJA) {
    document.querySelectorAll('.menu-cta, .banner-botoes .botao-ouro').forEach(function (a) {
      a.href = LOJA;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = a.classList.contains('menu-cta') ? 'Ir para a loja' : 'Comprar na loja';
    });
  }

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Menu no celular
     --------------------------------------------------------- */
  var menu = document.getElementById('menu');
  var menuBotao = document.getElementById('menu-botao');

  function fecharMenu() {
    menu.classList.remove('aberto');
    menuBotao.setAttribute('aria-expanded', 'false');
    menuBotao.querySelector('.sr').textContent = 'Abrir menu';
  }

  menuBotao.addEventListener('click', function () {
    var aberto = menu.classList.toggle('aberto');
    menuBotao.setAttribute('aria-expanded', String(aberto));
    menuBotao.querySelector('.sr').textContent = aberto ? 'Fechar menu' : 'Abrir menu';
  });

  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) fecharMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('aberto')) {
      fecharMenu();
      menuBotao.focus();
    }
  });

  /* ---------------------------------------------------------
     Topo grudado e botão do WhatsApp
     --------------------------------------------------------- */
  var topo = document.getElementById('topo');
  var zap = document.getElementById('zap');

  function aoRolar() {
    var y = window.scrollY;
    topo.classList.toggle('grudado', y > 14);
    zap.classList.toggle('visivel', y > 600);
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------------------------------------------------------
     Revelar ao rolar
     --------------------------------------------------------- */
  var revelaveis = document.querySelectorAll('.revelar');

  if (semMovimento || !('IntersectionObserver' in window)) {
    revelaveis.forEach(function (el) { el.classList.add('visivel'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        var el = entrada.target;
        var irmaos = Array.prototype.slice.call(el.parentNode.children);
        el.style.transitionDelay = Math.min(irmaos.indexOf(el), 5) * 95 + 'ms';
        el.classList.add('visivel');
        observador.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    revelaveis.forEach(function (el) { observador.observe(el); });
  }

  /* ---------------------------------------------------------
     Patinhas flutuando no fundo
     --------------------------------------------------------- */
  function semearPatinhas(caixa, quantidade) {
    if (!caixa || semMovimento) return;
    var fragmento = document.createDocumentFragment();
    for (var i = 0; i < quantidade; i++) {
      var tamanho = 16 + Math.random() * 40;
      var span = document.createElement('span');
      span.className = 'pata-solta';
      span.style.left = (2 + Math.random() * 84).toFixed(2) + '%';
      span.style.bottom = (-12 - Math.random() * 25).toFixed(1) + '%';
      span.style.width = tamanho.toFixed(0) + 'px';
      span.style.height = tamanho.toFixed(0) + 'px';
      span.style.setProperty('--giro', (Math.random() * 60 - 30).toFixed(0) + 'deg');
      span.style.setProperty('--tempo', (11 + Math.random() * 12).toFixed(1) + 's');
      span.style.setProperty('--espera', (-Math.random() * 16).toFixed(1) + 's');
      span.style.setProperty('--brilho', (0.08 + Math.random() * 0.18).toFixed(2));
      span.innerHTML = '<svg viewBox="0 0 64 64" width="' + tamanho.toFixed(0) +
                       '" height="' + tamanho.toFixed(0) + '"><use href="#e-patinha"></use></svg>';
      fragmento.appendChild(span);
    }
    caixa.appendChild(fragmento);
  }

  semearPatinhas(document.getElementById('patas-banner'), 20);
  semearPatinhas(document.getElementById('patas-produtos'), 14);

  /* ---------------------------------------------------------
     Faixa rolante com os emblemas
     --------------------------------------------------------- */
  var trilho = document.getElementById('faixa-trilho');

  if (trilho) {
    var recados = [
      ['Pets únicos, como o seu amor', 'e-patinha', '0 0 64 64'],
      ['Feito à mão em São Paulo', 'e-cao', '0 0 100 100'],
      ['O luxo de amar nos detalhes', 'e-gato', '0 0 100 100'],
      ['Enviamos para todo o Brasil', 'e-osso', '0 0 64 32'],
      ['Embalagem especial para presente', 'e-presente', '0 0 64 64'],
      ['Personalização sem custo extra', 'e-coracao', '0 0 64 60']
    ];
    var html = recados.map(function (r) {
      var grande = (r[1] === 'e-cao' || r[1] === 'e-gato') ? ' faixa-bicho' : '';
      return '<span class="faixa-item"><svg class="faixa-emblema' + grande + '" viewBox="' + r[2] +
             '"><use href="#' + r[1] + '"></use></svg>' + r[0] + '</span>';
    }).join('');
    trilho.innerHTML = html + html;   // duplicado para o laço ficar contínuo
  }

  /* ---------------------------------------------------------
     Abas
     --------------------------------------------------------- */
  var abas = Array.prototype.slice.call(document.querySelectorAll('.aba'));

  function abrirAba(aba, focar) {
    if (!aba) return;
    abas.forEach(function (outra) {
      var eEsta = outra === aba;
      outra.classList.toggle('ativo', eEsta);
      outra.setAttribute('aria-selected', String(eEsta));
      outra.tabIndex = eEsta ? 0 : -1;

      var painel = document.getElementById(outra.getAttribute('aria-controls'));
      painel.hidden = !eEsta;
      painel.classList.toggle('ativo', eEsta);
    });
    if (focar) aba.focus();
    // a sanfona precisa remedir depois que o painel aparece
    recalcularDuvidas();
  }

  abas.forEach(function (aba, i) {
    aba.addEventListener('click', function () { abrirAba(aba, false); });

    aba.addEventListener('keydown', function (e) {
      var destino = null;
      if (e.key === 'ArrowRight') destino = abas[(i + 1) % abas.length];
      else if (e.key === 'ArrowLeft') destino = abas[(i - 1 + abas.length) % abas.length];
      else if (e.key === 'Home') destino = abas[0];
      else if (e.key === 'End') destino = abas[abas.length - 1];
      if (destino) { e.preventDefault(); abrirAba(destino, true); }
    });
  });

  /* Links do menu, do banner e do rodapé que abrem uma aba direto */
  document.querySelectorAll('[data-aba]').forEach(function (link) {
    link.addEventListener('click', function () {
      abrirAba(document.getElementById(link.dataset.aba), false);
    });
  });

  /* ---------------------------------------------------------
     Dúvidas (sanfona)
     --------------------------------------------------------- */
  var botoesFaq = document.querySelectorAll('.faq-botao');

  function recalcularDuvidas() {
    document.querySelectorAll('.faq-botao[aria-expanded="true"]').forEach(function (botao) {
      var resposta = botao.parentNode.nextElementSibling;
      resposta.style.maxHeight = resposta.scrollHeight + 'px';
    });
  }

  botoesFaq.forEach(function (botao) {
    var resposta = botao.parentNode.nextElementSibling;

    botao.addEventListener('click', function () {
      var aberto = botao.getAttribute('aria-expanded') === 'true';

      botoesFaq.forEach(function (outro) {
        if (outro === botao) return;
        outro.setAttribute('aria-expanded', 'false');
        outro.parentNode.nextElementSibling.style.maxHeight = null;
      });

      botao.setAttribute('aria-expanded', String(!aberto));
      resposta.style.maxHeight = aberto ? null : resposta.scrollHeight + 'px';
    });
  });

  window.addEventListener('resize', recalcularDuvidas);

  /* ---------------------------------------------------------
     "Quero esta" leva a peça escolhida para o formulário
     --------------------------------------------------------- */
  var seletorProduto = document.getElementById('f-produto');

  document.querySelectorAll('[data-pedir]').forEach(function (gatilho) {
    gatilho.addEventListener('click', function () {
      var escolhido = gatilho.dataset.pedir;

      // com a loja configurada, o botão leva direto para a Nuvemshop
      var destino = linkDaLoja(escolhido);
      if (destino) {
        window.open(destino, '_blank', 'noopener');
        return;
      }

      if (seletorProduto) {
        Array.prototype.forEach.call(seletorProduto.options, function (op) {
          if (op.text === escolhido) seletorProduto.value = op.value;
        });
      }
      document.getElementById('pedido').scrollIntoView({
        behavior: semMovimento ? 'auto' : 'smooth', block: 'start'
      });
      window.setTimeout(function () {
        var primeiro = document.getElementById('f-nome');
        if (primeiro) primeiro.focus({ preventScroll: true });
      }, semMovimento ? 0 : 640);
    });
  });

  /* ---------------------------------------------------------
     Formulário
     --------------------------------------------------------- */
  var formulario = document.getElementById('formulario');
  var aviso = document.getElementById('form-aviso');

  function marcarErro(id, mensagem) {
    var campo = document.getElementById(id);
    var alvo = document.querySelector('[data-erro-de="' + id + '"]');
    campo.closest('.campo').classList.toggle('invalido', Boolean(mensagem));
    campo.setAttribute('aria-invalid', mensagem ? 'true' : 'false');
    if (alvo) alvo.textContent = mensagem || '';
    return !mensagem;
  }

  if (formulario) {
    formulario.addEventListener('submit', function (e) {
      e.preventDefault();

      var nome = document.getElementById('f-nome').value.trim();
      var zapNum = document.getElementById('f-zap').value.replace(/\D/g, '');
      var mensagem = document.getElementById('f-msg').value.trim();

      var ok = true;
      ok = marcarErro('f-nome', nome ? '' : 'Escreva o seu nome para a gente saber com quem falar.') && ok;
      ok = marcarErro('f-zap', zapNum.length >= 10 ? '' : 'Digite o WhatsApp com DDD, por exemplo (11) 90000-0000.') && ok;
      ok = marcarErro('f-msg', mensagem.length >= 10 ? '' : 'Conte um pouco mais — pelo menos uma frase sobre o seu pet.') && ok;

      if (!ok) {
        aviso.textContent = 'Faltou preencher alguma coisa. Veja os campos marcados acima.';
        aviso.style.color = '#A93147';
        formulario.querySelector('.campo.invalido input, .campo.invalido textarea').focus();
        return;
      }

      /* ===== ENVIO PELO WHATSAPP =====
         Bloco temporário: abre o WhatsApp com a mensagem pronta.
         Ao plugar um serviço de formulário, apague daqui até o fim do bloco. */
      var dados = new FormData(formulario);
      var linhas = [
        'Olá, Beluvi! Vim pelo site.',
        '',
        'Nome: ' + dados.get('nome'),
        'WhatsApp: ' + dados.get('whatsapp'),
        'Pet: ' + (dados.get('petnome') || 'não informei'),
        'Peça: ' + dados.get('produto'),
        'Cor: ' + dados.get('cor'),
        'Porte: ' + dados.get('porte'),
        '',
        dados.get('mensagem')
      ];

      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(linhas.join('\n')), '_blank', 'noopener');

      aviso.textContent = 'Abrimos o WhatsApp com o seu pedido pronto. É só enviar.';
      aviso.style.color = '';
      /* ===== fim do bloco do WhatsApp ===== */
    });

    ['f-nome', 'f-zap', 'f-msg'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        if (this.closest('.campo').classList.contains('invalido')) {
          marcarErro(id, '');
          aviso.textContent = '';
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Ano do rodapé
     --------------------------------------------------------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
