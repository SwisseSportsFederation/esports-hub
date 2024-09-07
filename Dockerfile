# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml (if available)
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code
COPY . .

# Build the Remix app
RUN pnpm run build

# Expose the port that the Remix app will run on
EXPOSE 3000

# Command to run the Remix app
CMD ["pnpm", "run", "start"]
