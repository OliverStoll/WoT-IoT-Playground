const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors')
const bodyParser = require('body-parser')

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello from the backend!');
});

app.post('/api/config', (req, res) => {

    const  config  = req.body;
    // Hier kannst du den config-JSON-String weiterverarbeiten
    console.log(config);
    res.send('Config was processed!');
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
