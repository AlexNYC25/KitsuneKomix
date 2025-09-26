# Use a Debian base image for glibc compatibility
FROM node:latest


# Install necessary Linux packages and Deno dependencies
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    p7zip-full \
    ca-certificates \
    gnupg \
    git \
    && rm -rf /var/lib/apt/lists/*


# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy your Nuxt project files
COPY . .

# Cache dependencies (optional: adjust based on your project structure)
# RUN npm run build
RUN pnpm install

# Expose default Nuxt port
EXPOSE 3000

# Run the Nuxt app using Deno
CMD ["npm", "run", "dev"]
