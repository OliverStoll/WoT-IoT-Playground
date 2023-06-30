const fs = require("fs");


export function get_device_scenario_file(config_path: string = "./config_backup.json") {
    // TODO: change to get from mount

    // get device_idx from env
    let device_idx = Number(process.env.DEVICE_IDX);
    let scenario = JSON.parse(fs.readFileSync(config_path, "utf-8"));

    // get the scenario for this device
    let device_config = scenario["devices"][device_idx];

    // add a shutdown action to the scenario
    device_config["actions"]["shutdown"] = {
        "description": "Shutdown the device. This action is automatically added to the scenario.",
        "action_list": [
            {
                "action_type": "shutdown",
            },
        ],
    }

    // add a make_request action to the scenario
    device_config["actions"]["make_request"] = {
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

    return device_config;
}
