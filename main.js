/**
 * main.js — Lógica de la landing page
 * Maneja el formulario del magic link y la UI
 */

(function () {

  // ── Elementos del DOM ────────────────────────────────────────────────────
  const form       = document.getElementById('magicLinkForm');
  const emailInput = document.getElementById('emailInput');
  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = document.getElementById('btnText');
  const btnLoading = document.getElementById('btnLoading');
  const authMsg    = document.getElementById('authMessage');
  const formState  = document.getElementById('formState');
  const sentState  = document.getElementById('sentState');
  const sentEmail  = document.getElementById('sentEmail');
  const resendBtn  = document.getElementById('resendBtn');
  const header     = document.getElementById('header');

  // ── Si ya tiene sesión activa, ir directo al premium ────────────────────
  getCurrentSession().then(session => {
    if (session) {
      window.location.href = '/premium.html';
    }
  });

  // ── Formulario: envío del magic link ────────────────────────────────────
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();

      // Validación básica
      if (!email || !isValidEmail(email)) {
        showMessage('Por favor ingresa un email válido.', 'error');
        emailInput.focus();
        return;
      }

      // Estado de carga
      setLoading(true);
      hideMessage();

      try {
        const { error } = await sendMagicLink(email);

        if (error) {
          // Errores conocidos de Supabase
          if (error.message.includes('rate limit') || error.status === 429) {
            showMessage('Demasiados intentos. Espera unos minutos e intenta de nuevo.', 'error');
          } else if (error.message.includes('invalid email')) {
            showMessage('El email ingresado no es válido.', 'error');
          } else {
            showMessage('Ocurrió un error. Por favor intenta de nuevo.', 'error');
            console.error('Supabase error:', error);
          }
          setLoading(false);
          return;
        }

        // Éxito: mostrar estado de "email enviado"
        if (sentEmail) sentEmail.textContent = email;
        formState.classList.add('hidden');
        sentState.classList.remove('hidden');

      } catch (err) {
        showMessage('Error de conexión. Verifica tu internet e intenta de nuevo.', 'error');
        console.error('Error inesperado:', err);
        setLoading(false);
      }
    });
  }

  // ── Botón "enviar a otro correo" ─────────────────────────────────────────
  if (resendBtn) {
    resendBtn.addEventListener('click', () => {
      sentState.classList.add('hidden');
      formState.classList.remove('hidden');
      emailInput.value = '';
      emailInput.focus();
      setLoading(false);
      hideMessage();
    });
  }

  // ── Header scroll ────────────────────────────────────────────────────────
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // ── Scroll reveal ────────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

  // ── Scroll suave para nav links ──────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setLoading(loading) {
    submitBtn.disabled = loading;
    btnText.classList.toggle('hidden', loading);
    btnLoading.classList.toggle('hidden', !loading);
  }

  function showMessage(text, type = 'info') {
    authMsg.textContent = text;
    authMsg.className = `auth-message ${type}`;
    authMsg.classList.remove('hidden');
  }

  function hideMessage() {
    authMsg.classList.add('hidden');
  }

})();
