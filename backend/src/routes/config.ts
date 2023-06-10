const path = require('path')
const express = require('express');
const fs = require('fs')
const shell = require('shelljs')

const configRouter = express.Router();

let fileName: string = ""
let config: string = ""


configRouter.post('/', (req, res) => {
    if (req.get("Content-Type") === "application/json"){
        fileName = path.join(__dirname, '../../../wot-blueprint/config.json');
        let config_raw = req.body

        //TODO add log_server URLs for other Protocols
        config_raw['log_server'] = "http://host.docker.internal:5001/api/logs"
        config = JSON.stringify(config_raw)

    }
    fs.writeFile(fileName, config, (err) => {
        if (err || config === "") {
            console.log("Error: Could not save configuration file!");
            res.status(500).send("Error: Could not save configuration file!");
            return;
        }
        console.log(`Config saved to file ${fileName}`);
    });

    // parse number of devices of config.json via shell
    const numDevices = JSON.parse(config).devices.length
    console.log(`Devices: ${numDevices}`);

    // Check if wot image already available locally
    if (!shell.exec('docker image inspect wot-device', { silent: true }).stdout) {
        console.log('wot-device image not found locally. Building the image...');
        shell.cd('../../wot-blueprint');
        shell.exec('docker build -t wot-device .', { silent: true });
        shell.cd('-');
    }

    for (let i: number = 0; i < numDevices; i++) {
        // start docker containers: works for 1-99 wot devices
        const port: string = i < 10 ? `300${i}` : `30${i}`;
        const dockerRunCommand: string = `docker run -d -p ${port}:${port} -e PORT=${port} -e DEVICE_IDX=${i} wot-device`;
        shell.exec(dockerRunCommand);
        console.log(`Running docker id ${i}`);
    }
    res.status(200).send('Config was processed!');
    shell.exec('sleep 6')

});

configRouter.get('/', (req, res): void => {
    if (fs.existsSync(fileName)) {
        // send config.json if is exists
        const fileContent = fs.readFileSync(fileName, 'utf8');
        const config = JSON.parse(fileContent);
        res.send(config);
    } else {
        // send 404 if config was not uploaded yet
        res.status(404).send('No config file found');
    }
});

module.exports = configRouter;