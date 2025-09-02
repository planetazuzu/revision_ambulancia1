#!/bin/sh

echo "🚀 Iniciando AmbuReview Backend..."

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
until pg_isready -h db -p 5432 -U app; do
  echo "Base de datos no está lista - esperando..."
  sleep 2
done

echo "✅ Base de datos lista!"

# Generar cliente Prisma
echo "🔧 Generando cliente Prisma..."
npx prisma generate

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de base de datos..."
npx prisma migrate deploy

# Ejecutar seed si es la primera vez
echo "🌱 Ejecutando seed de datos iniciales..."
npx prisma db seed

# Iniciar la aplicación
echo "🚀 Iniciando aplicación NestJS..."
exec npm run start:prod
