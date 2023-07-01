const fs = require("fs");


export function get_device_scenario_file(config_path: string = "./mount_volume/scenario.json", backup_path: string = "./scenario_backup.json") {

    // check if scenario.json exists
    let scenario;
    if (fs.existsSync(config_path)) {
        console.log(`Mounted file used from ${config_path}.\n`)
        scenario = JSON.parse(fs.readFileSync(config_path, "utf-8"));
    } else {
        console.log(`Scenario file not found at ${config_path}.\n`);
        scenario = JSON.parse(fs.readFileSync(backup_path, "utf-8"));
    }

    // get the scenario for this device
    let device_idx = Number(process.env.DEVICE_IDX);
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
