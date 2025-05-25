# Use official Node.js LTS version as base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Set environment to development so devDependencies are installed
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose app port
EXPOSE 8080

# Run app
CMD ["node", "server.js"]
