FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose Metro Bundler default port
EXPOSE 8081

# Start the Expo CLI server
CMD ["npx", "expo", "start"]
