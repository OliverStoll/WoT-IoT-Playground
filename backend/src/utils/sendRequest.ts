import {ProtocolInterface} from "../interfaces/protocolInterface"
import {HttpProtocol} from "../protocols/httpProtocol"

/**
 * Sends a request to a web of things (WoT) device.
 *
 * @param data - The request data, including the URL and method.
 * @returns A Promise that resolves to the response as a string.
 */
async function sendRequest(data: { href: string, 'htv:methodName'?: string }): Promise<string> {
    // Handler for HTTP WoT devices
    const { href } = data
    const method: string = data['htv:methodName']
    let response: string = ""

    if (href.split('://')[0] == 'http') {
        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)

        if (!method || method === "GET") {
            response = await protocol.receive(href)
        } else {
            protocol.send(href, data)
        }
    } else {
        // TODO: Implement other protocols
        return "Error: Only HTTP implemented. Add more protocols by extending the ProtocolInterface"
    }

    // Check if the response object is valid JSON to avoid backend crashes
    try {
        JSON.parse(response)
    } catch (e) {
        console.log(`No response from URL: ${href}`)
        response = ""
    }

    return response
}

export = sendRequest
