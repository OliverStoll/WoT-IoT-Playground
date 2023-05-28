function createLog(logData) {
    const { type, host, caller, payload } = logData;
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${host.id}:  `;
    switch (type){
        case 'property_called': {
            logMessage += `property "${payload.name}" with a value of ${payload.value} was accessed by: ${caller.ip}:${caller.port}`
            break;
        }
        case 'action_called': {
            logMessage += `action "${payload.name}" was called by: ${caller.ip}:${caller.port}`
            break;
        }
        case 'event_called': {
            logMessage += `event "${payload.name}" was registered to by: ${caller.ip}:${caller.port}`
            break;
        }
        case 'event_triggered': {
            logMessage += `event "${payload.name}" was triggered`
            break;
        }
        case 'created': {
            logMessage += `created successfully`
            break;
        }
        case 'deleted': {
            logMessage += `deleted successfully`
            break;
        }
        default: {
            logMessage = ""
        }
    }
    return logMessage;
}

module.exports = createLog;