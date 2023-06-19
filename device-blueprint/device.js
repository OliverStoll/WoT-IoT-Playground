// An accompanying tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.

const fs = require("fs");

// load config.json file
let description_json = JSON.parse(fs.readFileSync("config.json"));

// variables
let temperature;

WoT.produce(description_json).then((thing) => {
    // Initialize the property values
    temperature = 0;

    // Override a write-handler for availableResourceLevel property, utilizing the uriVariables properly
    thing.setPropertyWriteHandler("temperature", async (val, options) => {
        // Check if uriVariables are provided
        temperature = await val.value();
        return;
        if (options && typeof options === "object" && "uriVariables" in options) {
            const uriVariables = options.uriVariables;
            if ("value" in uriVariables) {

                return;
            }
        }
        throw Error(`Please specify temperature variable as uriVariables (value: ${val.value()}. The options were: ${JSON.stringify(options)}`);
    });

    // Override a read handler for availableResourceLevel property, utilizing the uriVariables properly
    thing.setPropertyReadHandler("temperature", async (options) => {
        return temperature;
    });


    // Set up a handler for makeDrink action
    thing.setActionHandler("setTemperature", async (_params, options) => {

        // Check if uriVariables are provided
        if (options && typeof options === "object" && "uriVariables" in options) {
            if ("temperature" in options.uriVariables) {
                temperature = options.uriVariables.temperature;
            }
        }
    });


    console.log(`Produced ${thing.getThingDescription().title}`);

    // Finally expose the thing
    thing.expose().then(() => {
        console.info(`${thing.getThingDescription().title} ready`);
    });

}).catch((e) => {console.log(e);});
