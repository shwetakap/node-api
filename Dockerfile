FROM node:18-alpine

WORKDIR /usr/src/app

# Install all dependencies including devDependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# App entry point — won't be used for testing
CMD ["npm", "start"]
