# Use the official Node.js 16 image as a base
FROM node:19

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

ENV DOCKER=true

# Install the app's dependencies
RUN npm install

# Copy the rest of the app's files to the container
COPY . .

# mount the scenario.json file as a volume to ./app/scenario.json
VOLUME [ "./mount_volume", "./scenario_volume" ]

# Transpile the TypeScript code to JavaScript
RUN npm run "build"

# Start the app
CMD [ "npm", "start" ]
