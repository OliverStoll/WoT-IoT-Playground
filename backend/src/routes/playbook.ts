import { Router } from 'express';
const playbookRouter = new Router();
const sendRequest = require('../utils/sendRequest.ts');
const thingDescriptions = require('./logs.ts').thingDescriptions;

playbookRouter.post('/', (req, res): void => {
    if (!req.body) {
        res.status(400).send('Empty request body');
        return;
    }

    const playbook = req.body;

    if (!playbook.steps || !Array.isArray(playbook.steps)) {
        res.status(400).send('Invalid playbook format');
        return;
    }

    for (const step of playbook.steps) {
        if (step.deviceId && step.type && step.value) {

            // check if devices have already been created
            console.log(`playbook: ${step.deviceId} ${step.type} ${step.value}`)
            const filteredDescription = thingDescriptions.filter((description) => {
                const parsedDescription = JSON.parse(description)
                return parsedDescription.id == step.deviceId
            });
            let filteredDescriptionParsed = JSON.parse(filteredDescription[0])

            switch (step.type){
                case 'property':
                    console.log("property")
                    const href_element_property = filteredDescriptionParsed.properties[step.value].form.href
                    // handler for http wot devices
                    const resp_property = sendRequest(href_element_property)
                    console.log(resp_property)

                    break
                case 'action':
                    console.log('action')
                    const initialKey: string = Object.keys(filteredDescriptionParsed.properties)[0]
                    const href_element: string = filteredDescriptionParsed.properties[initialKey].form.href
                    let action_url: string = href_element.split('property')[0] + step.type + '/' + step.value
                    const resp_action = sendRequest(action_url)
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
            // TODO add sleep (not natively available in JS)
        } else {
            res.status(400).send('Invalid playbook format');
            return;
        }
    }

    res.status(200).send('Playbook processed successfully');

})

module.exports = playbookRouter;