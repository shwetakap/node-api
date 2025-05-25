
# Use official Node.js LTS version as base image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other source code to working directory
COPY . .

# Expose port 8080 (the port your app listens on)
EXPOSE 8080

# Command to run your app
CMD ["node", "server.js"]