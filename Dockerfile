FROM node:22-slim

# Install OpenSSL (required by Prisma)
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything
COPY . .

# Install root dependencies
RUN npm install

# Build client + server
RUN npm run build

# Expose port
EXPOSE 3001

# Start: run migrations, import words if needed, start server
CMD ["npm", "run", "start"]
