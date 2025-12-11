FROM node:24.11.1-alpine3.23 AS base

FROM base AS builder

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

RUN npm ci

ENV NODE_ENV=production

COPY lib ./lib
COPY pages ./pages
COPY types ./types
COPY next.config.ts ./next.config.ts
COPY next-env.d.ts ./next-env.d.ts
COPY styles.css ./styles.css
COPY tsconfig.json ./tsconfig.json
COPY .env ./.env

RUN npm run build

FROM base AS runtime
RUN apk update && apk add --no-cache curl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN mkdir -p /app/.next

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

COPY scripts/entrypoint.sh /app/entrypoint.sh
COPY scripts/health.sh /app/health.sh
RUN chmod -R +x /app/*.sh
RUN sed -i 's/\r$//g' /app/*.sh

ENV PORT=3000

ENTRYPOINT ["/app/entrypoint.sh"]
HEALTHCHECK --start-period=30s --interval=60s --timeout=5s --retries=3 CMD ["/app/health.sh"]

