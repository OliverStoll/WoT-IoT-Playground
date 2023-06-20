// An accompanying tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.
const fs = require("fs");
const {Servient} = require("@node-wot/core");
const {HttpServer} = require("@node-wot/binding-http");

// create Servient and add HTTP binding
const servient = new Servient();
servient.addServer(new HttpServer());

// load config.json file
let description_json = JSON.parse(fs.readFileSync("config.json"));


// for each property in config.json, initialize the property values
function initializePropertyValues(description_json) {
    let properties_dict = {};
    for (let property_name in description_json.properties) {
        let property = description_json.properties[property_name];

        // initialize property value
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

        let properties_dict = initializePropertyValues(description_json)

        // For each property in config.json, overwrite the default read/write handlers
        for (let property in description_json.properties) {
            thing.setPropertyWriteHandler(property, async (val) => {
                // Check if uriVariables are provided
                properties_dict[property].value = await val.value();
            });

            // Override a read handler for availableResourceLevel property, utilizing the uriVariables properly
            thing.setPropertyReadHandler(property, async (options) => {
                return properties_dict[property].value;
            });
        }


        // Set up a handler for makeDrink action
        thing.setActionHandler("setTemperature", async (_params, options) => {

            // Check if uriVariables are provided
            if (options && typeof options === "object" && "uriVariables" in options) {
                if ("temperature" in options.uriVariables) {
                    properties_dict["temperature"].value = options.uriVariables.temperature;
                }
            }

            // emit event
            thing.emitEvent("temperatureSet", properties_dict["temperature"].value);
        });


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