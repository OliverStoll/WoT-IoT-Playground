# Web of Things Controller

## Overview
This folder includes the controller backend for the WoT playground. 
It is a node express backend server written in typescript. 

- Designed for extensibility
- Docker in docker (volume ...)
- Starting script
- CRUD

## Requirements to run locally
- Docker
- jq installed on command line
- Node
- npm

## Running locally
Start the backend:
```
cd backend
npm install
npx nodemon
```

## API documentation
An API documentation is available under: http://localhost:5001/api-docs

Start the backend with API documentation
```
cd backend
npm install
cd src
npx ts-node build-docs.ts
cd ..
npx nodemon
```

## Add support for more protocols
Currently, the communication of controller to devices only supports HTTP. 
But the backend was designed in an extensible way in order to allow adding more protocols easily. 

If you want to add another protocol. do this ...
- Implement interface
- Add in sendRequest