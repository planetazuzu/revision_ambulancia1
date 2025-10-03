@echo off
echo ========================================
echo    DESPLIEGUE CON FRONTEND EN PUERTO 3002
echo ========================================
echo.

echo [1] Parando servicios actuales...
docker-compose down
echo ✅ Servicios parados
echo.

echo [2] Construyendo y levantando servicios con puerto 3002...
docker-compose -f docker-compose.frontend-3002.yml up --build -d
echo ✅ Servicios iniciados
echo.

echo [3] Esperando a que los servicios estén listos...
timeout /t 30 /nobreak >nul
echo.

echo [4] Verificando estado de los servicios...
docker-compose -f docker-compose.frontend-3002.yml ps
echo.

echo [5] Probando conectividad...
echo Probando backend en puerto 3001...
curl -f http://localhost:3001/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend responde correctamente
) else (
    echo ❌ Backend no responde
)

echo Probando frontend en puerto 3002...
curl -f http://localhost:3002 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend responde correctamente
) else (
    echo ❌ Frontend no responde
)
echo.

echo ========================================
echo    DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3002
echo 🔧 Backend API: http://localhost:3001
echo 📚 API Docs: http://localhost:3001/api
echo 📧 MailHog: http://localhost:8025
echo 🗄️ Base de datos: localhost:5432
echo.
echo Comandos utiles:
echo   Ver logs: docker-compose -f docker-compose.frontend-3002.yml logs -f
echo   Parar: docker-compose -f docker-compose.frontend-3002.yml down
echo   Reiniciar: docker-compose -f docker-compose.frontend-3002.yml restart
echo.
pause
