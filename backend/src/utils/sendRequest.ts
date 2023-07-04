import {ProtocolInterface} from "../interfaces/protocolInterface";
import {HttpProtocol} from "../protocols/httpProtocol";

async function sendRequest(data) {
    // handler for http wot devices
    const { href } = data
    const method = data['htv:methodName']

    if(href.split('://')[0]=='http'){
        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)
        if(!method){
            return await protocol.receive(href)
        }
        else{
            return protocol.send(href, data);
        }

    }
    // TODO implement other protocols
    else{
        return "Error: Only Http implemented. Add more protocols by extending the ProtocolInterface"
    }
}

module.exports = sendRequest;