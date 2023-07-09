TODO REMOVE: Zoom-Meeting beitreten:

https://tu-berlin.zoom.us/j/68314260453?pwd=bFZkV3VDU0pJd0NXYXVCQlNBNlNGUT09


# Web of Things playground @ IoSL (SNET TU Berlin)

## Table of Contents
- [Introduction/Overview](#introductionoverview)
- [Architecture](#architecture)
- [Install and Run](#install-and-run)
- [User Manual](#user-manual)
- [Local Development](#local-development)
- [Contact Information](#contact-information)
- [Additional Documentation](#additional-documentation)

## Introduction/Overview

[Provide a brief introduction to your project. Describe its purpose, key features, and any relevant background information. Mention what problem your project aims to solve and how it adds value.]

## Architecture

[Explain the overall architecture of your project. Describe the components, modules, or services involved, and how they interact with each other. You can use diagrams or flowcharts to illustrate the architecture if necessary.]

## Requirements
- Docker
- Docker compose

## Install and Run
In order to install the playground clone the repository. 

```
git clone https://git.tu-berlin.de/f2499r/web-of-things-playground.git
```
Change the directory
```
cd web-of-things-playground
```
Run the application via docker compose
```
docker-compose up
```

## User Manual

- Uploading a config file (Explain config file)
- Updating a property
- Executing an action
- Trigger event
- Calling something of another device
- execute Playbook (explain playbook file)
- downloading logs
- shutdown devices

## Local Development
If you want to run the services locally (without docker) use the commands here: 

Start the backend:
```
cd backend
npm install
npx nodemon
```

Start the frontend:
```
cd frontend
npm install
npm run dev
```

For more detailed descriptions check the README files provided for each service.


## Contact Information

- Marc-Fabio Niemella
  - E-mail: niemella@campus.tu-berlin.de
  - Opt. Linkedin:
  - Opt. Github
- Frederic Risling
  - E-mail: f.risling@campus.tu-berlin.de
  - LinkedIn: [Frederic Risling](https://www.linkedin.com/in/frederic-risling-32092b234/)
  - GitHub: [FredericRisling](https://github.com/FredericRisling)
- Oliver Stoll
  - E-mail: 
  - Opt. LinkedIn
  - Opt. GitHub


## Additional Documentation

[If there are additional documents or resources related to your project, list them here with brief descriptions and links.]



