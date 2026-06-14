# 🌿 Serenity Spa — Academia Profesional de Masajes

Web completa con autenticación por **Magic Link** usando Supabase Auth.  
Sin contraseñas · Sin dependencias complejas · 100% gratuito para comenzar.

---

## 📁 Estructura del proyecto

```
spa-agency/
├── index.html      # Landing page pública
├── premium.html    # Área protegida (requiere autenticación)
├── auth.js         # Lógica de Supabase Auth
├── dashboard.js    # Protección de ruta premium
├── main.js         # UI de la landing page
├── styles.css      # Estilos completos (paleta oscura/dorada)
└── README.md       # Este archivo
```

---

## 🚀 Configuración paso a paso

### PASO 1 — Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Haz clic en **"New project"**
3. Completa:
   - **Name:** serenity-spa (o el nombre que prefieras)
   - **Database Password:** guarda esta contraseña
   - **Region:** elige la más cercana a tus usuarios
4. Espera ~2 minutos a que el proyecto se inicialice

---

### PASO 2 — Obtener las claves de API

1. En tu proyecto Supabase, ve a **Settings → API**
2. Copia estos dos valores:

```
Project URL:     https://xxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Abre `auth.js` y reemplaza:

```javascript
const SUPABASE_URL  = 'https://TU_PROYECTO.supabase.co';   // ← tu URL
const SUPABASE_ANON = 'TU_ANON_PUBLIC_KEY';                // ← tu anon key
```

> ⚠️ La `anon public key` es segura para usar en el frontend.  
> **NUNCA** uses la `service_role key` en el cliente.

---

### PASO 3 — Configurar URLs en Supabase

1. Ve a **Authentication → URL Configuration**
2. Configura:

```
Site URL:        https://tu-app.onrender.com
                 (o http://localhost:3000 para desarrollo local)

Redirect URLs:   https://tu-app.onrender.com/premium.html
                 http://localhost:3000/premium.html
```

3. Haz clic en **Save**

> 📌 Esto es crítico: el magic link solo redirigirá a URLs que estén en esta lista.

---

### PASO 4 — (Opcional) Personalizar el email del Magic Link

1. Ve a **Authentication → Email Templates → Magic Link**
2. Personaliza el asunto y el cuerpo del email
3. Ejemplo de asunto: `Tu acceso a Serenity Spa ✨`
4. Puedes usar variables: `{{ .ConfirmationURL }}` para el enlace

---

### PASO 5 — Subir a GitHub

```bash
# Inicializar repositorio
git init
git add .
git commit -m "feat: Serenity Spa con Supabase Magic Link"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/TU_USUARIO/serenity-spa.git
git branch -M main
git push -u origin main
```

---

### PASO 6 — Desplegar en Render

1. Ve a [https://render.com](https://render.com) y crea una cuenta
2. Haz clic en **"New +"** → **"Static Site"**
3. Conecta tu repositorio de GitHub (`serenity-spa`)
4. Configura:

```
Name:            serenity-spa
Branch:          main
Root Directory:  (dejar vacío)
Build Command:   (dejar vacío — no necesitas build)
Publish Directory: .
```

5. Haz clic en **"Create Static Site"**
6. Render te dará una URL: `https://serenity-spa.onrender.com`

7. **Vuelve al PASO 3** y actualiza las URLs en Supabase con tu URL de Render.

---

## 🔧 Desarrollo local

Para probar localmente necesitas un servidor HTTP simple (los magic links no funcionan con `file://`):

### Opción A — Python (viene instalado en Mac/Linux):
```bash
cd spa-agency
python3 -m http.server 3000
# Abre: http://localhost:3000
```

### Opción B — Node.js:
```bash
npx serve . -p 3000
# Abre: http://localhost:3000
```

### Opción C — VS Code:
Instala la extensión **"Live Server"** y haz clic en "Go Live".

---

## 🔐 Cómo funciona el Magic Link

```
1. Usuario ingresa su email en index.html
         ↓
2. Se llama a supabase.auth.signInWithOtp({ email })
         ↓
3. Supabase envía un email con enlace único
   (Token de un solo uso, expira en 24h)
         ↓
4. Usuario hace clic en el enlace del email
         ↓
5. Supabase verifica el token y crea sesión
         ↓
6. Redirige automáticamente a premium.html
         ↓
7. dashboard.js detecta la sesión activa
         ↓
8. Se muestra el contenido premium
```

**Seguridad que Supabase maneja automáticamente:**
- ✅ Tokens de un solo uso (TOTP)
- ✅ Expiración de 24 horas
- ✅ Protección contra reutilización
- ✅ Rate limiting (evita spam)
- ✅ Sesiones JWT firmadas
- ✅ Revocación de sesiones al cerrar sesión

---

## 📝 Variables del proyecto

| Variable | Dónde cambiarla | Descripción |
|---|---|---|
| `SUPABASE_URL` | `auth.js` línea 20 | URL de tu proyecto Supabase |
| `SUPABASE_ANON` | `auth.js` línea 21 | Clave pública anónima |
| `SITE_URL` | `auth.js` línea 24 | URL de tu sitio (auto-detectada) |
| Hero image | `styles.css` línea ~108 | URL de la imagen del hero |
| Nombre agencia | `index.html` | Reemplazar "SERENITY SPA" |
| Video tutorial | `premium.html` | Reemplazar el src del iframe |
| PDFs | `premium.html` | Reemplazar href="#" con URLs reales |

---

## 🎨 Personalización rápida

### Cambiar nombre de la agencia:
Busca y reemplaza `SERENITY SPA` en todos los archivos HTML.

### Cambiar colores:
En `styles.css`, modifica las variables en `:root`:
```css
--gold:       #c9a87a;   /* Color dorado principal */
--gold-light: #e8c98a;   /* Dorado claro */
--ink:        #0d0804;   /* Negro del fondo */
```

### Cambiar imagen del hero:
En `styles.css`, busca `background:` en `.hero` y reemplaza la URL de Unsplash.

### Agregar tu logo:
En `index.html`, reemplaza `<i class="fas fa-spa"></i>` con:
```html
<img src="logo.png" alt="Logo" style="height:40px;" />
```

---

## 🐛 Solución de problemas

**"El magic link no redirige al premium"**
→ Verifica que `https://tu-app.onrender.com/premium.html` esté en Redirect URLs de Supabase.

**"Error: Invalid URL"**
→ Asegúrate de haber reemplazado `SUPABASE_URL` y `SUPABASE_ANON` en `auth.js`.

**"El email no llega"**
→ Revisa la carpeta de spam. Supabase usa un dominio de prueba por defecto.  
→ Para producción, configura un dominio SMTP personalizado en Supabase → Settings → SMTP.

**"Demasiados intentos"**
→ Supabase limita el número de emails por hora. Espera unos minutos.

**"Accedo a premium.html sin estar autenticado"**
→ Verifica que `dashboard.js` esté enlazado en `premium.html` y que `auth.js` esté cargado primero.

---

## 📦 Tecnologías usadas

| Tecnología | Versión | Uso |
|---|---|---|
| Supabase JS | v2 (CDN) | Autenticación Magic Link |
| Font Awesome | 6.4.0 | Íconos |
| Google Fonts | — | Cinzel, Cormorant, Lato |
| HTML/CSS/JS | Vanilla | Sin frameworks |

---

## 📄 Licencia

MIT — Libre para uso personal y comercial.

---

*Desarrollado con ❤️ para Serenity Spa · Academia Profesional de Masajes*
