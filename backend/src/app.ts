const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const configRouter = require('./routes/config.ts');
const logRouter = require('./routes/logs.ts');

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`${req.method} request: ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send('Success. This is the backend.');
});

app.use('/api/config', configRouter);

app.use('/api/logs', logRouter);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
