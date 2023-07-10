/**
 * Create a log message based on the provided log data.
 * @param logData - The data object containing log information.
 * @returns The generated log message as a string.
 */
function createLog(logData): string {
    // Parse JSON log
    const { type, host, caller, payload } = logData

    // Generate timestamp for log
    const timestamp: string = new Date().toISOString()

    // Define general log message
    let logMessage: string = `${timestamp},${host.id},`

    // If caller is unknown than set it to controller
    let callerName: string = caller ? caller : 'controller'


    // Generate logs according to the type
    switch (type) {
        case 'property_read': {
            logMessage += `property "${payload.name}" with a value of ${payload.value} was accessed by: ${callerName}`
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
        default: {
            logMessage = ''
        }
    }

    return logMessage
}

module.exports = createLog
