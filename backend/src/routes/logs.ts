const createLog = require('../utils/logger')
import { Router } from 'express'
const logRouter = new Router()

// All logs are stored in a string array
let logs: string[] = []

// All Thing Description JSON objects are stored in a string array
let thingDescriptions: string[] = []

/**
 * Handle POST request to /api/logs to receive and process log data.
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
 * Handle GET request to /api/logs to retrieve all logs.
 */
logRouter.get('/', (req, res): void => {
    if (logs.length > 0) {
        res.send(logs.join(';'))
    } else {
        res.send('No logs available yet')
    }
})

/**
 * Handle GET request to /api/logs/thingDescriptions to retrieve the current state of the Thing Description list.
 */
logRouter.get('/thingDescriptions', (req, res): void => {
    res.send(thingDescriptions)
})

module.exports = {logRouter, thingDescriptions, logs}
