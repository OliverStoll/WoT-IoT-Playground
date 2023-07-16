# Web of Things User Interface

The Web of Things Playground User Interface manages all the user interaction with the application. 
Configuration and playbook files can be uploaded, the devices inside the playground are visualized 
and the user can interact with them. It is the entry point for the application and communicates with the
backend controller via REST API.

## Table of Contents
- [Implementation](#implementation)
    - [Technology Stack](#technology-stack)
    - [Structure of the project](#structure-of-the-project)
- [Installation and Running instructions](#installation-and-running-instructions)
    - [Requirements](#Requirements)
    - [Installation command](#installation-commands)
    - [Running commands](#running-commands)
- [Known issues](#known-issues)

## Implementation
The frontend user interface is implemented as a React based single-page web application written in typescript. 
Since it is only communicating with the controller and not with the devices directly, there is no
need for different protocols, the communication is completely based on an HTTP REST API. But since the endpoints 
for the interactions with the devices are parsed from the Thing Descriptions here, we also had to focus on extensibility
in the frontend.

### Technology Stack
The frontend uses a technology stack that was selected based on established industry standards.
- **Node.js**: Node.js is used as a runtime environment for the code as it supports JavaScript. Additionally, it allows to use asynchronous communication, which is often used in the IoT context in the form of events.
- **TypeScript**: We use Typescript as our programming language, which extends the JavaScript syntax with static typing, enabling improved code quality and maintainability.
- **REACT**: We use REACT as the overlying framework, as it is one of the most used web developing frameworks.

### Structure of the project
The REACT frontend is structured as follows:

![Frontend folder structure](./../examples/applicationScreenshots/frontendStructure.png)

The source code for the frontend is located in the **src** folder.
The main application is the app.tsx file, which imports all the components. The used components are in the **src/components** folder.
The FileUpload component handles the upload of the configuration and playbook file and executes a first simple validation check.
The Heading component is quite simple only for the heading of the app.
The LogRepresentation component is responsible for fetching the logs from the backend and displaying all the interactions.
And lastly the ThingRepresentation is responsible for parsing the Thing Descriptions, displaying the devices and enable the interaction with them.
In the **src/components/component_css** folder you can find rhe corresponding css files for styling.


## Installation and Running instructions

### Requirements
- Node (tested with 20.2.0)
- npm (tested with 9.6.6)
- REACT (tested with 18.2.0)

### Installation commands
> **Info:** Assuming that you cloned the web-of-things-playground and current directory is web-of-things-playground

```
cd frontend
npm install
```


### Running commands
```
cd frontend
npm run dev
```


While running the frontend is available under:

Local: http://localhost:5173/

Network: http://192.168.178.128:5173/

## Known issues
- **Error Handling**:
Currently we are checking user input in form of uploaded files and text input for the correct type, but there is no
proper validation. For example files are checked for a correct json syntax and if it is configuration or playbook file, but we don't check
the content in detail if really everything is correct. This could end up in errors and crashes if mandatory fields are missing.
- **Extensibility:**
Even though the frontend is only communicating with the backend we can not ignore the extensibility completely.
Currently, the implementation only supports devices communicating in http and with no or a basic in-header security definition.
To implement other protocols and security definitions, several changes have to be done. The specific places have been highlighted with toDos.
- **Parameter:**
The WoT standard allows parameter for getting properties and calling actions. In our current implementation we do not support
parameter for properties at all, and we only have limited support for parameterized actions. In our implementation actions can
be called with variables in the URL of a request, but we don't enforce a correct input. Actions with input variables in the body
are currently not supported.



