# --- Stage 1: Builder ---
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- Stage 2: Runner (Production) ---
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/generated ./generated

# 5. Setup Env
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]