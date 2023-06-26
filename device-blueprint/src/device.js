// An accompanying tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.
const fs = require("fs");
const {Servient} = require("@node-wot/core");
const {HttpServer} = require("@node-wot/binding-http");
const {executeMethodActions} = require('./device_actions/action_logic.js');

// TODO: Convert to TypeScript

// create Servient and add HTTP binding
const servient = new Servient();
servient.addServer(new HttpServer());

// load config.json file
let description_json = JSON.parse(fs.readFileSync("../config.json", "utf-8"));


// for each property in config.json, initialize the property values
function initializePropertyValues(description_json) {
    // TODO: Convert to TypeScript (figure out type of property.value)
    let properties_dict = {};
    for (let property_name in description_json.properties) {
        let property = description_json.properties[property_name];

        switch (property.type) {
            case "integer":
                property.value = 0;
                break;
            case "number":
                property.value = 0.0;
                break;
            case "boolean":
                property.value = false;
                break;
            case "string":
                property.value = "";
                break;
            default:
                throw new Error(`Unknown type ${property.type}`);
        }
        if (property.hasOwnProperty("startValue")) {
            property.value = property.startValue;
        }

        properties_dict[property_name] = property;
    }
    console.log(properties_dict);
    return properties_dict;
}


servient.start().then((WoT) => {
    WoT.produce(description_json).then((thing) => {

        // initialize property values
        let properties_dict = initializePropertyValues(description_json)
        let actions_dict = description_json.actions;

        // For each property in config.json, overwrite the default read/write handlers
        for (let property in description_json.properties) {
            thing.setPropertyWriteHandler(property, async (val) => {
                properties_dict[property].value = await val.value();
            });
            thing.setPropertyReadHandler(property, async () => {
                return properties_dict[property].value;
            });
        }


        // Set up a handler for makeDrink action
        let action_name = "setTemperature";
        thing.setActionHandler(action_name, async (_params, options) => {

            let action = actions_dict[action_name];
            let action_list = action.action_list;
            console.log(action);

            // Check if uriVariables are provided
            let variables;
            if (options && typeof options === "object" && "uriVariables" in options) {
                variables = options.uriVariables;
                console.log(variables);
            }

            // Execute the action
            await executeMethodActions(properties_dict, thing, action_list, variables);

        });

        // properties_dict["temperature"].value = options.uriVariables.temperature;
        // thing.emitEvent("temperatureSet", properties_dict["temperature"].value);


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