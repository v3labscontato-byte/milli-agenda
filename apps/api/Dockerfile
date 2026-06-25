FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared-types/package*.json ./packages/shared-types/
COPY packages/business-rules/package*.json ./packages/business-rules/
RUN npm ci --ignore-scripts

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=@milli/shared-types
RUN npm run build --workspace=@milli/business-rules
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN cd apps/api && npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/packages ./packages
EXPOSE 3001
CMD ["node", "dist/main"]
