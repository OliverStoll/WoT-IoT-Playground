const express = require('express');
const fs = require('fs');

const app = express();
const paths = ['/temperature', '/state']; // Replace this with your list of paths

for (const path of paths) {
  app.get(path, (req, res) => {
    res.send(`This is ${path}`);
  });
}

// get the environment variable for the port and convert to number
const PORT = Number(process.env.PORT) || 3000;
const DEVICE_IDX = Number(process.env.DEVICE_IDX) || 0;

// get the device from the scenario
const scenario = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const device = scenario.devices[DEVICE_IDX];
console.log(device);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
