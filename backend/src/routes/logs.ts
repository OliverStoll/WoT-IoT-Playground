const createLog = require('../utils/logger')
import { Router } from 'express'
const logRouter = new Router()

// All logs are stored in a string array
let logs: string[] = []

// All Thing Description JSON objects are stored in a string array
let thingDescriptions: string[] = []

/**
 * @swagger
 * /api/logs:
 *   post:
 *     summary: Receive and process log data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of log data
 *                 example: 'property_changed'
 *               host:
 *                 type: string
 *                 description: The thing sending the log
 *                 example: "Coffee-machine"
 *               caller:
 *                  type: object
 *                  properties:
 *                     ip:
 *                      type: string
 *                      example: "172.0.0.1"
 *                     port:
 *                      type: string
 *                      example: "3000"
 *               payload:
 *                 type: object
 *                 description: The log data payload
 *                 properties:
 *                  name:
 *                      type: string
 *                      example: temperature
 *                  value:
 *                      type: string
 *                      example: 33
 *
 *     responses:
 *       '200':
 *         description: Log added successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Log added successfully!
 *       '400':
 *         description: Empty request body or unknown type
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Empty request body or unknown type
 */
logRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return
    }

    const jsonData = req.body
    const { type } = req.body

    if (type == 'created') {
        // Handle 'created' type, which represents a new Thing Description
        thingDescriptions.push(JSON.stringify(jsonData.payload))
        console.log(thingDescriptions)
    }

    const logText: string = createLog(jsonData)

    if (!logText) {
        res.status(400).send('Unknown type')
        return
    } else {
        console.log(logText)
        logs.push(logText)
        res.status(200).send('Log added successfully!')
    }
});

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Get logs
 *     description: Retrieve all logs as a string seperated by ;
 *     responses:
 *       200:
 *         description: Successful response with logs
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Log1;Log2;Log3
 *     produces:
 *       - text/plain
 */
logRouter.get('/', (req, res): void => {
    if (logs.length > 0) {
        res.send(logs.join(';'))
    } else {
        res.send('No logs available yet')
    }
})



/**
 * @swagger
 * /api/logs/thingDescriptions:
 *   get:
 *     summary: Get thing descriptions
 *     description: Retrieve all thing descriptions
 *     responses:
 *       200:
 *         description: Successful response with thing descriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Thing description of thing
 *                 example: {"@context":["https://www.w3.org/2019/wot/td/v1","https://www.w3.org/2022/wot/td/v1.1",{"@language":"en"}],"@type":"Thing","title":"Coffee-machine","securityDefinitions":{"nosec_sc":{"scheme":"nosec"}},"security":["nosec_sc"],"properties":{"temperature":{"type":"number","description":"Current temperature of the coffee machine","startValue":0,"forms":[{"href":"http://localhost:3000/coffee-machine/properties/temperature","contentType":"application/json","op":["readproperty","writeproperty"]},{"href":"http://localhost:3000/coffee-machine/properties/temperature","contentType":"application/cbor","op":["readproperty","writeproperty"]}],"readOnly":false,"writeOnly":false,"observable":false}},"actions":{"brew_coffee":{"description":"Sets the temperature of the coffee machine using an action","temperature":{"type":"integer","description":"Temperature to set the coffee machine to","minimum":0,"maximum":100},"action_list":[{"action_type":"set","property":"temperature","value":97}],"forms":[{"href":"http://localhost:3000/coffee-machine/actions/brew_coffee","contentType":"application/json","op":["invokeaction"],"htv:methodName":"POST"},{"href":"http://localhost:3000/coffee-machine/actions/brew_coffee","contentType":"application/cbor","op":["invokeaction"],"htv:methodName":"POST"}],"idempotent":false,"safe":false},"shutdown":{"description":"Shutdown the device. This action is automatically added to the scenario.","action_list":[{"action_type":"shutdown"}],"forms":[{"href":"http://localhost:3000/coffee-machine/actions/shutdown","contentType":"application/json","op":["invokeaction"],"htv:methodName":"POST"},{"href":"http://localhost:3000/coffee-machine/actions/shutdown","contentType":"application/cbor","op":["invokeaction"],"htv:methodName":"POST"}],"idempotent":false,"safe":false},"make_request":{"description":"Make a request to a remote device. This action is automatically added to the scenario.","uriVariables":{"url":{"type":"string","description":"The URL / Port to make the request to."},"method":{"type":"string","description":"The HTTP method to use."}},"action_list":[{"action_type":"make_request","variable":"url"}],"forms":[{"href":"http://localhost:3000/coffee-machine/actions/make_request{?url,method}","contentType":"application/json","op":["invokeaction"],"htv:methodName":"POST"},{"href":"http://localhost:3000/coffee-machine/actions/make_request{?url,method}","contentType":"application/cbor","op":["invokeaction"],"htv:methodName":"POST"}],"idempotent":false,"safe":false}},"events":{"temperatureSet":{"description":"Temperature set event","data":{"type":"string"},"forms":[{"href":"http://localhost:3000/coffee-machine/events/temperatureSet","contentType":"application/json","subprotocol":"longpoll","op":["subscribeevent","unsubscribeevent"]},{"href":"http://localhost:3000/coffee-machine/events/temperatureSet","contentType":"application/cbor","subprotocol":"longpoll","op":["subscribeevent","unsubscribeevent"]}]}},"id":"urn:uuid:0cf493c5-af7f-4127-b995-c00f467b7898","description":"A smart coffee machine with a range of capabilities","forms":[{"href":"http://localhost:3000/coffee-machine/properties","contentType":"application/json","op":["readallproperties","readmultipleproperties","writeallproperties","writemultipleproperties"]},{"href":"http://localhost:3000/coffee-machine/properties","contentType":"application/cbor","op":["readallproperties","readmultipleproperties","writeallproperties","writemultipleproperties"]}]}
 *     produces:
 *       - application/json
 */
logRouter.get('/thingDescriptions', (req, res): void => {
    res.send(thingDescriptions)
})

module.exports = {logRouter, thingDescriptions, logs}
