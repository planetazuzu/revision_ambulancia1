@echo off
echo ========================================
echo    DIAGNOSTICO AMBUREVIEW
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

echo [2] Verificando Docker Compose...
docker compose version
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no disponible
    echo Usando docker-compose como alternativa...
    docker-compose --version
    if %errorlevel% neq 0 (
        echo ❌ Docker Compose no esta instalado
        pause
        exit /b 1
    )
)
echo ✅ Docker Compose disponible
echo.

echo [3] Verificando archivos de configuracion...
if exist docker-compose.yml (
    echo ✅ docker-compose.yml encontrado
) else (
    echo ❌ docker-compose.yml no encontrado
)

if exist docker-compose.port9990-3001.yml (
    echo ✅ docker-compose.port9990-3001.yml encontrado
) else (
    echo ❌ docker-compose.port9990-3001.yml no encontrado
)

if exist .env (
    echo ✅ .env encontrado
) else (
    echo ❌ .env no encontrado
)

if exist env.port9990-3001 (
    echo ✅ env.port9990-3001 encontrado
) else (
    echo ❌ env.port9990-3001 no encontrado
)
echo.

echo [4] Verificando puertos en uso...
echo Verificando puerto 3000...
netstat -an | findstr :3000
echo Verificando puerto 3001...
netstat -an | findstr :3001
echo Verificando puerto 9990...
netstat -an | findstr :9990
echo Verificando puerto 5432...
netstat -an | findstr :5432
echo.

echo [5] Verificando contenedores Docker...
docker ps -a
echo.

echo [6] Verificando imagenes Docker...
docker images | findstr ambureview
echo.

echo ========================================
echo    DIAGNOSTICO COMPLETADO
echo ========================================
pause
