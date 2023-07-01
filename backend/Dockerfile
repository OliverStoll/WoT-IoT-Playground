# This Dockerfile has to be build from the folder: web-of-things-playground as this specific build context is required
# Example:
# cd web-of-things-playground
# docker build -t wot-backend -f backend/Dockerfile .

# Use the official Node.js 19 image
FROM node:19

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY backend/package*.json ./

# Install the app's dependencies
RUN npm install

# Copy backend files
COPY backend ./

# Copy device-blueprint in order to
COPY device-blueprint ./../device-blueprint

# Install jq for the script starting the wot-devices
RUN apt-get update && apt-get install -y jq

# Install docker
RUN yes | apt-get install docker.io

# Build the application
RUN npm run build

CMD ["npm", "start"]
