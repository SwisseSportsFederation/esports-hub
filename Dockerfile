# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN pnpm install --prod

# Copy the rest of the application code
COPY . .

# Build the Remix app
RUN pnpm build

# Expose the port the Remix app runs on
EXPOSE 3000

# Define the command to run your app
CMD [ "pnpm", "start" ]
