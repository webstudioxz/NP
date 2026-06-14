/**
 * dashboard.js — Protección de ruta y gestión de sesión
 * Solo para premium.html
 *
 * Flujo:
 * 1. Muestra pantalla de carga
 * 2. Verifica sesión con Supabase
 * 3a. Sin sesión → redirige a index.html
 * 3b. Con sesión → muestra contenido premium
 */

(async function protectPremiumPage() {

  const loadingScreen  = document.getElementById('loadingScreen');
  const premiumContent = document.getElementById('premiumContent');
  const userEmailEl    = document.getElementById('userEmail');
  const signOutBtn     = document.getElementById('signOutBtn');

  // ── Escuchar cambios de auth (necesario para capturar el redirect del magic link)
  onAuthStateChange(async (event, session) => {

    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Usuario autenticado → mostrar contenido
      mostrarContenidoPremium(session);
    }

    if (event === 'SIGNED_OUT') {
      // Sesión cerrada → ir al inicio
      window.location.href = '/index.html';
    }
  });

  // ── Verificación inicial (para recargas de página)
  try {
    const session = await getCurrentSession();

    if (!session) {
      // Sin sesión: redirigir al inicio después de un breve delay
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1200);
      return;
    }

    // Con sesión: mostrar contenido
    mostrarContenidoPremium(session);

  } catch (err) {
    console.error('Error al verificar sesión:', err);
    window.location.href = '/index.html';
  }

  // ── Mostrar el área premium ─────────────────────────────────────────────
  function mostrarContenidoPremium(session) {
    // Ocultar loading
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.style.display = 'none', 400);
    }

    // Mostrar contenido
    if (premiumContent) {
      premiumContent.classList.remove('hidden');
      premiumContent.style.animation = 'fadeIn 0.5s ease';
    }

    // Mostrar email del usuario
    if (userEmailEl && session?.user?.email) {
      const email = session.user.email;
      // Truncar email largo para el header
      userEmailEl.textContent = email.length > 22
        ? email.substring(0, 19) + '...'
        : email;
      userEmailEl.title = email; // tooltip con email completo
    }

    // Inicializar scroll reveal
    initScrollReveal();
  }

  // ── Botón de cerrar sesión ──────────────────────────────────────────────
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      signOutBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Saliendo...';
      signOutBtn.disabled = true;
      await signOut();
    });
  }

  // ── Scroll reveal para premium.html ────────────────────────────────────
  function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
  }

  // ── Header scroll effect ────────────────────────────────────────────────
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

})();
