import { Router } from 'express';
const playbookRouter = new Router();
const sendRequest = require('../utils/sendRequest');
const thingDescriptions = require('./logs').thingDescriptions;

playbookRouter.post('/', async (req, res): Promise<void> => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const playbook = req.body;

    // return 400 if wrong format of playbook file
    if (!playbook.steps || !Array.isArray(playbook.steps)) {
        res.status(400).send('Invalid playbook format');
        return;
    }

    // Check if all devices in playbook file are actually present
    // Generate set of devices in playbook
    const uniqueDeviceIds = [...new Set(
        playbook.steps.map((step) => (step.deviceId !== undefined ? step.deviceId : undefined))
    )].filter(((deviceId) => deviceId !== undefined))
    //Generate set of devices in config
    const uniqueTitles = [...new Set(thingDescriptions.map((description) => JSON.parse(description).title))];

    //check if all playbook devices are in config
    const allDeviceIdsInTitles = uniqueDeviceIds.every((deviceId) => uniqueTitles.includes(deviceId));

    if (!allDeviceIdsInTitles) {
        console.log('Not all devices in playbook file are present')
        res.status(400).send('Not all devices in playbook file are present');
        return;
    }

    for (const step of playbook.steps) {
        if (step.deviceId && step.type && step.value) {

            // check if devices have already been created
            console.log(`playbook: ${step.deviceId} ${step.type} ${step.value}`)
            const filteredDescription = thingDescriptions.filter((description) => {
                const parsedDescription = JSON.parse(description)
                return parsedDescription.title == step.deviceId
            });
            let filteredDescriptionParsed = JSON.parse(filteredDescription[0])

            switch (step.type){
                case 'property':
                    console.log("property")
                    const href_element_property = filteredDescriptionParsed.properties[step.value].forms[0].href
                    console.log(href_element_property)
                    console.log(filteredDescriptionParsed.properties[step.value])
                    // handler for http wot devices
                    const requestObject = {
                        href: href_element_property,
                        'htv:methodName': 'GET',
                        contentType : 'application/json'
                    }
                    const resp_property = sendRequest(requestObject)
                    console.log(resp_property)

                    break
                case 'action':
                    console.log('action')
                    const href_element: string = filteredDescriptionParsed.actions[step.value].forms[0].href

                    const requestObjectAction = {
                        href: href_element,
                        'htv:methodName': 'POST',
                        contentType : 'application/json'
                    }
                    const resp_action = sendRequest(requestObjectAction)
                    console.log('actionResponse: ', resp_action)
                    break
                case 'event':
                    // TODO implement
                    console.log('event')
                    break
                default: {
                    res.status(400).send('Invalid playbook format');
                }
            }


        } else if (step.sleep) {
            console.log(`playbook: sleep ${step.sleep} seconds`)
            await new Promise(r => setTimeout(r, step.sleep*1000));
        } else {
            res.status(400).send('Invalid playbook format');
            return;
        }
    }

    res.status(200).send('Playbook processed successfully');

})

module.exports = playbookRouter;