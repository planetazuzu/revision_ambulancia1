#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const mode = process.argv[2];

if (!mode || !['mock', 'backend'].includes(mode)) {
  console.log('❌ Uso: node scripts/set-mode.js [mock|backend]');
  console.log('');
  console.log('Ejemplos:');
  console.log('  node scripts/set-mode.js mock     # Activa modo mock');
  console.log('  node scripts/set-mode.js backend  # Activa modo backend');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env.local');
const mockMode = mode === 'mock';

const envContent = `# Configuración generada automáticamente
# Modo: ${mode.toUpperCase()}
NEXT_PUBLIC_MOCK_MODE=${mockMode}

# URL del backend (solo se usa si MOCK_MODE=false)
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_URL=http://localhost:3001

# Configuración adicional para backend
DATABASE_URL="postgresql://app:app@localhost:5432/appdb?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="supersecretjwtkey"
JWT_EXPIRATION_TIME="1h"
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Modo configurado: ${mode.toUpperCase()}`);
  console.log(`📁 Archivo: ${envPath}`);
  console.log('');
  
  if (mockMode) {
    console.log('🎭 Modo Mock activado:');
    console.log('  - Usa datos predefinidos');
    console.log('  - No requiere backend');
    console.log('  - Ideal para desarrollo');
  } else {
    console.log('🚀 Modo Backend activado:');
    console.log('  - Requiere backend ejecutándose');
    console.log('  - Usa base de datos real');
    console.log('  - Ideal para testing de integración');
  }
  
  console.log('');
  console.log('🔄 Reinicia la aplicación para aplicar los cambios:');
  console.log('  npm run dev');
  
} catch (error) {
  console.error('❌ Error al escribir archivo .env.local:', error.message);
  process.exit(1);
}
