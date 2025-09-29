#!/bin/bash

# 🚀 Script para ejecutar AmbuReview sin Docker
echo "🚀 Iniciando AmbuReview en modo local..."
echo "================================================"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi
echo "[SUCCESS] Node.js está instalado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm no está disponible"
    exit 1
fi
echo "[SUCCESS] npm está disponible: $(npm --version)"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "[INFO] Creando archivo .env..."
    cp env.example .env
fi

# Instalar dependencias del backend
echo "[INFO] Instalando dependencias del backend..."
cd app/backend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Error instalando dependencias del backend"
    exit 1
fi

# Configurar base de datos SQLite
echo "[INFO] Configurando base de datos..."
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed

# Iniciar backend en background
echo "[INFO] Iniciando servidor backend..."
npm run start:dev &
BACKEND_PID=$!

# Esperar un momento
sleep 5

# Instalar dependencias del frontend
echo "[INFO] Instalando dependencias del frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Error instalando dependencias del frontend"
    kill $BACKEND_PID
    exit 1
fi

# Iniciar frontend en background
echo "[INFO] Iniciando servidor frontend..."
npm run dev &
FRONTEND_PID=$!

# Esperar un momento
sleep 10

echo ""
echo "[SUCCESS] 🎉 ¡AmbuReview iniciado en modo local!"
echo ""
echo "📋 Información de acceso:"
echo "  🌐 Frontend: http://localhost:3000"
echo "  🔧 Backend API: http://localhost:3001"
echo "  📚 API Docs: http://localhost:3001/api"
echo ""
echo "👤 Usuarios de prueba:"
echo "  📧 admin@ambureview.com / admin123"
echo "  📧 coordinador@ambureview.com / coord123"
echo "  📧 usuario@ambureview.com / user123"
echo ""
echo "[INFO] Para detener los servicios, presiona Ctrl+C"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "[INFO] Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "[SUCCESS] Servicios detenidos"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Mantener el script ejecutándose
wait
