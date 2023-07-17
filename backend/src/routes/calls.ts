import {Request, Response, Router} from 'express'
const callRouter = new Router()
const sendRequest = require('../utils/sendRequest')
const thingDescriptions = require('./logs').thingDescriptions
const logs = require('./logs').logs
const createLog = require('../utils/logger')
const isRemoteDevice = require('../utils/checkIfExternalDevice')

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
callRouter.post('/', async (req: Request, res: Response): Promise<any> => {
    if (!req.body) {
        res.status(400).send('Empty request body')
        return
    }


    await sendRequest(req.body).then(resp => {
        let parsedResponse: string = ""
        if (resp) {
            parsedResponse = JSON.stringify(JSON.parse(resp))
        }
        // create log in case it is an external device
        const {href, sender} = req.body

        // if local Calls Remote then logs have to be added in another way
        let localCallsRemote: boolean = false
        if(href.includes('?')){
            localCallsRemote = !href.split('?')[1].includes('localhost')
        }
        console.log(localCallsRemote)
        if (isRemoteDevice(href, thingDescriptions) || localCallsRemote) {
            let logObject = {
                type: 'externalLog',
                href: href,
                caller: sender,
                host: {id: 'unknown'},
                thingDescriptions: thingDescriptions,
                payload: parsedResponse
            }
            if(localCallsRemote){
                logObject.href = href.split('url=')[1]
                logs.push(createLog(logObject, href.split('?')[0]))
            }
            else{
                logs.push(createLog(logObject))
            }
        }

        res.status(200).send(parsedResponse)
    })
})

module.exports = callRouter