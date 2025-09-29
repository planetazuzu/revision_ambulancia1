@echo off
REM 🚀 Script para ejecutar AmbuReview sin Docker
echo 🚀 Iniciando AmbuReview en modo local...
echo ================================================

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)
echo [SUCCESS] Node.js está instalado

REM Verificar npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm no está disponible
    pause
    exit /b 1
)
echo [SUCCESS] npm está disponible

REM Crear archivo .env si no existe
if not exist .env (
    echo [INFO] Creando archivo .env...
    copy env.example .env
)

REM Instalar dependencias del backend
echo [INFO] Instalando dependencias del backend...
cd app\backend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error instalando dependencias del backend
    pause
    exit /b 1
)

REM Configurar base de datos SQLite
echo [INFO] Configurando base de datos...
call npx prisma generate
call npx prisma migrate dev --name init
call npx prisma db seed

REM Iniciar backend en una nueva ventana
echo [INFO] Iniciando servidor backend...
start "AmbuReview Backend" cmd /k "npm run start:dev"

REM Esperar un momento
timeout /t 5 /nobreak >nul

REM Instalar dependencias del frontend
echo [INFO] Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error instalando dependencias del frontend
    pause
    exit /b 1
)

REM Iniciar frontend en una nueva ventana
echo [INFO] Iniciando servidor frontend...
start "AmbuReview Frontend" cmd /k "npm run dev"

REM Esperar un momento
timeout /t 10 /nobreak >nul

echo.
echo [SUCCESS] 🎉 ¡AmbuReview iniciado en modo local!
echo.
echo 📋 Información de acceso:
echo   🌐 Frontend: http://localhost:3000
echo   🔧 Backend API: http://localhost:3001
echo   📚 API Docs: http://localhost:3001/api
echo.
echo 👤 Usuarios de prueba:
echo   📧 admin@ambureview.com / admin123
echo   📧 coordinador@ambureview.com / coord123
echo   📧 usuario@ambureview.com / user123
echo.
echo [INFO] Las ventanas del backend y frontend se abrirán automáticamente
echo [INFO] Para detener los servicios, cierra las ventanas de CMD
echo.
pause
