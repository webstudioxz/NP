// ============================================
// SERVIDOR CON SEGURIDAD, RENDIMIENTO Y PWA
// ============================================
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 1. MANEJO GLOBAL DE EXCEPCIONES
// ============================================
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  console.error('Stack trace:', err.stack);
  // No cerramos el proceso para mantener la app viva en producción
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// ============================================
// 2. MIDDLEWARES DE SEGURIDAD
// ============================================
// Helmet: protege cabeceras HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https://i.ibb.co"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
}));

// CORS estricto con variable de entorno
const allowedOrigins = process.env.ALLOWED_ORIGIN 
  ? process.env.ALLOWED_ORIGIN.split(',') 
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como Postman, apps móviles)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origen bloqueado por CORS: ${origin}`);
      callback(new Error('Origen no permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting: 100 peticiones por 15 minutos
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, por favor intenta después de 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});
app.use('/api/', limiter);
app.use('/api', limiter);

// ============================================
// 3. RENDIMIENTO
// ============================================
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la RAÍZ con caché inteligente
app.use(express.static(__dirname, {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ============================================
// 4. HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// ============================================
// 5. ENDPOINT DE VALIDACIÓN (ejemplo sanitización)
// ============================================
app.post('/api/sanitize', 
  body('data').trim().escape().stripLow(),
  body('email').isEmail().normalizeEmail(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.json({ 
      valid: true, 
      sanitized: req.body 
    });
  }
);

// ============================================
// 6. SERVIR EL HTML PRINCIPAL
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// ============================================
// 7. INICIAR SERVIDOR
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Servidor iniciado correctamente`);
  console.log(`📍 Puerto: ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
  console.log(`📱 PWA disponible: http://localhost:${PORT}\n`);
});

// Timeout del servidor
server.timeout = 120000;