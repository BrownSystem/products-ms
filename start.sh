echo "📦 Ejecutando migraciones con Prisma..."
npx prisma migrate deploy

echo "🚀 Iniciando aplicación NestJS..."
node dist/main.js
