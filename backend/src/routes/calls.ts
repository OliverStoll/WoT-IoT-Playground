import { Router } from 'express';
const callRouter = new Router();
const sendRequest = require('../utils/sendRequest.ts')


callRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const { href } = req.body;
    console.log(`calls.ts: href:  ${href}`)

    sendRequest(href).then(resp => {
        console.log(`calls.ts: then-> resp${resp}`)
        console.log(typeof resp)
        //console.log()
        res.status(200).send(JSON.parse(resp))
    })


})

module.exports = callRouter;