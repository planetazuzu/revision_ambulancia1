@echo off
echo ========================================
echo    SOLUCION DE PROBLEMAS AMBUREVIEW
echo ========================================
echo.

echo [1] Limpiando contenedores existentes...
docker stop $(docker ps -aq) 2>nul
docker rm $(docker ps -aq) 2>nul
echo ✅ Contenedores limpiados
echo.

echo [2] Limpiando imagenes no utilizadas...
docker image prune -f
echo ✅ Imagenes limpiadas
echo.

echo [3] Verificando archivos de configuracion...
if not exist .env (
    echo Creando archivo .env desde env.port9990-3001...
    copy env.port9990-3001 .env
)
echo ✅ Archivo .env verificado
echo.

echo [4] Reconstruyendo y levantando servicios...
echo Usando configuracion de puertos personalizados (9990 y 3001)...
docker compose -f docker-compose.port9990-3001.yml up --build -d
echo.

echo [5] Esperando a que los servicios esten listos...
timeout /t 30 /nobreak >nul
echo.

echo [6] Verificando estado de servicios...
docker compose -f docker-compose.port9990-3001.yml ps
echo.

echo [7] Verificando logs del backend...
echo === LOGS BACKEND ===
docker compose -f docker-compose.port9990-3001.yml logs backend
echo.

echo [8] Verificando logs de la base de datos...
echo === LOGS BASE DE DATOS ===
docker compose -f docker-compose.port9990-3001.yml logs db
echo.

echo [9] Probando conectividad...
echo Probando backend en puerto 9990...
curl -f http://localhost:9990/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend responde correctamente
) else (
    echo ❌ Backend no responde
)

echo Probando frontend en puerto 3001...
curl -f http://localhost:3001 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend responde correctamente
) else (
    echo ❌ Frontend no responde
)
echo.

echo ========================================
echo    SOLUCION COMPLETADA
echo ========================================
echo.
echo Si los servicios no funcionan, revisa los logs arriba
echo Para ver logs en tiempo real: docker compose -f docker-compose.port9990-3001.yml logs -f
echo.
pause
