import {ProtocolInterface} from "../interfaces/protocolInterface";
import {HttpProtocol} from "../protocols/httpProtocol";

function sendRequest(href): any {
    // handler for http wot devices
    if(href.split('://')[0]=='http'){

        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)
        protocol.receive(href).then(response => {
            let resp = JSON.parse(response)
            console.log(resp)
            return resp
        }).catch(error => {
            console.error(error)
        })
    }
    // TODO implement other protocols
    else{
        return "Error: Only Http implemented. Add more protocols by extending the ProtocolInterface"
    }
}

module.exports = sendRequest;