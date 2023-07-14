import {Request, Response, Router} from 'express'
const playbookRouter = new Router()
const sendRequest = require('../utils/sendRequest')
const thingDescriptions = require('./logs').thingDescriptions

/**
 * @swagger
 * /api/script:
 *   post:
 *     summary: Receive and process the playbook file
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     deviceId:
 *                       type: string
 *                       description: The ID of the device
 *                       example: "Coffee-machine"
 *                     type:
 *                       type: string
 *                       description: The type of step (property, action, event)
 *                       example: property
 *                     value:
 *                       type: string
 *                       description: The value associated with the step
 *                       example: temperature
 *                     sleep:
 *                       type: number
 *                       description: The sleep time in seconds(optional). Can also be provided alone, without other properties
 *                       example: 3
 *     responses:
 *       '200':
 *         description: Playbook processed successfully
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Playbook processed successfully
 *       '400':
 *         description: Empty request body or invalid playbook format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *             example: Empty request body or invalid playbook format
 */
playbookRouter.post('/', async (req: Request, res: Response): Promise<void> => {
    if (!req.body) {
        res.status(400).send('Empty request body')
        return
    }

    const playbook = req.body

    // return 400 if wrong format of playbook file
    if (!playbook.steps || !Array.isArray(playbook.steps)) {
        res.status(400).send('Invalid playbook format')
        return
    }

    // Check if all devices in playbook file are actually present
    // Generate set of devices in playbook
    const uniqueDeviceIds = [...new Set(
        playbook.steps.map((step) => (step.deviceId !== undefined ? step.deviceId : undefined))
    )].filter(((deviceId) => deviceId !== undefined))
    // Generate set of devices in config
    const uniqueTitles = [...new Set(thingDescriptions.map((description) => JSON.parse(description).title))]

    // check if all playbook devices are in config
    const allDeviceIdsInTitles: boolean = uniqueDeviceIds.every((deviceId) => uniqueTitles.includes(deviceId))

    if (!allDeviceIdsInTitles) {
        console.log('Not all devices in playbook file are present')
        res.status(400).send('Not all devices in playbook file are present')
        return;
    }

    // iterate over all steps in the playbook
    for (const step of playbook.steps) {
        if (step.deviceId && step.type && step.value) {

            // check if devices have already been created
            console.log(`playbook: ${step.deviceId} ${step.type} ${step.value}`)
            const filteredDescription = thingDescriptions.filter((description: string): boolean => {
                const parsedDescription = JSON.parse(description)
                return parsedDescription.title == step.deviceId
            })
            // use the thing description in JSON format
            let filteredDescriptionParsed = JSON.parse(filteredDescription[0])

            switch (step.type){
                case 'property':
                    console.log("property")
                    // get the url of the property endpoint for the thing
                    const href_element_property = filteredDescriptionParsed.properties[step.value].forms[0].href

                    // create the request object
                    const requestObject = {
                        href: href_element_property,
                        'htv:methodName': 'GET',
                        contentType : 'application/json'
                    }
                    const resp_property = sendRequest(requestObject)
                    console.log('propertyResponse: ', resp_property)

                    break
                case 'action':
                    console.log('action')
                    let href_element: string = ''

                    // parameterized actions have to handled separately
                    // example: step.value = "make_request?method=GET&url=http://localhost:3000/coffee-machine/properties/temperature"
                    if(step.value.includes("?")){
                        console.log("Parameterized action")
                        const actionName = step.value.split('?')[0]
                        const hrefs = filteredDescriptionParsed.actions[actionName].forms.map(form => form.href)
                        const url = hrefs[0].split('{')[0]
                        href_element = url + '?' + step.value.split('?')[1]
                    }
                    // get the url of the action endpoint for the thing
                    else{
                        href_element = filteredDescriptionParsed.actions[step.value].forms[0].href
                    }

                    // create the request object
                    const requestObjectAction = {
                        href: href_element,
                        'htv:methodName': 'POST',
                        contentType : 'application/json'
                    }
                    // send the request with the request object
                    const resp_action = sendRequest(requestObjectAction)
                    console.log('actionResponse: ', resp_action)
                    break
                default: {
                    res.status(400).send('Invalid playbook format')
                }
            }


        } else if (step.sleep) {
            console.log(`playbook: sleep ${step.sleep} seconds`)
            // wait as specified in sleep in seconds
            await new Promise(r => setTimeout(r, step.sleep*1000))
        } else {
            res.status(400).send('Invalid playbook format')
            return
        }
    }

    res.status(200).send('Playbook processed successfully')

})

module.exports = playbookRouter