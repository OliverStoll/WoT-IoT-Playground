import {ExecuteActionData} from "../actions";
import {LogType, sendLog} from "../../logging/logging";
import {logging_info} from "../../device";

export async function execute_action_make_request(execute_action_data: ExecuteActionData) {
    // check if url present variables
    let variables = execute_action_data.variables as unknown as { url: string, method: string };
    let url = variables['url'];
    let method = variables['method'];
    let body = variables['body'];
    // take the substring between the thrird and fourth '/' to get the device id
    let device_id = url.split('/')[3];

    // append url with id as caller query param, if method is not GET
    if (method !== 'GET') {
        url += `?caller=${execute_action_data.thing.title}`;
    }

    console.log(`Making ${method} request to ${url}`);

    // make a fetch get request to the url
    let return_data_string = await fetchData(url, method, body).then(data => {
        return data;
    })

    // check if the substring 'event' is in the url
    if (url.includes('event')) {
        console.log(`EVENT received from ${url}`);
        // split the url by the last '/' and get the last element
        let event_name = url.split('/').pop();
        let event_data = {device_id: device_id, event_name: event_name};
        sendLog(LogType.EVENT_RECEIVED, event_data, logging_info);
    }

    // parse the return data
    let return_data;
    try {
        return_data = JSON.parse(return_data_string);
    } catch (error) {
        return_data = return_data_string;
    }

    return return_data;
}


async function fetchData(url: string, method: string, body=undefined): Promise<any> {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(body),
        });
        return await response.json();
    } catch (error) {
        // catch json parse error
        if (error instanceof SyntaxError && error.message === "Unexpected end of JSON input" && method === "PUT") {
            console.log("No JSON returned from PUT request.");
            // as this happens for set properties, return a string
            return "Success";
        } else {
            console.error(error);
        }
    }
}