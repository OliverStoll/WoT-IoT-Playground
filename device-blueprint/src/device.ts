// An accompanying tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.
const fs = require("fs");
let ip = require("ip");
const {Servient} = require("@node-wot/core");
const {HttpServer} = require("@node-wot/binding-http");

import {LogType, sendLog} from "./logging/requests";
const {executeMethodActions} = require('./device_actions/action_logic.js');


// create a property dictionary type
export interface PropertiesDict {
    [key: string]: _Property;
}
export interface ActionsDict {
    [key: string]: _Action;
}
export interface EventsDict {
    [key: string]: _Event;
}

export interface VariablesDict {
    [key: string]: Variable;
}

export interface _Property {
    name?: string;
    type: string;
    description?: string;
    value?: number | boolean | string;
    startValue?: number | boolean | string;
}

export interface _Action {
    description?: string;
    uriVariables?: {
        [key: string]: UriVariable;
    }
    action_list: [ActionStep];
}

export interface _Event {
    description?: string;
}

export interface ActionStep {
    action_type: 'set' | 'increment' | 'sleep' | 'emit_event' | 'condition';  // TODO: enum
    property?: string;
    value?: number | boolean | string;
    variable?: string;
    event_name?: string;
    payload_property?: string;
    condition?: Condition;
}

export interface Condition {
    operator: string;
    value: number | boolean | string;
    action_list_true: [ActionStep];
    action_list_false?: [ActionStep];
}

export interface UriVariable {
    type: string;
    description?: string;
    minimum?: number;
    maximum?: number;
}

export interface Variable {
    type: string;
    value: number | boolean | string;
}

// for each property in config_backup.json, initialize the property values
function initializePropertyValues(properties_dict: PropertiesDict): PropertiesDict {

  for (let property_name in properties_dict) {
    let property: _Property = properties_dict[property_name];

    // check if property exists
    if (!property) {
        throw new Error(`Property ${property_name} does not exist`);
    }
    // check if property has type
    if (!property.hasOwnProperty("type")) {
        throw new Error(`Property ${property_name} does not have a type`);
    }

    // add name to property
    property['name'] = property_name;

    switch (property.type) {
        case "number":
        // define the type of property.value as number
        property.value = 0.0 as number;
        break;
        case "boolean":
        property.value = false as boolean;
        break;
      case "string":
        property.value = "" as string;
        break;
      default:
        throw new Error(`Unknown type ${property.type}`);
    }

    if (property.hasOwnProperty("startValue")) {
      property.value = property.startValue as _Property["value"];
    }
  }
  console.log(properties_dict);
  return properties_dict;
}


// create Servient and add HTTP binding with port 3000
const device_port = Number(process.env.PORT) || 3000;
const servient = new Servient();
servient.addServer(new HttpServer({port: device_port}));

// load config_backup.json file
let config_path = "./config_backup.json";
// check if config_backup.json exists
if (!fs.existsSync(config_path)) {
    console.log("running from node script")
    config_path = "../config_backup.json";
}
let description_json = JSON.parse(fs.readFileSync(config_path, "utf-8"));
// get the ip of the device from system
let device_ip: string = ip.address();

// get id from description_json or convert the name to lowercase and replace spaces with underscores
let device_id = description_json.id || description_json.title.toLowerCase().replace(" ", "_");
export let logging_info = {
    log_server: process.env.LOG_SERVER || 'http://host.docker.internal:5001/api/logs',
    device_id: device_id,
    ip: process.env.IP || device_ip,
    port: device_port
}


servient.start().then((WoT) => {
    WoT.produce(description_json).then((thing) => {

        // initialize property values
        let properties_dict: PropertiesDict = initializePropertyValues(description_json.properties);
        let actions_dict: ActionsDict = description_json.actions;
        let events_dict: EventsDict = description_json.events;


        // For each property in config_backup.json, overwrite the default read/write handlers
        for (let property in description_json.properties) {
            thing.setPropertyWriteHandler(property, async (val) => {
                properties_dict[property].value = await val.value();
                sendLog(LogType.PROPERTY_CHANGED, properties_dict[property], logging_info);
            });
            thing.setPropertyReadHandler(property, async () => {
                sendLog(LogType.PROPERTY_READ, properties_dict[property], logging_info);
                return properties_dict[property].value;
            });
        }


        // For each action in config_backup.json, overwrite the default action handler
        for (let action_name in actions_dict) {
            thing.setActionHandler(action_name, async (_params, options) => {
                sendLog(LogType.ACTION_CALLED, action_name, logging_info);
                let action = actions_dict[action_name];
                let action_list = action.action_list;
                console.log(action);

                // Check if uriVariables are provided
                let variables:  VariablesDict = {};
                if (options && typeof options === "object" && "uriVariables" in options) {
                    variables = options.uriVariables;
                    console.log(variables);
                }

                // Execute the action
                await executeMethodActions(properties_dict, thing, action_list, variables);
            });
        }

        // For each event in config_backup.json, overwrite the default event handler
        for (let event_name in events_dict) {
            thing.setEventSubscribeHandler(event_name, async () => {
                sendLog(LogType.EVENT_SUBSCRIBED, event_name, logging_info);
                // now handle the event subscription?
            });
        }

        // Finally expose the thing
        thing.expose().then(() => {
            sendLog(LogType.CREATED, thing.getThingDescription(), logging_info)
            console.info(`${thing.getThingDescription().title} ready`);
        });

    }).catch((e) => {
        console.log(e);
    });
}).catch((e) => {
    console.log(e);
});