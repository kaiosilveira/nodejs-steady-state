FROM node:16.14.0

ARG PORT

ENV PORT=$PORT

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run test
RUN npm run build

EXPOSE $PORT

CMD ["node", "./dist/index.js"]