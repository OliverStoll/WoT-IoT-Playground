import {ProtocolInterface} from "../interfaces/protocolInterface";
import {HttpProtocol} from "../protocols/httpProtocol";

async function sendRequest(href) {
    // handler for http wot devices
    if(href.split('://')[0]=='http'){

        console.log(`sendRequest.ts: href ${href}`)
        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)
        let final_response = await protocol.receive(href)
        console.log("FINAL: ", final_response)
        return final_response



        // protocol.receive(href).then(response => {
        //     console.log(`sendRequest.ts response:  ${typeof response}`)
        //     // let resp = JSON.parse(response)
        //     if(response == undefined){
        //         return "Error: response from device not work"
        //     }
        //     console.log(`sendRequest.ts response:  ${response}`)
        //     final_response = response
        //     return response
        // }).catch(error => {
        //     console.error(error)
        // })

    }
    // TODO implement other protocols
    else{
        return "Error: Only Http implemented. Add more protocols by extending the ProtocolInterface"
    }
}

module.exports = sendRequest;