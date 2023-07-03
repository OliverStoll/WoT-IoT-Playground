import { Router } from 'express';
const callRouter = new Router();
const sendRequest = require('../utils/sendRequest')


callRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    sendRequest(req.body).then(resp => {
        let parsedResponse = ""
        if(resp){
            parsedResponse = JSON.stringify(JSON.parse(resp))
        }
        res.status(200).send(parsedResponse)
    })


})

module.exports = callRouter;