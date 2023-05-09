const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const configRouter = require('./routes/config.ts');

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`${req.method} request received for URL: ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Success. This is the backend.');
});

app.get('/api/logs', (req, res) => {
    res.send('[Kaffeemaschine]Request sent to logs-endpoint;[Kühlschrank]Uga1;[Lampe]Uga2;[Kühlschrank]Uga33;[Kaffeemaschine]Request sent to logs-endpoint;[Kühlschrank]Uga1;[Lampe]Uga2;[Kühlschrank]Uga33;[Kaffeemaschine]Request sent to logs-endpoint;[Kühlschrank]Uga1;[Lampe]Uga2;[Kühlschrank]Uga33;[Kaffeemaschine]Request sent to logs-endpoint;[Kühlschrank]Uga1;[Lampe]Uga2;[Kühlschrank]Uga33');
});

app.use('/api/config', configRouter);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
