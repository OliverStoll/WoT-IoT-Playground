const express = require('express');
import {Application} from 'express'
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')

import {ProtocolInterface} from "./interfaces/protocolInterface";
import {HttpProtocol} from "./protocols/httpProtocol";

//initialize the express app
const app: Application = express()
const httpPort: string | 5001 = process.env.PORT || 5001;

// for communication with the frontend use HTTP
const protocol: ProtocolInterface = new HttpProtocol(app, httpPort)
protocol.connect()

const configRouter = require('./routes/config.ts');
const logRouter = require('./routes/logs.ts');

dotenv.config();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`${req.method} request: ${req.url}`)
    next()
})

app.get('/', (req, res) => {
    res.send("Success")
})

app.use('/api/config', configRouter);
app.use('/api/logs', logRouter);


// npm run start:dev
// npm run build
// npm run start

// start the server


