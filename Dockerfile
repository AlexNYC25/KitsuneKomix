# Stage 1: Build the TypeScript code
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json (if it exists)
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source and config files
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Run the compiled app in a slim image
FROM node:22-alpine

WORKDIR /app

# Copy package files to install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose the app port (adjust if different)
EXPOSE 3000

# Start the app using compiled JS
CMD ["node", "dist/index.js"]
