import { Router } from 'express';
const callRouter = new Router();

import {HttpProtocol} from "../protocols/httpProtocol";
import {ProtocolInterface} from "../interfaces/protocolInterface";
callRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const { href } = req.body;

    // handler for http wot devices
    if(href.split('://')[0]=='http'){

        const protocol: ProtocolInterface = new HttpProtocol(this, 5001)
        protocol.receive(href).then(response => {
            let resp = JSON.parse(response)
            console.log(resp)
            res.status(200).send(resp)
        }).catch(error => {
            console.error(error)
        })
    }

})

module.exports = callRouter;