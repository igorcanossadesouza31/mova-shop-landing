/* =========================================================
   PET HOME — comportamento da página
   ========================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     CONFIGURAÇÃO — troque estes dois valores pelos seus
     --------------------------------------------------------- */
  var WHATSAPP = '5500000000000';              // formato: 55 + DDD + número
  var EMAIL_PEDIDOS = 'contato@pethome.com.br';

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (a) {
    a.href = 'https://wa.me/' + WHATSAPP;
  });

  var semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Menu mobile
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
     Topo grudado + botão do WhatsApp
     --------------------------------------------------------- */
  var topo = document.getElementById('topo');
  var zap = document.getElementById('zap');

  function aoRolar() {
    var y = window.scrollY;
    topo.classList.toggle('grudado', y > 12);
    zap.classList.toggle('visivel', y > 520);
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* ---------------------------------------------------------
     Revelar seções ao rolar
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
        var atraso = Math.min(irmaos.indexOf(el), 5) * 90;
        el.style.transitionDelay = atraso + 'ms';
        el.classList.add('visivel');
        observador.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revelaveis.forEach(function (el) { observador.observe(el); });
  }

  /* ---------------------------------------------------------
     Personalizador: nome do pet nas peças
     --------------------------------------------------------- */
  var entradaNome = document.getElementById('nome-pet');
  var contadorNome = document.getElementById('contador-nome');
  var textosNome = document.querySelectorAll('.nome-bordado');

  /* Cada peça tem um viewBox recortado no próprio desenho, então a mesma
     medida em unidades do SVG apareceria com tamanhos diferentes em cada
     card. Este fator devolve o nome ao mesmo tamanho aparente em todas. */
  function fatorDaPeca(el) {
    var svg = el.ownerSVGElement;
    if (!svg || !svg.viewBox || !svg.viewBox.baseVal.width) return 1;
    var vb = svg.viewBox.baseVal;
    return Math.max(vb.width, 1.75 * vb.height) / 420;
  }

  function tamanhoDaFonte(el, quantidade) {
    var base = el.classList.contains('nome-card') ? 30 : 34;
    var reducao = quantidade <= 5 ? 1
                : quantidade <= 8 ? 0.8
                : quantidade <= 10 ? 0.67
                : 0.57;
    return Math.round(base * reducao * fatorDaPeca(el) * 10) / 10;
  }

  function aplicarNome(valor) {
    var limpo = valor.trim();
    var texto = limpo || 'seu pet';
    textosNome.forEach(function (el) {
      el.textContent = texto;
      el.style.fontSize = tamanhoDaFonte(el, texto.length) + 'px';
      el.style.opacity = limpo ? '' : '.45';
    });
    if (contadorNome) contadorNome.textContent = String(limpo.length);
  }

  if (entradaNome) {
    entradaNome.addEventListener('input', function () { aplicarNome(this.value); });
    aplicarNome(entradaNome.value);
  }

  /* ---------------------------------------------------------
     Personalizador: trocar entre caminha e comedouro
     --------------------------------------------------------- */
  var perso = document.getElementById('perso');

  if (perso) {
    var botoesPeca = perso.querySelectorAll('.perso-troca-btn');
    botoesPeca.forEach(function (btn) {
      btn.addEventListener('click', function () {
        botoesPeca.forEach(function (b) {
          var eEste = b === btn;
          b.classList.toggle('ativo', eEste);
          b.setAttribute('aria-pressed', String(eEste));
        });
        perso.querySelectorAll('.peca').forEach(function (peca) {
          peca.classList.toggle('ativo', peca.classList.contains('peca-' + btn.dataset.peca));
        });
      });
    });
  }

  /* ---------------------------------------------------------
     Amostras de tecido (personalizador e cards de produto)
     --------------------------------------------------------- */
  function ligarCores(caixa, alvo, saidaNome) {
    var botoes = caixa.querySelectorAll('.cor');
    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        botoes.forEach(function (b) {
          var eEste = b === btn;
          b.classList.toggle('ativo', eEste);
          b.setAttribute('aria-pressed', String(eEste));
        });
        alvo.style.setProperty('--produto-cor', btn.dataset.cor);
        if (saidaNome) {
          saidaNome.textContent = btn.querySelector('.sr').textContent;
        }
      });
    });
  }

  var coresPerso = document.getElementById('cores-perso');
  if (coresPerso && perso) {
    ligarCores(coresPerso, perso, perso.querySelector('.cor-nome'));
  }

  document.querySelectorAll('.produto [data-cores]').forEach(function (caixa) {
    ligarCores(caixa, caixa.closest('.produto'), null);
  });

  /* ---------------------------------------------------------
     Abas de exemplos
     --------------------------------------------------------- */
  var abas = Array.prototype.slice.call(document.querySelectorAll('.aba'));

  function abrirAba(aba, focar) {
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
  }

  abas.forEach(function (aba, i) {
    aba.addEventListener('click', function () { abrirAba(aba, false); });

    aba.addEventListener('keydown', function (e) {
      var destino = null;
      if (e.key === 'ArrowRight') destino = abas[(i + 1) % abas.length];
      else if (e.key === 'ArrowLeft') destino = abas[(i - 1 + abas.length) % abas.length];
      else if (e.key === 'Home') destino = abas[0];
      else if (e.key === 'End') destino = abas[abas.length - 1];
      if (destino) {
        e.preventDefault();
        abrirAba(destino, true);
      }
    });
  });

  /* ---------------------------------------------------------
     Dúvidas (sanfona)
     --------------------------------------------------------- */
  document.querySelectorAll('.faq-botao').forEach(function (botao) {
    var resposta = botao.parentNode.nextElementSibling;

    botao.addEventListener('click', function () {
      var aberto = botao.getAttribute('aria-expanded') === 'true';

      document.querySelectorAll('.faq-botao').forEach(function (outro) {
        if (outro === botao) return;
        outro.setAttribute('aria-expanded', 'false');
        outro.parentNode.nextElementSibling.style.maxHeight = null;
      });

      botao.setAttribute('aria-expanded', String(!aberto));
      resposta.style.maxHeight = aberto ? null : resposta.scrollHeight + 'px';
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.faq-botao[aria-expanded="true"]').forEach(function (botao) {
      var resposta = botao.parentNode.nextElementSibling;
      resposta.style.maxHeight = resposta.scrollHeight + 'px';
    });
  });

  /* ---------------------------------------------------------
     "Quero este" — leva o produto escolhido para o formulário
     --------------------------------------------------------- */
  var seletorProduto = document.getElementById('f-produto');
  var campoPetNome = document.getElementById('f-petnome');

  document.querySelectorAll('[data-pedir]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var escolhido = botao.dataset.pedir;

      if (seletorProduto) {
        Array.prototype.forEach.call(seletorProduto.options, function (op) {
          if (op.text === escolhido) seletorProduto.value = op.value;
        });
      }
      if (campoPetNome && entradaNome && entradaNome.value.trim() && !campoPetNome.value) {
        campoPetNome.value = entradaNome.value.trim();
      }

      document.getElementById('contato').scrollIntoView({
        behavior: semMovimento ? 'auto' : 'smooth',
        block: 'start'
      });
      window.setTimeout(function () {
        var primeiro = document.getElementById('f-nome');
        if (primeiro) primeiro.focus({ preventScroll: true });
      }, semMovimento ? 0 : 620);
    });
  });

  /* ---------------------------------------------------------
     Formulário
     --------------------------------------------------------- */
  var formulario = document.getElementById('formulario');
  var aviso = document.getElementById('form-aviso');

  function mostrarErro(id, mensagem) {
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
      var email = document.getElementById('f-email').value.trim();
      var mensagem = document.getElementById('f-msg').value.trim();

      var ok = true;
      ok = mostrarErro('f-nome', nome ? '' : 'Escreva o seu nome para a gente saber com quem falar.') && ok;
      ok = mostrarErro('f-email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? '' : 'Confira o e-mail: falta o @ ou o final do endereço.') && ok;
      ok = mostrarErro('f-msg', mensagem.length >= 10 ? '' : 'Conte um pouco mais — pelo menos uma frase sobre o seu cachorro.') && ok;

      if (!ok) {
        aviso.textContent = 'Faltou preencher alguma coisa. Veja os campos marcados acima.';
        aviso.style.color = '#C43C55';
        formulario.querySelector('.campo.invalido input, .campo.invalido textarea').focus();
        return;
      }

      /* ===== ENVIO VIA MAILTO =====
         Bloco temporário: monta o e-mail no aplicativo do visitante.
         Ao plugar um serviço de formulário (Formspree e afins), apague
         daqui até o fim do bloco e deixe o form enviar sozinho. */
      var dados = new FormData(formulario);
      var corpo = [
        'Nome: ' + dados.get('nome'),
        'E-mail: ' + dados.get('email'),
        'WhatsApp: ' + (dados.get('whatsapp') || 'não informado'),
        'Produto: ' + dados.get('produto'),
        'Porte: ' + dados.get('porte'),
        'Nome do pet: ' + (dados.get('petnome') || 'não informado'),
        '',
        'Sobre o cachorro:',
        dados.get('mensagem')
      ].join('\n');

      window.location.href = 'mailto:' + EMAIL_PEDIDOS +
        '?subject=' + encodeURIComponent('Pedido pelo site — ' + dados.get('produto')) +
        '&body=' + encodeURIComponent(corpo);

      aviso.textContent = 'Abrimos o seu aplicativo de e-mail com o pedido pronto. É só enviar.';
      aviso.style.color = '';
      /* ===== fim do bloco do mailto ===== */
    });

    ['f-nome', 'f-email', 'f-msg'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        if (this.closest('.campo').classList.contains('invalido')) {
          mostrarErro(id, '');
          aviso.textContent = '';
        }
      });
    });
  }

  /* ---------------------------------------------------------
     Ano no rodapé
     --------------------------------------------------------- */
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());
})();
