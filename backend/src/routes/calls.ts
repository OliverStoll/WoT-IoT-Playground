import {Request, Response, Router} from 'express'
const callRouter = new Router()
const sendRequest = require('../utils/sendRequest')

/**
 * @swagger
 * /api/call:
 *   post:
 *     summary: Send a request to a thing to get a property, call an action or trigger an event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               href:
 *                 type: string
 *                 example: 'http://localhost:3000/coffee-machine/property/temperature'
 *                 description: The href to the property/action/event of the thing
 *               'htv:methodName':
 *                 type: string
 *                 example: 'GET'
 *                 description: The method to call
 *               contentType:
 *                 type: string
 *                 example: 'application/json'
 *               value:
 *                 type: string
 *                 description: If updating a property you can set a new value
 *             required:
 *               - href
 *     responses:
 *       '200':
 *         description: Successfully called device
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *             example:
 *               "data": {
 *                   "value": "33"
 *               }
 *       '400':
 *         description: Invalid Request
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: "Empty request body"
 */
callRouter.post('/', (req: Request, res: Response): void => {
    if (!req.body) {
        res.status(400).send('Empty request body')
        return
    }

    // use the send request util
    sendRequest(req.body).then(resp => {
        let parsedResponse: string = ""
        if(resp){
            parsedResponse = JSON.stringify(JSON.parse(resp))
        }
        res.status(200).send(parsedResponse)
    })


})

module.exports = callRouter