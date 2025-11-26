# Usa una imagen base ligera para Node.js (Stage 1: Build)
FROM node:18-alpine AS builder

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos de definición de dependencias
COPY package*.json ./

# Instala las dependencias de producción
# Usa --omit=dev para evitar instalar dependencias de desarrollo (mocha, eslint) en la imagen final
RUN npm install --omit=dev

# Copia el código fuente de la aplicación
COPY . .

# ------------------------------------------------------------------
# Stage 2: Producción (Imagen final más pequeña y segura)
# ------------------------------------------------------------------
FROM node:18-alpine

# Crea un usuario no-root para mejorar la seguridad
RUN adduser -D appuser
USER appuser

# Configura el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios del stage de construcción
# - node_modules de producción
# - Código fuente y el script de inicio
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app.js .

# Documentación: Expone el puerto que usa la aplicación
EXPOSE 8080

# Comando de ejecución
CMD ["node", "app.js"]
