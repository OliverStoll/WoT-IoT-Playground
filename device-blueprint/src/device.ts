// An accompanying tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.
// noinspection TypeScriptValidateJSTypes

import {initialize_servient} from "./device_functionality/servient";
import {get_device_scenario_file} from "./device_functionality/scenario";
import {initializeLoggingInfo, LogType, sendLog} from "./logging/logging";
import {initializePropertyValues} from "./device_functionality/properties";
import {ExposedThing} from "@node-wot/core";

const {executeMethodActions} = require('./device_functionality/actions');

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
export enum ActionStepType {
    SET = "set",
    INCREMENT = "increment",
    SLEEP = "sleep",
    EMIT = "emit_event",
    CONDITION = "condition",
    SHUTDOWN = "shutdown",
    MAKE_REQUEST = "make_request"
}
export interface ActionStep {
    action_type: ActionStepType;
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



function setPropertyHandler(thing: ExposedThing, properties_dict: PropertiesDict) {
    /** For each property in config_backup.json, overwrite the default read/write handlers **/
    for (let property in properties_dict) {
        thing.setPropertyWriteHandler(property, async (val) => {
            properties_dict[property].value = await val.value() as number | boolean | string;
            sendLog(LogType.PROPERTY_CHANGED, properties_dict[property], logging_info);
        });
        thing.setPropertyReadHandler(property, async () => {
            sendLog(LogType.PROPERTY_READ, properties_dict[property], logging_info);
            return properties_dict[property].value;
        });
    }
}

function setActionHandler(thing: any, actions_dict: ActionsDict, properties_dict: PropertiesDict) {
    for (let action_name in actions_dict) {
        thing.setActionHandler(action_name, async (_params, options) => {

            let action = actions_dict[action_name];
            let action_list = action.action_list;
            console.log(`ACTION [${action_name}]`);
            // Check if uriVariables are provided

            let caller;
            let variables:  object = {};
            if (options && typeof options === "object" && "uriVariables" in options) {
                variables = options.uriVariables;

                // if caller variable is provided, log it
                if ("caller" in variables) {
                    caller = variables["caller"] as string;
                    console.log(`Caller: ${caller}`);
                }
            }

            // Log the action call
            sendLog(LogType.ACTION_CALLED, action_name, logging_info, caller);

            // Execute the action
            await executeMethodActions(properties_dict, thing, action_list, variables);
        });
    }
}

function setEventHandler(thing: any, events_dict: EventsDict) {
    for (let event_name in events_dict) {
        thing.setEventSubscribeHandler(event_name, async () => {
            sendLog(LogType.EVENT_SUBSCRIBED, event_name, logging_info);
            // now handle the event subscription?
        });
    }
}


// set the protocol(s) to use and the port for the exposed thing
const protocols = ["http"];
const device_port = Number(process.env.PORT) || 3000;

// create Servient and add binding with port
let scenario_json = get_device_scenario_file();
export let logging_info = initializeLoggingInfo(scenario_json, device_port);
let servient = initialize_servient(protocols, device_port);




servient.start().then((WoT) => {
    WoT.produce(scenario_json).then((thing) => {
        // initialize all properties, actions and events from the scenario file
        let properties_dict: PropertiesDict = initializePropertyValues(scenario_json.properties);
        let actions_dict: ActionsDict = scenario_json.actions;
        let events_dict: EventsDict = scenario_json.events;

        // Set the handlers for properties, actions and events according to the scenario file
        setPropertyHandler(thing, properties_dict)
        setActionHandler(thing, actions_dict, properties_dict)
        setEventHandler(thing, events_dict)

        // Finally expose the thing
        thing.expose().then(() => {
            // replace ip address with localhost as the ip address is not accessible from the outside of the container
            let thing_description_string = JSON.stringify(thing.getThingDescription());  // td is a json object
            let ip = logging_info.ip;
            let localhost_thing_description = thing_description_string.replace(new RegExp(ip, 'g'), 'localhost');
            let localhost_thing_description_json = JSON.parse(localhost_thing_description);

            sendLog(LogType.CREATED, localhost_thing_description_json, logging_info)
            console.info(`${thing.getThingDescription().title} ready`);
        });

    }).catch((e) => {console.log(e)});
}).catch((e) => {console.log(e)});