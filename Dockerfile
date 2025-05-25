# Use official Node.js Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including devDependencies for tests
RUN npm install

# Copy all app source code
COPY . .

# Run tests (fail build if tests fail)


# Remove dev dependencies to slim image (optional)
RUN npm prune --production

# Set environment to production for running app
ENV NODE_ENV=production

# Expose app port if needed (change to your app port)
EXPOSE 5000

# Start your app
CMD ["node", "server.js"]
