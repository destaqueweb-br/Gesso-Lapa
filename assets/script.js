'use strict';

/* ============================================================
   GESSO LAPA — Script Principal
   Empresa de Drywall, Gesso, Pintura e Acabamentos
   Lapa, São Paulo/SP
   ============================================================ */

/* ============================================================
   CONFIGURAÇÃO CENTRAL DO SITE
   ============================================================ */
const SiteConfig = {
  siteName: 'Gesso Lapa',
  /** Número WhatsApp internacional oficial: (11) 92719-5253 */
  whatsapp: '5511927195253',
  /** Telefone com máscara brasileira */
  phone: '(11) 92719-5253',
  /** Link do Perfil da Empresa no Google (Google Meu Negócio) */
  googleProfileUrl: 'https://www.google.com/search?q=Gesso+Lapa&stick=H4sIAAAAAAAA_-NgU1I1qLA0SU5Ns0wxByJTy6TUNCuDikSLxJS0VAMDU3Mzw6RU0-RFrFzuqcXF-Qo-iQWJADU7SNU2AAAA&hl=pt-BR',
  /** ID do GA4 (ativado quando fornecido pelo cliente) */
  ga4Id: '',
  /** Mensagem padrão */
  whatsappDefaultMessage: 'Olá! Gostaria de solicitar um orçamento para serviços de gesso e acabamento na Lapa e região.',
};

/* ============================================================
   UTILITÁRIO — WHATSAPP
   Constrói a URL wa.me com mensagem personalizada
   ============================================================ */
