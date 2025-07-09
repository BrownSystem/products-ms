# Etapa 1: Instalar dependencias
FROM node:20-slim AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Etapa 2: Build del proyecto
FROM node:20-slim AS build

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Omitimos Prisma aquí porque requiere DB
RUN npm run build

# Etapa 3: Imagen final
FROM node:20-slim

WORKDIR /app

# Copiamos archivos necesarios
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3001

# Ejecutamos Prisma y la app al iniciar el contenedor
CMD bash -c "\
  echo '📦 Generando Prisma Client...' && \
  npx prisma generate && \
  echo '🚀 Ejecutando migraciones...' && \
  npx prisma migrate deploy && \
  echo '🟢 Iniciando aplicación NestJS...' && \
  node dist/main.js"
