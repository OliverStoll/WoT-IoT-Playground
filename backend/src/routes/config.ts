const { spawn } = require('child_process');
const express = require('express');
const fs = require('fs')

const router = express.Router();

let fileName = ""
let config = ""

router.post('/', (req, res) => {
    if (req.get("Content-Type") === "application/json"){
        fileName = 'config.json';
        config = JSON.stringify(req.body)
    }
    console.log(req.body);
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

module.exports = router;
