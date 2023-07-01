import {Servient} from "@node-wot/core";
import {HttpServer} from "@node-wot/binding-http";

/** declare other server types here to support them in the future **/
const serverDict = {
    http: HttpServer,
}


export function initialize_servient(protocols: string[], device_port: number = 3000): any {
    let servient = new Servient();

    console.log(protocols)
    for (const protocol of protocols) {
        let server = serverDict[protocol];
        if (server) {
            servient.addServer(new server({port: device_port}));
        }
        else {
            console.log(`Protocol ${protocol} is not supported`);
        }
    }
    return servient;
}

