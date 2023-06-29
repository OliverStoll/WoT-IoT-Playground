const fs = require("fs");


export function loadScenarioFile(config_path: string = "./config_backup.json") {
    // TODO: change to get from mount
    let scenario = JSON.parse(fs.readFileSync(config_path, "utf-8"));

    // add a shutdown action to the scenario
    scenario["actions"]["shutdown"] = {
        "description": "Shutdown the device. This action is automatically added to the scenario.",
        "action_list": [
            {
                "action_type": "shutdown",
            },
        ],
    }

    // add a make_request action to the scenario
    scenario["actions"]["make_request"] = {
        "description": "Make a request to a remote device. This action is automatically added to the scenario.",
        "uriVariables": {
            "url": {
                "type": "string",
                "description": "The URL / Port to make the request to.",
            },
            "method": {
                "type": "string",
                "description": "The HTTP method to use.",
            }
        },
        "action_list": [
            {
                "action_type": "make_request",
                "variable": "url",
            },
        ],
    }

    return scenario;
}
