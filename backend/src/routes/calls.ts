import { Router } from 'express';
const callRouter = new Router();
const sendRequest = require('../utils/sendRequest.ts')


callRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const { href } = req.body;
    sendRequest(href).then(resp => {
        res.status(200).send(JSON.stringify(JSON.parse(resp)))
    })


})

module.exports = callRouter;