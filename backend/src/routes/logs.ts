const createLog = require('../utils/logger.ts')
import {Router} from 'express'
const logRouter = new Router()


let logs: string[] = [];
let thingDescriptions: string[] = [];


logRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }
    const jsonData = req.body;
    const { type } = jsonData;
    if(type == 'created'){
        thingDescriptions.push(JSON.stringify(jsonData.payload))
        console.log(thingDescriptions)
    }
    const logText = createLog(jsonData)
    if(!logText){
        res.status(400).send('Unknown type')
        return;
    }
    else{
        console.log(logText)
        logs.push(logText)
        res.status(200).send("Log added successfully!")
    }

});

logRouter.get('/', (req, res) => {
    if (logs.length > 0) {
        res.send(logs.join(';'));
    }
    else {
        res.send("No logs available yet")
    }
});

logRouter.get('/thingDescriptions', (req, res)=>{
    res.send(thingDescriptions)
})


module.exports = logRouter;