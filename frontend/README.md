# Web of Things Frontend

## Overview
This folder includes the frontend for the WoT playground. 
It is a React based single-page web application written in typescript. 

It allows you to upload a JSON based configuration file. Afterwards the playground
will be initialized with the given Web of Things devices. You can access and set their
properties, call actions and subscribe to their events from another device.

## Structure
    resources: 
        External resources (images, icons..)
    src:
        Main code directory
        src/components: 
            Directory with the different components used in the React app.
            FileUpload.tsx:
                Render the file upload component for the configuration and playbook file
            LogRepresentation:
                Render the log container to show the interaction between the devices. 
            ThingRepresentation:
                Render the container to show the different devices and control them.

        src/components/component_css: 
            Directory with the .css files for the styling of the components.

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

