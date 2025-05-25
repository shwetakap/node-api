FROM node:18-alpine

WORKDIR /usr/src/app

# Set environment to development to include devDependencies
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
