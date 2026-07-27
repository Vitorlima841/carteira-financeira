## Etapa de build: instala todas as dependências e compila o TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

## Etapa de produção: apenas dependências de produção e artefatos compilados
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "node ./node_modules/typeorm/cli.js migration:run -d dist/shared/config/data-source.js && node dist/main"]
