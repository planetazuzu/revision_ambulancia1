@echo off
REM 🚀 Script de Despliegue para AmbuReview - Puerto 9990 (Backend) y 3001 (Frontend)
echo 🚀 Iniciando despliegue de AmbuReview en puertos 9990 y 3001...
echo 📅 %date% %time%
echo ================================================

REM Verificar que Docker esté instalado
echo [INFO] Verificando prerrequisitos...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker no está instalado. Por favor instala Docker Desktop desde https://docker.com
    pause
    exit /b 1
)
echo [SUCCESS] Docker está instalado

docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose no está disponible
    pause
    exit /b 1
)
echo [SUCCESS] Docker Compose está disponible

REM Crear archivo .env si no existe
echo [INFO] Configurando variables de entorno...
if not exist .env (
    echo [WARNING] Archivo .env no encontrado. Creando desde env.port9990-3001...
    copy env.port9990-3001 .env
    echo [SUCCESS] Archivo .env creado para puertos 9990 y 3001
) else (
    echo [SUCCESS] Archivo .env encontrado
)

REM Crear directorios necesarios
echo [INFO] Creando directorios necesarios...
if not exist app\backend\uploads mkdir app\backend\uploads
if not exist ops\ssl mkdir ops\ssl
if not exist data\postgres mkdir data\postgres
if not exist data\redis mkdir data\redis
if not exist backups mkdir backups
echo [SUCCESS] Directorios creados

REM Parar contenedores existentes
echo [INFO] Parando contenedores existentes...
docker compose -f docker-compose.port9990-3001.yml down

REM Preguntar si limpiar imágenes
set /p cleanup="¿Deseas limpiar imágenes Docker antiguas? (y/N): "
if /i "%cleanup%"=="y" (
    echo [INFO] Limpiando imágenes antiguas...
    docker system prune -f
    echo [SUCCESS] Imágenes limpiadas
)

REM Construir y levantar servicios
echo [INFO] Construyendo y levantando servicios en puertos 9990 y 3001...
docker compose -f docker-compose.port9990-3001.yml up --build -d

REM Esperar a que los servicios estén listos
echo [INFO] Esperando a que los servicios estén listos...
timeout /t 30 /nobreak >nul

REM Verificar estado de los servicios
echo [INFO] Verificando estado de los servicios...
docker compose -f docker-compose.port9990-3001.yml ps

REM Ejecutar migraciones de base de datos
echo [INFO] Configurando base de datos...
echo [INFO] Ejecutando migraciones de base de datos...
docker compose -f docker-compose.port9990-3001.yml exec backend npm run db:deploy

REM Ejecutar seed de datos iniciales
echo [INFO] Ejecutando seed de datos iniciales...
docker compose -f docker-compose.port9990-3001.yml exec backend npm run db:seed

REM Verificar que los servicios estén funcionando
echo [INFO] Verificando que los servicios estén funcionando...

REM Verificar backend
curl -f http://localhost:9990/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend está funcionando en http://localhost:9990
) else (
    echo [WARNING] Backend no responde en http://localhost:9990
)

REM Verificar frontend
curl -f http://localhost:3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Frontend está funcionando en http://localhost:3001
) else (
    echo [WARNING] Frontend no responde en http://localhost:3001
)

REM Mostrar información de acceso
echo.
echo [SUCCESS] 🎉 ¡Despliegue en puertos 9990 y 3001 completado!
echo.
echo [HEADER] 📋 Información de acceso:
echo   🌐 Frontend: http://localhost:3001
echo   🔧 Backend API: http://localhost:9990
echo   📚 API Docs: http://localhost:9990/api
echo   📧 MailHog: http://localhost:8025
echo   🗄️  Base de datos: localhost:5432
echo.
echo [HEADER] 👤 Usuarios de prueba:
echo   📧 admin@ambureview.com / admin123
echo   📧 coordinador@ambureview.com / coord123
echo   📧 usuario@ambureview.com / user123
echo.
echo [HEADER] 🔧 Comandos útiles:
echo   Ver logs: docker compose -f docker-compose.port9990-3001.yml logs -f [servicio]
echo   Parar servicios: docker compose -f docker-compose.port9990-3001.yml down
echo   Reiniciar servicios: docker compose -f docker-compose.port9990-3001.yml restart
echo   Acceder a base de datos: docker compose -f docker-compose.port9990-3001.yml exec db psql -U app -d appdb
echo.
echo [SUCCESS] ¡Sistema AmbuReview listo en puertos 9990 y 3001! 🚀
echo.
pause
