const { spawn } = require('child_process');
const path = require('path');
const express = require('express');
const fs = require('fs');

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

        const scriptPath = path.join(__dirname, '../start_containers.sh');
        const script = spawn('bash', [scriptPath], {
            detached: true,
        });

        script.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        script.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        script.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            res.status(200).send('Config was processed!');
        });

    });
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
