const path = require('path');
const express = require('express');
const fs = require('fs');
const shell = require('shelljs');

const configRouter = express.Router();

// Path of the WoT config file
let fileName: string = '';

// WoT config file parsed to string
let config: string = '';

/**
 * Handle POST request to /api/config to receive and process the configuration file.
 * config file is saved to wot-blueprint
 * docker containers are started according to config file
 */
configRouter.post('/', (req, res) => {
    if (req.get('Content-Type') === 'application/json') {
        fileName = path.join(__dirname, '../../../wot-blueprint/config.json');
        let configRaw = req.body;

        // TODO: Add log_server URLs for other protocols
        configRaw['log_server'] = 'http://host.docker.internal:5001/api/logs';
        config = JSON.stringify(configRaw);
    }

    fs.writeFile(fileName, config, (err) => {
        if (err || config === '') {
            console.log('Error: Could not save configuration file!');
            res.status(500).send('Error: Could not save configuration file!');
            return;
        }
        console.log(`Config saved to file ${fileName}`);
    });

    // Parse the number of devices from config.json
    const numDevices = JSON.parse(config).devices.length;
    console.log(`Devices: ${numDevices}`);

    // Check if wot-device image is already available locally
    if (!shell.exec('docker image inspect wot-device', { silent: true }).stdout) {
        console.log('wot-device image not found locally. Building the image...');
        shell.cd('../../wot-blueprint');
        shell.exec('docker build -t wot-device .', { silent: true });
        shell.cd('-');
    }

    for (let i: number = 0; i < numDevices; i++) {
        // Start Docker containers: works for 1-99 WoT devices
        const port: string = i < 10 ? `300${i}` : `30${i}`;
        const dockerRunCommand: string = `docker run -d -p ${port}:${port} -e PORT=${port} -e DEVICE_IDX=${i} wot-device`;
        shell.exec(dockerRunCommand);
        console.log(`Running Docker id ${i}`);
    }

    res.status(200).send('Config was processed!');
    shell.exec('sleep 6');
});

/**
 * Handle GET request to /api/config to retrieve the configuration file.
 */
configRouter.get('/', (req, res) => {
    if (fs.existsSync(fileName)) {
        // Send config.json if it exists
        const fileContent = fs.readFileSync(fileName, 'utf8');
        const config = JSON.parse(fileContent);
        res.send(config);
    } else {
        // Send 404 if config was not uploaded yet
        res.status(404).send('No config file found');
    }
});

module.exports = configRouter;
