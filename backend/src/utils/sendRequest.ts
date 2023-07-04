import {ProtocolInterface} from "../interfaces/protocolInterface";
import {HttpProtocol} from "../protocols/httpProtocol";

async function sendRequest(data) {
    // handler for http wot devices
    const { href } = data
    const method = data['htv:methodName']
    let response: string = ""
    if(href.split('://')[0]=='http'){
        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)
        if(!method || method == "GET"){
            response = await protocol.receive(href)

        }
        else{
            protocol.send(href, data);
        }

    }
    // TODO implement other protocols
    else{
        return "Error: Only Http implemented. Add more protocols by extending the ProtocolInterface"
    }

    // check if response object is valid json to avoid backend crashes
    try{
        JSON.parse(response)
    }
    catch (e) {
        console.log(`Response for Request to URL: ${href} is not valid JSON!`)
        response = ""
    }

    return response
}

module.exports = sendRequest;