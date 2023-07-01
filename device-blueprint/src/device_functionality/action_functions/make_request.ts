import {ExecuteActionData} from "../actions";
import {fetchData} from "../../logging/logging";

export function execute_action_make_request(execute_action_data: ExecuteActionData) {
    // check if url present variables
    let variables = execute_action_data.variables as unknown as { url: string, method: string };
    let url = variables['url'];
    let method = variables['method'];

    console.log(`Making ${method} request to ${url}`);

    // make a fetch get request to the url  // TODO: use method
    fetchData(url).then(data => {
        console.log(`Got data from ${url}: ${data}`);
        // TODO: somehow pass the data back or log it?
    })
}