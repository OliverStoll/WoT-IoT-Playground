const { spawn } = require('child_process');
const express = require('express');
const fs = require('fs')

const router = express.Router();

router.post('/', (req, res) => {
    const config = req.body;
    console.log(config);
    const fileName = 'config.json';

    fs.writeFile(fileName, JSON.stringify(config), (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving configuration file');
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
