FROM node:20-alpine

# Install system dependencies required for native node-sqlite3 bindings compilation
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install package dependencies securely
RUN npm install

# Copy application source files
COPY . .

# Expose backend port
EXPOSE 3333

# Start the Express server
CMD ["npm", "start"]
