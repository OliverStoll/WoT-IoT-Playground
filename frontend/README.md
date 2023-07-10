# Web of Things Frontend

## Overview
This folder includes the frontend for the WoT playground. 
It is a React based single-page web application written in typescript. 

It allows you to upload a JSON based configuration file. Afterwards the playground
will be initialized with the given Web of Things devices. You can access and set their
properties, call actions and subscribe to their events from another device.

### Structure
- resources: all image resources
- src: main code directory
- src/components: code directory with the different components used in the React app
- src/components/component_css: directory with the .css files for styling

## Requirements to run locally
- Node
- npm

## Running locally
Start the frontend:
```
cd frontend
npm install
npm run dev
```

While running the frontend is available under: 

Local: http://localhost:5173/

 Network: http://192.168.178.128:5173/

