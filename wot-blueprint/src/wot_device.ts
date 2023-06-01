const express = require('express');
const fs = require('fs');
const app = express();
const {sendLog, fetchData} = require('./util/requests');
const {extractThingDescription, evaluateCondition} = require('./util/thing_utility');
const {checkAuthentication} = require('./util/authentication');


class Device {
    config: any;
    ip: string;
    port: number;
    logging_info: any;
    properties: any;
    credentials_basic: any;
    thing_description: any;
    actions: any;
    events: any;

    // constructor that takes device json as input
    constructor(device_config: any) {
        // set all the properties of the class
        this.config = device_config;
        this.ip = process.env.IP || 'localhost';
        this.port = Number(process.env.PORT) || 3000;
        this.thing_description = extractThingDescription(device_config, this.ip + ':' + this.port);
        this.credentials_basic = device_config.credentials.basic_sc;
        this.properties = device_config.properties;
        this.actions = device_config.actions;
        this.events = device_config.events;
        this.logging_info = {
            log_server: process.env.LOG_SERVER || 'http://host.docker.internal:5001/api/logs',
            device_id: device_config.id,
            ip: this.ip,
            port: this.port
        }

        console.log("Device Config:", device_config);

        // set initial values for thing properties
        for (let property_name in this.properties) {
            this.properties[property_name].value = this.properties[property_name].start_value;
        }

        // create all the endpoints
        this.createPropertyEndpoints();
        this.createActionEndpoints();
        this.createCommandEndpoint();
        this.createDescriptionEndpoint();


        // start the server
        app.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}`);
            // send the created log info to the log server
            sendLog("created", null, this.thing_description, this.logging_info);
        });
    }


    /** FUNCTIONS THAT CREATE ENDPOINTS **/

    createPropertyEndpoints() {
        // iterate over all entries in properties dictionary
        for (const property_name in this.properties) {
            const property = this.properties[property_name];
            console.log(`Creating property endpoint: http://${this.ip}:${this.port}/property/${property_name}`);
            app.get(`/property/${property_name}`, (req, res) => {
                if (!checkAuthentication(req, this.credentials_basic, this.config.security)) {
                    console.log(`GET /property/${property_name}  (Auth failed)`);
                } else {
                    console.log(`GET /property/${property_name}`);
                }

                let answer = {"name": `${property_name}`, "value": `${property.value}`}
                res.send(answer);
                sendLog("property_called", req, answer, this.logging_info);
            });
        }
    }

    createActionEndpoints() {
        for (const action_name in this.actions) {
            let action = this.actions[action_name];
            console.log(`Creating action endpoint: http://${this.ip}:${this.port}/action/${action_name}`);
            app.get(`/action/${action_name}`, (req, res) => {
                if (!checkAuthentication(req, this.credentials_basic, this.config.security)) {
                    console.log(`GET /action/${action_name}  (Auth failed)`);
                } else {
                    console.log(`GET /action/${action_name}`);
                }

                this.executeMethod(action, action_name);
                let answer = {"name": `${action_name}`}
                res.send(answer)
                sendLog("action_called", req, answer, this.logging_info);
            });
        }
    }

    createEventEndpoints() {
        // TODO: understand long polling
    }

    createCommandEndpoint() {
        // create a command endpoint that can be used to send commands to the device
        app.get(`/command`, async (req, res) => {
            console.log(`GET /command`);
            if (!checkAuthentication(req, this.credentials_basic, this.config.security)) {
                console.log(`Authentication check failed`);
            }

            const command_response = await fetchData(req.query.url);

            res.send(`This is the command endpoint. You sent ${req.query.url}. The answer was ${JSON.stringify(command_response, null, 2)}`);

        });
    }

    createDescriptionEndpoint() {
        // create a description endpoint that can be used to get the description of the device
        app.get(`/description`, (req, res) => {
            console.log(`GET /description`);
            if (!checkAuthentication(req, this.credentials_basic, this.config.security)) {
                console.log(`Authentication check failed`);
            }

            // send the thing description object
            res.send(this.thing_description);
            // TODO: create full thing description and return it
        });
    }


    // function that evaluates and executes the methods action list according to the configuration
    executeMethod(method: any, method_name: string) {
        // get the method with property id=method_name
        console.log(method);
        console.log(`Executing method ${method_name} with ${method.actions.length} actions`);

        // iterate over the actions and execute them
        this.executeMethodActions(method.actions)
    }

    executeMethodActions(actions: any) {
        for (const action of actions) {
            const property = this.properties[action.property];
            switch (action.action) {
                case 'set':
                    console.log(`Setting property ${action.property} to ${action.value}`);
                    property.value = action.value;
                    break;
                case 'increment':
                    console.log(`Incrementing property ${action.property} by ${action.value}`);
                    property.value += action.value;
                    break;
                case 'wait':
                    console.log(`Waiting for ${action.duration} seconds`);
                    setTimeout(() => {
                        console.log(`Done waiting`);
                    }, action.duration * 1000);
                    break;
                case 'trigger_event':
                    console.log(`Sending event ${action.event}`);
                    // TODO: understand event handling and implement it
                    break;
                case 'condition':
                    console.log(`Evaluating condition ${action.property} ${action.condition.operator} ${action.condition.value}`);
                    if (evaluateCondition(action.condition, property)) {
                        console.log(`Condition is true`);
                        this.executeMethodActions(action.actions_true);
                    } else {
                        console.log(`Condition is false`);
                        // check if actions_false is defined
                        if (action.actions_false) {
                            this.executeMethodActions(action.actions_false);
                        }
                    }
                    break;
                default:
                    console.log(`Unknown action type: ${action.action}`);
            }
        }
    }
}


// get the environment variable for the port and convert to number
const DEVICE_IDX = Number(process.env.DEVICE_IDX) || 0;
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const device_config = config.devices[DEVICE_IDX];
// log info and start server
console.log("Log Server address:", config.log_server);
new Device(device_config);

