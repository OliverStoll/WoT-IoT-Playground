const express = require('express');
const router = express.Router();

let logs = [];


router.post('/', (req, res) => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const { type } = req.body;
    const jsonData = req.body;
    const timestamp = new Date().toISOString();
    const hostID = jsonData.host.id
    switch (type) {
        case 'property':
            const callerIP = jsonData.caller.ip;
            const callerPort = jsonData.caller.port;
            const payloadName = jsonData.payload.name;
            const payloadValue = jsonData.payload.value;
            const logText = `${timestamp},${hostID},property ${payloadName} was changed to ${payloadValue} by ${callerIP}:${callerPort}`;
            logs.push(logText)
            console.log(logText)
            res.status(200).send("Log added successfully!")
            break;
        case 'action':
            console.log("Action called: Not implemented yet")
            res.status(501).send("Action called: Not implemented yet")
            break;
        case 'event':
            console.log("Event called: Not implemented yet")
            res.status(501).send("Event called: Not implemented yet")
            break;
        case 'created':
            console.log("ITs a created type")
            res.status(200).send("Log added successfully!")
            break;
        case 'deleted':
            console.log("Deletion called: Not implemented yet")
            res.status(501).send("Deletion called: Not implemented yet")
            break;
        default:
            res.status(400).send('Unknown type');
            return;
    }

});

router.get('/', (req, res) => {
    if (logs.length > 0) {
        res.send(logs.join(';'));
    }
    else {
        res.send("No logs available yet")
    }
});


module.exports = router;