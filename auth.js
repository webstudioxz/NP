






/**
 * auth.js — Lógica de autenticación con Supabase
 * Las claves se inyectan desde variables de entorno en Render
 */

// ── Configuración segura: toma las claves del entorno ────────────────────
// En Render, estas variables se inyectan automáticamente en window._env_
const SUPABASE_URL = window._env_?.SUPABASE_URL || null;
const SUPABASE_ANON = window._env_?.SUPABASE_ANON_KEY || null;

// Verificación: si no hay claves, muestra error claro pero sin exponer datos
if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error('❌ Error de configuración: Faltan las claves de Supabase');
  console.error('Por favor, configura las variables de entorno en Render:');
  console.error('  - SUPABASE_URL');
  console.error('  - SUPABASE_ANON_KEY');
  
  // En lugar de romper la página, mostramos un mensaje amigable
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('magicLinkForm');
    if (form) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'auth-message error';
      errorDiv.innerHTML = '⚠️ Error de configuración. Por favor, contacta al administrador.';
      form.prepend(errorDiv);
    }
  });
}

// Inicializar cliente de Supabase solo si tenemos las claves
const supabase = (SUPABASE_URL && SUPABASE_ANON) 
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON)
  : null;

const SITE_URL = window.location.origin;

async function sendMagicLink(email) {
  if (!supabase) {
    console.error('Supabase no inicializado');
    return { data: null, error: new Error('Configuración pendiente') };
  }
  
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: {
      emailRedirectTo: `${SITE_URL}/premium.html`,
      shouldCreateUser: true,
    }
  });
  return { data, error };
}

async function getCurrentSession() {
  if (!supabase) return { data: { session: null } };
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function getCurrentUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

function onAuthStateChange(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  return supabase.auth.onAuthStateChange(callback);
}