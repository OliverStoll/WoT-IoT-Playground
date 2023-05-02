# Use the official Node.js 16 image as a base
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app's dependencies
RUN npm install

# Copy the rest of the app's files to the container
COPY . .

# Transpile the TypeScript code to JavaScript
# RUN npm run build

# Start the app
CMD [ "npm", "start" ]
