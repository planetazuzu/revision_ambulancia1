#!/usr/bin/env node

const http = require('http');

const testEndpoint = (path, description) => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 9002,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`✅ ${description}: ${res.statusCode}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      resolve({ status: 'error', error: err.message });
    });

    req.on('timeout', () => {
      console.log(`⏰ ${description}: Timeout`);
      req.destroy();
      resolve({ status: 'timeout' });
    });

    req.end();
  });
};

const testApp = async () => {
  console.log('🧪 Probando aplicación AmbuReview...\n');

  // Test página principal
  await testEndpoint('/', 'Página principal');
  
  // Test API routes
  await testEndpoint('/api/auth/me', 'API Auth - Me');
  await testEndpoint('/api/ambulances', 'API Ambulances');
  await testEndpoint('/api/materials/consumables', 'API Materials - Consumables');
  await testEndpoint('/api/materials/non-consumables', 'API Materials - Non-consumables');
  await testEndpoint('/api/reviews/mechanical', 'API Reviews - Mechanical');
  await testEndpoint('/api/reviews/cleaning', 'API Reviews - Cleaning');
  await testEndpoint('/api/reviews/daily-checks', 'API Reviews - Daily Checks');
  await testEndpoint('/api/inventory/logs', 'API Inventory - Logs');
  await testEndpoint('/api/inventory/central', 'API Inventory - Central');

  console.log('\n🎯 Pruebas completadas!');
  console.log('\n📱 Para probar la aplicación:');
  console.log('1. Abre http://localhost:9002 en tu navegador');
  console.log('2. Usa una de las cuentas de prueba:');
  console.log('   - alicia@ambureview.com (coordinador)');
  console.log('   - amb001@ambureview.com (usuario)');
  console.log('   - carlos@ambureview.com (usuario)');
  console.log('   - admin@ambureview.com (admin)');
  console.log('3. Contraseña para todas: 123456');
};

testApp().catch(console.error);