function buildWhatsAppURL(mensagem) {
  if (!SiteConfig.whatsapp) {
    console.warn('[Gesso Lapa] WhatsApp não configurado.');
    return '';
  }
  const texto = mensagem || SiteConfig.whatsappDefaultMessage;
  return `https://wa.me/${SiteConfig.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/* ============================================================
   RASTREAMENTO DE EVENTOS / CTAs
   ============================================================ */
function rastrearCTA(acao, dados = {}) {
  const payload = { acao, pagina: window.location.pathname, timestamp: new Date().toISOString(), ...dados };
  console.info('[Gesso Lapa CTA]:', payload);

  if (SiteConfig.ga4Id && typeof window.gtag === 'function') {
    window.gtag('event', acao, {
      event_category: 'Conversão WhatsApp',
      event_label: dados.label || acao,
      ...dados,
    });
  }
}

/* ============================================================
   MÓDULO — NAVEGAÇÃO E MENU MOBILE
   ============================================================ */
const Navigation = (() => {
  function init() {
    const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    const primaryNav = document.getElementById('primary-nav') || document.querySelector('.primary-nav');
    const dropdownToggles = document.querySelectorAll('.nav-dropdown-toggle');

    if (hamburger && primaryNav) {
      hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', String(!isOpen));
        primaryNav.classList.toggle('is-active', !isOpen);
        document.body.classList.toggle('nav-open', !isOpen);
      });

      // Fechar com ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
          hamburger.setAttribute('aria-expanded', 'false');
          primaryNav.classList.remove('is-active');
          document.body.classList.remove('nav-open');
          hamburger.focus();
        }
      });

      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (hamburger.getAttribute('aria-expanded') === 'true' && !primaryNav.contains(e.target) && !hamburger.contains(e.target)) {
          hamburger.setAttribute('aria-expanded', 'false');
          primaryNav.classList.remove('is-active');
          document.body.classList.remove('nav-open');
        }
      });
    }

    // Dropdown em mobile/touch
    dropdownToggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = btn.closest('.has-dropdown');
        if (!parent) return;
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
        parent.classList.toggle('dropdown-open', !expanded);
      });
    });
  }

  return { init };
})();

/* ============================================================
   MÓDULO — HEADER NO SCROLL
   ============================================================ */
const HeaderScroll = (() => {
  function init() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const onScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  return { init };
})();

/* ============================================================
   MÓDULO — FAQ ACORDEÃO
   ============================================================ */
const FAQAccordion = (() => {
  function init() {
    const questions = document.querySelectorAll('.faq-question, .faq-item__trigger');

    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item ? (item.querySelector('.faq-answer') || item.querySelector('.faq-item__body')) : null;
        const isExpanded = btn.getAttribute('aria-expanded') === 'true';

        // Fecha outros do mesmo container
        const container = btn.closest('.faq-list') || document;
        container.querySelectorAll('.faq-question, .faq-item__trigger').forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.setAttribute('aria-expanded', 'false');
            const otherItem = otherBtn.closest('.faq-item');
            const otherAns = otherItem ? (otherItem.querySelector('.faq-answer') || otherItem.querySelector('.faq-item__body')) : null;
            if (otherAns) {
              otherAns.classList.remove('is-open');
              if (otherAns.hasAttribute('hidden')) otherAns.setAttribute('hidden', '');
            }
          }
        });

        // Alterna o atual
        btn.setAttribute('aria-expanded', String(!isExpanded));
        if (answer) {
          if (isExpanded) {
            answer.classList.remove('is-open');
            answer.setAttribute('hidden', '');
          } else {
            answer.classList.add('is-open');
            answer.removeAttribute('hidden');
          }
        }
      });
    });
  }

  return { init };
})();

/* ============================================================
   MÓDULO — BINDING GLOBAL DOS BOTÕES DE WHATSAPP
   Conecta todos os elementos com data-wa-message, data-wa-service
   e links WhatsApp em todo o site ao número oficial confirmado.
   ============================================================ */
const WhatsAppManager = (() => {
  function init() {
    // 1. Elementos com data-wa-message
    const waElements = document.querySelectorAll('[data-wa-message]');
    waElements.forEach(el => {
      const msg = el.getAttribute('data-wa-message') || SiteConfig.whatsappDefaultMessage;
      const url = buildWhatsAppURL(msg);

      if (el.tagName === 'A') {
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      }

      el.addEventListener('click', (e) => {
        rastrearCTA('whatsapp_click', {
          label: el.textContent.trim().substring(0, 40),
          mensagem: msg,
        });
        if (el.tagName !== 'A' && url) {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });

    // 2. Elementos com data-wa-service
    const serviceButtons = document.querySelectorAll('[data-wa-service]');
    serviceButtons.forEach(btn => {
      const servico = btn.getAttribute('data-wa-service') || 'geral';
      const local = btn.getAttribute('data-wa-local') || '';
      let msg = `Olá! Gostaria de um orçamento para ${servico}`;
      if (local) msg += ` na região de ${local}`;
      msg += '.';

      const url = buildWhatsAppURL(msg);
      if (btn.tagName === 'A') {
        btn.href = url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
      }

      btn.addEventListener('click', () => {
        rastrearCTA('whatsapp_service_click', { servico, local });
      });
    });

    // 3. Botão Flutuante
    const floatBtn = document.querySelector('.wa-float-btn, #whatsappFloat');
    if (floatBtn) {
      const msg = floatBtn.getAttribute('data-wa-message') || 'Olá! Gostaria de tirar dúvidas e solicitar orçamento com a Gesso Lapa.';
      floatBtn.href = buildWhatsAppURL(msg);
      floatBtn.target = '_blank';
      floatBtn.rel = 'noopener noreferrer';
      floatBtn.addEventListener('click', () => {
        rastrearCTA('whatsapp_floating_click');
      });
    }

    // 4. Links genéricos de WhatsApp (ex.: no rodapé)
    const allWaLinks = document.querySelectorAll('a[href*="wa.me"]');
    allWaLinks.forEach(link => {
      link.addEventListener('click', () => {
        rastrearCTA('whatsapp_link_click', { url: link.href });
      });
    });
  }

  return { init };
})();

/* ============================================================
   MÓDULO — FORMULÁRIO DE CONTATO (contato.html)
   Valida e redireciona de forma funcional para o WhatsApp
   ============================================================ */
const ContactForm = (() => {
  function init() {
    const form = document.getElementById('contact-form') || document.getElementById('formContato');
    if (!form) return;

    const phoneInput = form.querySelector('input[type="tel"], [name="telefone"]');

    // Máscara brasileira de telefone (XX) XXXXX-XXXX
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 11) v = v.slice(0, 11);
        if (v.length > 10) {
          v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        } else if (v.length > 6) {
          v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        }
        e.target.value = v;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl = form.querySelector('[name="nome"]');
      const phoneEl = form.querySelector('[name="telefone"]');
      const regionEl = form.querySelector('[name="regiao"]');
      const serviceEl = form.querySelector('[name="servico"]');
      const messageEl = form.querySelector('[name="mensagem"]');

      let isValid = true;

      // Validação de Nome
      if (nameEl) {
        const errorEl = document.getElementById('f-name-error');
        if (!nameEl.value.trim() || nameEl.value.trim().length < 2) {
          nameEl.classList.add('is-invalid');
          if (errorEl) errorEl.textContent = 'Por favor, informe seu nome completo.';
          isValid = false;
        } else {
          nameEl.classList.remove('is-invalid');
          if (errorEl) errorEl.textContent = '';
        }
      }

      // Validação de Telefone
      if (phoneEl) {
        const errorEl = document.getElementById('f-phone-error');
        const digits = phoneEl.value.replace(/\D/g, '');
        if (digits.length < 10) {
          phoneEl.classList.add('is-invalid');
          if (errorEl) errorEl.textContent = 'Informe um telefone com DDD válido.';
          isValid = false;
        } else {
          phoneEl.classList.remove('is-invalid');
          if (errorEl) errorEl.textContent = '';
        }
      }

      // Validação de Serviço
      if (serviceEl) {
        const errorEl = document.getElementById('f-service-error');
        if (!serviceEl.value) {
          serviceEl.classList.add('is-invalid');
          if (errorEl) errorEl.textContent = 'Selecione o tipo de serviço.';
          isValid = false;
        } else {
          serviceEl.classList.remove('is-invalid');
          if (errorEl) errorEl.textContent = '';
        }
      }

      if (!isValid) {
        const firstError = form.querySelector('.is-invalid');
        if (firstError) firstError.focus();
        return;
      }

      // Monta texto estruturado
      const nome = nameEl ? nameEl.value.trim() : '';
      const telefone = phoneEl ? phoneEl.value.trim() : '';
      const servico = serviceEl ? serviceEl.value : '';
      const regiao = regionEl && regionEl.value.trim() ? regionEl.value.trim() : 'Lapa / Zona Oeste SP';
      const obs = messageEl && messageEl.value.trim() ? messageEl.value.trim() : '';

      let textoWhatsApp = `Olá, Gesso Lapa! Meu nome é *${nome}*.\n`;
      textoWhatsApp += `📱 Telefone: ${telefone}\n`;
      textoWhatsApp += `🔨 Serviço de interesse: *${servico}*\n`;
      textoWhatsApp += `📍 Região da obra: *${regiao}*\n`;
      if (obs) {
        textoWhatsApp += `📝 Detalhes do projeto: ${obs}\n`;
      }
      textoWhatsApp += `\nAguardo orientações para orçamento. Obrigado!`;

      rastrearCTA('formulario_contato_submetido', { nome, servico, regiao });

      const urlFinal = buildWhatsAppURL(textoWhatsApp);
      window.open(urlFinal, '_blank', 'noopener,noreferrer');
    });
  }

  return { init };
})();

/* ============================================================
   INICIALIZAÇÃO NO CARREGAMENTO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  HeaderScroll.init();
  FAQAccordion.init();
  WhatsAppManager.init();
  ContactForm.init();

  console.info(`[${SiteConfig.siteName}] Sistema inicializado. Contato: ${SiteConfig.phone}`);
});

/* Exportação global para integração */
window.GessoLapa = {
  config: SiteConfig,
  buildWhatsAppURL,
  rastrearCTA,
};
