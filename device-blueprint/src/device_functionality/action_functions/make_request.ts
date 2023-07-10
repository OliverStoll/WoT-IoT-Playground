import {ExecuteActionData} from "../actions";

export async function execute_action_make_request(execute_action_data: ExecuteActionData) {
    console.log(execute_action_data.thing.title)
    // check if url present variables
    let variables = execute_action_data.variables as unknown as { url: string, method: string };
    let url = variables['url'];
    let method = variables['method'];

    // append url with id as caller query param, if method is not GET
    if (method !== 'GET') {
        url += `?caller=${execute_action_data.thing.id}`;
    }

    console.log(`Making ${method} request to ${url}`);

    // make a fetch get request to the url
    await fetchData(url, method).then(data => {
        console.log(`Got data from ${url}: ${data}`);
        // TODO: somehow pass the data back or log it?
        return data;
    })
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
        console.error(error);
    }
}