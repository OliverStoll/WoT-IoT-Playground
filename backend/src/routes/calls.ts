import { Router } from 'express';
const callRouter = new Router();
const sendRequest = require('../utils/sendRequest.ts')


callRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const { href } = req.body;

    const resp = sendRequest(href)

    if(resp != undefined){
        res.status(200).send(resp)
    }
    else {
        res.status(500).send()
    }

})

module.exports = callRouter;