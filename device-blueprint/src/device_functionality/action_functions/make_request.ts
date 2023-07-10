import {ExecuteActionData} from "../actions";

export async function execute_action_make_request(execute_action_data: ExecuteActionData) {
    // check if url present variables
    let variables = execute_action_data.variables as unknown as { url: string, method: string };
    let url = variables['url'];
    let method = variables['method'];
    let header = JSON.parse(`{'Content-Type': 'application/json', 'caller': ${execute_action_data.thing.id}}`);

    // append url with id as caller query param, if method is not GET
    if (method !== 'GET') {
        url += `?caller=${execute_action_data.thing.id}`;
    }

    console.log(`Making ${method} request to ${url}`);

    // make a fetch get request to the url
    await fetchData(url, method, header).then(data => {
        console.log(`Got data from ${url}: ${data}`);
        // TODO: somehow pass the data back or log it?
        return data;
    })
}


async function fetchData(url: string, method: string, headers: any, body="", ): Promise<any> {
    try {
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(body),
        });
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}