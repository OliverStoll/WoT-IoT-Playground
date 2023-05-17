const { spawn } = require('child_process');
const express = require('express');
const fs = require('fs')

const router = express.Router();

let fileName = ""
let config = ""

router.post('/', (req, res) => {
    if (req.get("Content-Type") === "application/json"){
        fileName = 'config.json';
        let config_raw = req.body
        //TODO add log_server URL dynamically
        config_raw['log_server'] = "http://host.docker.internal:5000/api/logs"
        config = JSON.stringify(config_raw)
    }
    fs.writeFile(fileName, config, (err) => {
        if (err || config === "") {
            console.log("Error: Could not save configuration file!");
            res.status(500).send("Error: Could not save configuration file!");
            return;
        }

        console.log(`Config saved to file ${fileName}`);

        const scriptPath = './../src/start_containers.sh';
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

router.get('/', (req, res) => {
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


module.exports = router;
