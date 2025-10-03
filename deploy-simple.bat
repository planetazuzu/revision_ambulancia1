@echo off
echo ========================================
echo    DESPLIEGUE SIMPLIFICADO AMBUREVIEW
echo ========================================
echo.

echo [1] Verificando Docker...
docker --version
if %errorlevel% neq 0 (
    echo ❌ Docker no esta instalado
    echo Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker esta instalado
echo.

echo [2] Construyendo imagen simplificada...
docker build -f Dockerfile.simple -t ambureview-simple .
if %errorlevel% neq 0 (
    echo ❌ Error al construir la imagen
    pause
    exit /b 1
)
echo ✅ Imagen construida exitosamente
echo.

echo [3] Parando contenedores existentes...
docker stop ambureview-simple 2>nul
docker rm ambureview-simple 2>nul
echo ✅ Contenedores anteriores eliminados
echo.

echo [4] Creando directorio de datos...
if not exist "data" mkdir data
echo ✅ Directorio de datos creado
echo.

echo [5] Ejecutando contenedor...
docker run -d \
  --name ambureview-simple \
  -p 3001:3001 \
  -p 9990:9990 \
  -v "%cd%\data:/app/data" \
  ambureview-simple
echo ✅ Contenedor ejecutandose
echo.

echo [6] Esperando a que la aplicacion este lista...
timeout /t 10 /nobreak >nul
echo.

echo [7] Verificando estado...
docker ps | findstr ambureview-simple
echo.

echo [8] Probando conectividad...
echo Probando backend...
curl -f http://localhost:9990/health 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backend funcionando
) else (
    echo ❌ Backend no responde
)

echo Probando frontend...
curl -f http://localhost:3001 2>nul
if %errorlevel% equ 0 (
    echo ✅ Frontend funcionando
) else (
    echo ❌ Frontend no responde
)
echo.

echo ========================================
echo    DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3001
echo 🔧 Backend API: http://localhost:9990
echo 📊 Base de datos: SQLite en ./data/ambureview.db
echo.
echo Comandos utiles:
echo   Ver logs: docker logs -f ambureview-simple
echo   Parar: docker stop ambureview-simple
echo   Iniciar: docker start ambureview-simple
echo   Eliminar: docker rm -f ambureview-simple
echo.
pause
