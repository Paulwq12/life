# Use a stable Node.js image
FROM node:latest

# Update package manager and install required dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Copy package.json to container
COPY package.json .

# Install Node.js dependencies
RUN npm install && npm install qrcode-terminal

# Copy the rest of the application code to the container
COPY . .

# Expose port 3000 for HTTP server
EXPOSE 3091

# Command to start the application
CMD ["node", "index.js"]
