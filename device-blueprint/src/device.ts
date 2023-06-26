// An accompanying tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.
const fs = require("fs");
const {Servient} = require("@node-wot/core");
const {HttpServer} = require("@node-wot/binding-http");
const {executeMethodActions} = require('./device_actions/action_logic.js');

// create Servient and add HTTP binding
const servient = new Servient();
servient.addServer(new HttpServer());

// load config.json file
let description_json = JSON.parse(fs.readFileSync("../config.json", "utf-8"));

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
    action_type: string;
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

// for each property in config.json, initialize the property values
function initializePropertyValues(properties_dict: PropertiesDict): PropertiesDict {

  for (let property_name in properties_dict) {
    let property: _Property = properties_dict[property_name];

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


servient.start().then((WoT) => {
    WoT.produce(description_json).then((thing) => {

        // initialize property values
        let properties_dict: PropertiesDict = initializePropertyValues(description_json)
        let actions_dict: ActionsDict = description_json.actions;
        let events_dict: EventsDict = description_json.events;


        // For each property in config.json, overwrite the default read/write handlers
        for (let property in description_json.properties) {
            thing.setPropertyWriteHandler(property, async (val) => {
                properties_dict[property].value = await val.value();
            });
            thing.setPropertyReadHandler(property, async () => {
                return properties_dict[property].value;
            });
        }


        // For each action in config.json, overwrite the default action handler
        for (let action_name in actions_dict) {
            thing.setActionHandler(action_name, async (_params, options) => {

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

        // Finally expose the thing
        thing.expose().then(() => {
            console.info(`${thing.getThingDescription().title} ready`);
        });


    }).catch((e) => {
        console.log(e);
    });
}).catch((e) => {
    console.log(e);
});