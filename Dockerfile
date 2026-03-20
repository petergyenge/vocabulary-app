FROM node:22-slim

WORKDIR /app

# Copy everything
COPY . .

# Install root dependencies (concurrently etc.)
RUN npm install

# Build client + server
RUN npm run build

# Expose port
EXPOSE 3001

# Start: run migrations, import words if needed, start server
CMD ["npm", "run", "start"]
