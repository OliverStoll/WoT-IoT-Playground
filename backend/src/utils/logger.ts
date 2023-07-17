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
    let timestamp: string = new Date().toISOString().replace('Z', '')
    // remove date
    timestamp = `[${timestamp.split('T')[1]}]`


    // Define general log message
    let logMessage: string = `${timestamp},${host.id},`

    // If caller is unknown than set it to controller
    let callerName: string = caller ? caller : 'controller'
    callerName = originalCaller ? originalCaller : callerName

    // if callerName is not controller, make it all caps
    if(callerName != 'controller'){
        callerName = `{${callerName.toUpperCase()}}`
    }

    // Generate logs according to the type
    switch (type) {
        case 'property_read': {
            logMessage += `PROPERTY  {${payload.name}} was accessed with a value of [${payload.value}]`
            break
        }
        case 'property_changed': {
            logMessage += `PROPERTY {${payload.name}} was changed to [${payload.value}]`
            break
        }
        case 'action_called': {
            logMessage += `ACTION {${payload}} was called by ${callerName}`
            break
        }
        case 'event_emitted': {
            logMessage += `EVENT {${payload}} was emitted`
            break
        }
        case 'event_subscribed': {
            logMessage += `EVENT {${payload}} was subscribed`
            break
        }
        case 'event_received': {
            logMessage += `EVENT {${payload.event_name}} from [${payload.device_id}] was received`
            break
        }
        case 'created': {
            logMessage += `CREATED successfully`
            break
        }
        case 'deleted': {
            logMessage += `DELETED successfully`
            break
        }
        case 'externalThingDescription': {
            logMessage += `EXTERNAL DEVICE ADDED successfully`
            break
        }
        case 'externalLog': {
            let { href, thingDescriptions } = logData
            // remove parameters as there is another format in the thingDescriptions
            href = href.split('?')[0]
            // parse host
            const title = getTitleFromHref(href, thingDescriptions)

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

            // if caller over make_request of a local device the caller has to be changed
            if(originalCaller){
                callerName = getTitleFromHref(originalCaller, thingDescriptions)
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

function getTitleFromHref(href, thingDescriptions): string{
    const filteredDescription: string[] = thingDescriptions.filter((description: string): boolean => {
        return description.includes(href)
    })
    if(filteredDescription.length > 1){
        console.log(`Error: There are ${filteredDescription.length} devices with href: ${href}`)
        return ''
    }
    // capitalize title and fill spaces to 20 characters
    const { title } = JSON.parse(filteredDescription[0])
    return title
}


module.exports = createLog
