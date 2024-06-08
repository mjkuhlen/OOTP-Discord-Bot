# Use the official Node.js 18 image
FROM node:18

# Install MySQL Client
Run apt-get update && apt-get install -y default-mysql-client

# Create and set the working directory
WORKDIR /OOTP-Discord-Bot

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

COPY prisma ./prisma

RUN npx prisma@5.1.1 generate

# Install TypeScript globally
RUN npm install -g typescript

# Copy the rest of your application code to the container
COPY . .

# Compile TypeScript files to JavaScript
RUN tsc

# Expose the port the app runs on
EXPOSE 3000

# Start the bot using the compiled JavaScript file
CMD ["node", "dist/index.js"]



