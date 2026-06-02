const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const BG_COLOR = '#1E90FF';
const FG_COLOR = '#FFFFFF';
const ICONS_DIR = path.join(__dirname, 'icons');

// Crear carpeta icons si no existe
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
  console.log('📁 Carpeta icons creada');
}

function generateIcon(size, text = 'IPV') {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo
  ctx.fillStyle = BG_COLOR;
  ctx.fillRect(0, 0, size, size);
  
  // Borde redondeado (opcional)
  ctx.save();
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
  ctx.clip();
  
  // Degradado para efecto moderno
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, BG_COLOR);
  gradient.addColorStop(1, '#4169E1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Estrella o texto
  if (size >= 128) {
    // Dibujar estrella
    const centerX = size / 2;
    const centerY = size / 2;
    const outerRadius = size * 0.35;
    const innerRadius = size * 0.15;
    const points = 5;
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / points;
    
    ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const x1 = centerX + Math.cos(rot) * outerRadius;
      const y1 = centerY + Math.sin(rot) * outerRadius;
      ctx.lineTo(x1, y1);
      rot += step;
      
      const x2 = centerX + Math.cos(rot) * innerRadius;
      const y2 = centerY + Math.sin(rot) * innerRadius;
      ctx.lineTo(x2, y2);
      rot += step;
    }
    ctx.closePath();
    ctx.fillStyle = FG_COLOR;
    ctx.fill();
  } else {
    // Texto para íconos pequeños
    ctx.fillStyle = FG_COLOR;
    ctx.font = `bold ${size * 0.4}px "Segoe UI", Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size/2, size/2);
  }
  
  ctx.restore();
  
  // Guardar archivo
  const filename = path.join(ICONS_DIR, `icon-${size}.png`);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Ícono generado: ${filename}`);
}

function generateMaskableIcon() {
  const size = 512;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Fondo con gradiente
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, BG_COLOR);
  gradient.addColorStop(1, '#4169E1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Máscara redondeada
  ctx.save();
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 * 0.85, 0, Math.PI * 2);
  ctx.clip();
  
  // Estrella grande
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.18;
  const points = 5;
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / points;
  
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const x1 = centerX + Math.cos(rot) * outerRadius;
    const y1 = centerY + Math.sin(rot) * outerRadius;
    ctx.lineTo(x1, y1);
    rot += step;
    
    const x2 = centerX + Math.cos(rot) * innerRadius;
    const y2 = centerY + Math.sin(rot) * innerRadius;
    ctx.lineTo(x2, y2);
    rot += step;
  }
  ctx.closePath();
  ctx.fillStyle = FG_COLOR;
  ctx.fill();
  
  // Sombra
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.fill();
  
  ctx.restore();
  
  // Guardar archivo
  const filename = path.join(ICONS_DIR, 'maskable-icon.png');
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Ícono maskable generado: ${filename}`);
}

// Ejecutar generación
console.log('🎨 Generando íconos PWA...\n');
ICON_SIZES.forEach(size => generateIcon(size));
generateMaskableIcon();
console.log('\n✨ Todos los íconos fueron generados correctamente');
console.log('📁 Ubicación: carpeta /icons/');