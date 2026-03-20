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

# Seed DB during build (so xlsx is available and DB ships pre-loaded)
RUN cd server && npx prisma migrate deploy && node dist/scripts/importVocabulary.js

# Expose port
EXPOSE 3001

# Start server (migration only, import already done)
CMD ["npm", "run", "start"]
