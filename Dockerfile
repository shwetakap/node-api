FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
EXPOSE 8080
CMD ["node", "server.js"]