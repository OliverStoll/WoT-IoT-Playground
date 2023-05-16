const express = require('express');
const fs = require('fs');
const app = express();

// get the environment variable for the port and convert to number
const PORT = Number(process.env.PORT) || 3000;
const DEVICE_IDX = Number(process.env.DEVICE_IDX) || 0;
// get the device from the scenario
const scenario = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const device = scenario.devices[DEVICE_IDX];
console.log(device);


const properties = device.properties;

for (const property in properties) {
  console.log(`Adding property ${property}`);
  app.get('/property/' + property, (req, res) => {
    res.send(`This is ${property}`);
    let payload = {
      property: property,
      value: "This is " + property  // TODO: get the actual value
    }
    sendLog('property_called', req, payload);
  });
}


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// function that logs any incoming request, or device logs such as creation, deletion, etc.
function sendLog(log_type: string, req: any, payload: any) {
  // create a log object that includes my device id, the type of log, and the time
  const log = {
    type: log_type,
    host: {
      id: device.id,
      // TODO: get own devices ip
      ip: "localhost",
      port: PORT
    },
    payload: payload,
  }

  // check if the request is a device log or a property call (by checking if _called is in type)
  if (log_type.includes('_called')) {
    // add the caller to the log
    log['caller'] = {
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      port: req.headers['x-forwarded-port'] || req.connection.remotePort
    }
  }
  console.log(log);

  // send the log to the log server
  const log_server = scenario.log_server
  postDataToApi(log_server, log)
    .then(() => {
      console.log("Log sent to log server");
    })
    .catch((error) => {
      console.log(error);
    });
}

async function postDataToApi(url: string, payload: any): Promise<void> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json',},
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} - ${response.statusText}`);
  }
}