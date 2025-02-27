# # Build stage
# FROM node:18-alpine AS builder
# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# # Production stage
# FROM node:18-alpine AS production
# WORKDIR /app

# ENV NODE_ENV production
# ENV PORT 3000
# ENV HOSTNAME "0.0.0.0"

# COPY package*.json ./
# RUN npm install --production

# COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/public ./public
# COPY --from=builder /app/next.config.js ./

# EXPOSE 3000

# CMD ["npm", "run", "start"]

FROM node:18-alpine
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour npm install
COPY package*.json ./
COPY tsconfig*.json ./
COPY next.config.js ./

# Installer les dépendances avec cache
RUN npm ci

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Exposer le port
EXPOSE 3000

# Utiliser npm run dev pour le hot reload
CMD ["npm", "run", "dev"]