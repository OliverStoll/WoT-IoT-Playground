import {ProtocolInterface} from "../interfaces/protocolInterface";
import {HttpProtocol} from "../protocols/httpProtocol";

async function sendRequest(href) {
    // handler for http wot devices
    if(href.split('://')[0]=='http'){
        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)
        return await protocol.receive(href)

    }
    // TODO implement other protocols
    else{
        return "Error: Only Http implemented. Add more protocols by extending the ProtocolInterface"
    }
}

module.exports = sendRequest;