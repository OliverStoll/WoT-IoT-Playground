const express = require('express');
const fs = require('fs');
const app = express();
const { sendLog } = require('./util/requests');
const { extractThingDescription } = require('./util/thing_utility');

// get the environment variable for the port and convert to number
let IP = process.env.IP || 'localhost';
const PORT = Number(process.env.PORT) || 3000;
const IP_PORT = `${IP}:${PORT}`;
const DEVICE_IDX = Number(process.env.DEVICE_IDX) || 0;
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const device_config = config.devices[DEVICE_IDX];
const thing_description = extractThingDescription(device_config, IP_PORT);
const logging_info = {
    log_server: config.log_server,
    device_id: device_config.id,
    ip: IP,
    port: PORT
}

// check if run in docker or not
if (process.env.DOCKER === 'true') {
    console.log('Running in docker environment');
}
else {
    console.log('Running in local environment');
}

console.log(device_config);
app.listen(PORT, () => {console.log(`Server listening on port ${PORT}`);});


// log the creation of the device
sendLog('created', null, thing_description, logging_info);

const properties = device_config.properties;

for (const property in properties) {
  console.log(`Adding property ${property}`);
  app.get('/property/' + property, (req, res) => {
    res.send(`This is ${property}`);
    let payload = {
      property: property,
      value: "This is " + property  // TODO: get the actual value
    }
    sendLog('property_called', req, payload, logging_info);
  });
}





