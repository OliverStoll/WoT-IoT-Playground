/**
 * Create a log message based on the provided log data.
 * @param logData - The data object containing log information.
 * @param originalCaller - The caller information (optional)
 * @returns The generated log message as a string.
 */
function createLog(logData, originalCaller?: string): string {
    // Parse JSON log
    const { type, host, caller, payload } = logData

    // Generate timestamp for log
    const timestamp: string = new Date().toISOString()

    // Define general log message
    let logMessage: string = `${timestamp},${host.id},`

    // If caller is unknown than set it to controller
    let callerName: string = caller ? caller : 'controller'
    callerName = originalCaller ? originalCaller : callerName
    console.log("LOG HERE:")
    console.log(caller)
    console.log(callerName)

    // Generate logs according to the type
    switch (type) {
        case 'property_read': {
            logMessage += `property "${payload.name}" with a value of ${payload.value} was accessed`
            break
        }
        case 'property_changed': {
            logMessage += `property "${payload.name}" was changed to ${payload.value}`
            break
        }
        case 'action_called': {
            logMessage += `action "${payload}" was called by: ${callerName}`
            break
        }
        case 'event_emitted': {
            logMessage += `event "${payload}" was emitted`
            break
        }
        case 'event_triggered': {
            logMessage += `event "${payload.name}" was triggered`
            break
        }
        case 'created': {
            logMessage += `created successfully`
            break
        }
        case 'deleted': {
            logMessage += `deleted successfully`
            break
        }
        case 'externalThingDescription': {
            logMessage += `added successfully`
            break
        }
        case 'externalLog': {
            let { href, thingDescriptions } = logData
            // remove parameters as there is another format in the thingDescriptions
            href = href.split('?')[0]
            // parse host
            const filteredDescription: string[] = thingDescriptions.filter((description: string): boolean => {
                return description.includes(href)
            })
            if(filteredDescription.length > 1){
                console.log(`Error: There are ${filteredDescription.length} devices with href: ${href}`)
                return ''
            }
            const { title } = JSON.parse(filteredDescription[0])
            // parse type of call. example: http://example.com:3001/thing/action/boil_water
            let callSplitFirst = href.split('//')[1]
            let callSplit = callSplitFirst.split('/')

            // get call type: property/action/event
            let call: string = ''
            if(callSplit[2] == 'properties'){
                call = 'property'
            }
            else{
                // get call type: action/event and remove last character
                call = callSplit[2].substring(0, callSplit[2].length - 1)
            }

            // get name of property/action/event
            const name = callSplit[3]
            logMessage = `${timestamp},${title}, ${call} ${name} was called by ${callerName} and returned: ${payload}`
            break
        }
        default: {
            logMessage = ''
        }
    }

    return logMessage
}


module.exports = createLog
