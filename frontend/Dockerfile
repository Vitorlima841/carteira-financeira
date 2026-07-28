## Esqueleto minimo em uma unica etapa.
## O build multi-stage (com output standalone) sera implementado junto com a aplicacao.
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
