FROM node:16.14.0

ARG PORT

ENV PORT=$PORT

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm run test

COPY . .

RUN npm run build

EXPOSE $PORT

CMD ["node", "./dist/index.js"]