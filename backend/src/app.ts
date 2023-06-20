const express = require('express');
import {Application} from 'express'
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')

import {ProtocolInterface} from "./interfaces/protocolInterface";
import {HttpProtocol} from "./protocols/httpProtocol";

// initialize the express app
const app: Application = express()
const httpPort: string | 5001 = process.env.PORT || 5001;

// for communication with the frontend use HTTP
const protocol: ProtocolInterface = new HttpProtocol(app, httpPort)
protocol.connect()

// import the configRouter for handling of wot config files
const configRouter = require('./routes/config');

// import the logRouter for handling of wot logs
const logRouter = require('./routes/logs').logRouter;

// import the callRouter for handling of wot calls
const callRouter = require('./routes/calls')

// import the scriptRouter for handling of the script playbook
const playbookRouter = require('./routes/playbook')


dotenv.config();
app.use(cors());
app.use(bodyParser.json());

// log all incoming requests
app.use((req, res, next): void => {
    console.log(`${req.method} request: ${req.url}`)
    console.log(req.body)
    next()
})


// dummy endpoint to check if backend is running
app.get('/', (req, res): void => {
    res.send("Success: backend is running")
})

// redirect requests to /api/config to the configRouter
app.use('/api/config', configRouter);

// redirect requests to /api/logs to the logRouter
app.use('/api/logs', logRouter);

// redirect requests to /api/call to the callRouter
app.use('/api/call', callRouter)

// redirect requests to /api/script to the playbookRouter
app.use('/api/script', playbookRouter)



