import {Request, Response} from "express";

const { spawn } = require('child_process')
const path = require('path')
const express = require('express')
const fs = require('fs')
const thingDescriptions = require('./logs').thingDescriptions
const logs = require('./logs').logs
const sendRequest = require('../utils/sendRequest')

const configRouter = express.Router()

// Path of the WoT config file
let fileName: string = ''

// WoT config file parsed to string
let config: string = ''

/**
 * @swagger
 * /api/config:
 *   post:
 *     summary: Send the config to the controller to generate the things
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               devices:
 *                  type: array
 *                  items:
 *                     type: object
 *                     example: {
 *                          "title": "Coffee-machine",
 *                          "description": "A smart coffee machine with a range of capabilities",
 *                          "properties": {
 *                          "temperature": {
 *                              "type": "number",
 *                              "description": "Current temperature of the coffee machine",
 *                              "startValue": 0
 *                              }
 *                          },
 *                          "actions": {
 *                              "brew_coffee": {
 *                                  "description": "Sets the temperature of the coffee machine using an action",
 *                                  "temperature": {
 *                                      "type": "integer",
 *                                      "description": "Temperature to set the coffee machine to",
 *                                      "minimum": 0,
 *                                      "maximum": 100
 *                                      },
 *                                  "action_list": [{
 *                                          "action_type": "set",
 *                                          "property": "temperature",
 *                                          "value": 97
 *                                              }
 *                                          ]
 *                                  }
 *                              },
 *                          "events": {
 *                              "temperatureSet": {
 *                              "description": "Temperature set event",
 *                              "data": {
 *                                  "type": "string"
 *                                  }
 *                              }
 *                          }
 *                      }
 *               externalDevices:
 *                  type: array
 *                  items:
 *                      type: string
 *                      description: URL of external devices
 *                      example:
 *                          "http://plugfest.thingweb.io:8083/smart-coffee-machine"
 *     responses:
 *       '200':
 *         description: Successfully processed config file
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: "Config was processed!"
 *
 *       '400':
 *         description: Invalid config file
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: "Invalid config file"
 *       '500':
 *         description: Config file could not be saved on backend server
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: 'Error: Could not save configuration file!'
 */
configRouter.post('/', (req: Request, res: Response): void => {
    if (req.get('Content-Type') === 'application/json') {
        fileName = path.join(__dirname, '../../../device-blueprint/config.json')
        let configRaw = req.body

        // TODO: Add log_server URLs for other protocols
        configRaw['log_server'] = 'http://host.docker.internal:5001/api/logs'
        config = JSON.stringify(configRaw)
    }



    fs.writeFile(fileName, config, (err): void => {
        if (err || config === '') {
            console.log('Error: Could not save configuration file!')
            res.status(500).send('Error: Could not save configuration file!');
            return
        }
        console.log(`Config saved to file ${fileName}`);

        if(!JSON.parse(config)['devices']){
            res.status(400).send("Invalid config file")
        }

        // parse external devices
        const externalDevicesList = JSON.parse(config)['externalDevices']

        // iterate over list and send a get request to each of the elements to get the thing Description
        if(externalDevicesList){
            for(const externalDeviceUrl of externalDevicesList){
                const requestObject: {href: string} = {
                    href: externalDeviceUrl
                }
                sendRequest(requestObject).then(resp => {
                    if(resp){
                        let externalDevice = JSON.parse(resp)
                        externalDevice['external'] = true
                        thingDescriptions.push(JSON.stringify(externalDevice))
                    }
                })
            }
        }

        // execute the script, which builds the thing image and starts the containers
        const scriptPath = path.join(__dirname, '../../src/start_containers.sh')
        const script = spawn('bash', [scriptPath], {
            detached: true,
        })

        script.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
        })

        script.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
        })

        script.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
            res.status(200).send('Config was processed!')
        })

    })
})


/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Get the configuration file
 *     responses:
 *       '200':
 *         description: Successfully retrieved the configuration file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               example:
 *                 devices:
 *                   - title: Coffee-machine
 *                     description: A smart coffee machine with a range of capabilities
 *                     properties:
 *                       temperature:
 *                         type: number
 *                         description: Current temperature of the coffee machine
 *                         startValue: 0
 *                     actions:
 *                       brew_coffee:
 *                         description: Sets the temperature of the coffee machine using an action
 *                         temperature:
 *                           type: integer
 *                           description: Temperature to set the coffee machine to
 *                           minimum: 0
 *                           maximum: 100
 *                           action_list:
 *                             - action_type: set
 *                               property: temperature
 *                               value: 97
 *                     events:
 *                       temperatureSet:
 *                         description: Temperature set event
 *                         data:
 *                           type: string
 *                 externalDevices:
 *                   - http://plugfest.thingweb.io:8083/smart-coffee-machine
 *       '404':
 *         description: Configuration file not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: No config file found
 */

configRouter.get('/', (req: Request, res: Response): void => {
    if (fs.existsSync(fileName)) {
        // Send config_backup.json if it exists
        const fileContent = fs.readFileSync(fileName, 'utf8')
        const config = JSON.parse(fileContent)
        res.send(config)
    } else {
        // if config was not uploaded yet
        res.send('No config file found')
    }
})

/**
 * @swagger
 * /api/config/shutdown:
 *   post:
 *     summary: Shutdown all thing containers, thing image and delete the config file
 *     responses:
 *       '200':
 *         description: Shutdown successful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Shutdown successful
 *       '404':
 *         description: No config to shut down
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: No config to shut down
 *       '500':
 *         description: Error while deleting config
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Error while deleting config.
 */
configRouter.post('/shutdown', (req: Request, res: Response) => {
    if (fs.existsSync(fileName)) {
        fs.unlink(fileName, (err) => {
            if (err) {
                console.error('Error while deleting config:', err)
                res.status(500).send('Error while deleting config.')
            } else {
                console.log('Config file was deleted from path: ', fileName);
                const scriptPathDelete = path.join(__dirname, '../../src/delete_containers.sh')
                const script = spawn('bash', [scriptPathDelete], {
                    detached: true,
                })

                script.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`)
                })

                script.stderr.on('data', (data) => {
                    console.error(`stderr: ${data}`)
                })

                script.on('close', (code) => {
                    console.log(`child process exited with code ${code}`)
                    // reset thingDescriptions Array to being empty
                    thingDescriptions.length = 0
                    // reset logs Array to being empty
                    logs.length = 0
                    res.status(200).send('Shutdown successful')
                });

            }
        })
    }
    else{
        res.status(404).send('No config to shutdown.')
    }
})

module.exports = configRouter
