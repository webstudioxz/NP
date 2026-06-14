/**
 * auth.js — Lógica de autenticación con Supabase
 * Serenity Spa · Academia Profesional
 *
 * ──────────────────────────────────────────────
 * CONFIGURACIÓN: reemplaza los valores de abajo
 * con los de tu proyecto Supabase.
 * ──────────────────────────────────────────────
 */

// ── 1. Configura tus claves de Supabase ────────────────────────────────────
//
//  Encuéntralas en: https://app.supabase.com
//  → Tu proyecto → Settings → API
//
//  En producción usa variables de entorno:
//  SUPABASE_URL y SUPABASE_ANON_KEY
//  (o inyéctalas con un script de build)
// ──────────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://TU_PROYECTO.supabase.co';   // ← REEMPLAZAR
const SUPABASE_ANON = 'TU_ANON_PUBLIC_KEY';                // ← REEMPLAZAR

// ── 2. Inicializa el cliente de Supabase ───────────────────────────────────
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

// URL base de tu sitio (para el redirect del magic link)
// En local: http://localhost:3000 | En producción: https://tuapp.onrender.com
const SITE_URL = window.location.origin;

// ── 3. Función: enviar Magic Link ──────────────────────────────────────────
/**
 * Envía un OTP (Magic Link) al email del usuario.
 * Supabase gestiona tokens, expiración y seguridad automáticamente.
 *
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise<{data, error}>}
 */
async function sendMagicLink(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      // Redirige al área premium tras confirmar el enlace
      emailRedirectTo: `${SITE_URL}/premium.html`,
      // No crear usuario automáticamente si no existe
      // (cambiar a true si quieres registro automático)
      shouldCreateUser: true,
    }
  });
  return { data, error };
}

// ── 4. Función: obtener sesión activa ──────────────────────────────────────
/**
 * Devuelve la sesión actual o null si no hay sesión.
 *
 * @returns {Promise<Session|null>}
 */
async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// ── 5. Función: obtener usuario actual ─────────────────────────────────────
/**
 * Devuelve el usuario autenticado actual o null.
 *
 * @returns {Promise<User|null>}
 */
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ── 6. Función: cerrar sesión ─────────────────────────────────────────────
/**
 * Cierra la sesión del usuario y redirige al inicio.
 */
async function signOut() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

// ── 7. Listener de cambios de estado de auth ──────────────────────────────
/**
 * Escucha cambios en el estado de autenticación.
 * Útil para detectar cuando el magic link es confirmado.
 *
 * @param {Function} callback - (event, session) => void
 */
function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

// ── 8. Exportar (por si se usa como módulo ES) ────────────────────────────
// Si usas script type="module" puedes hacer:
// export { supabase, sendMagicLink, getCurrentSession, getCurrentUser, signOut, onAuthStateChange };
