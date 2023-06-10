/**
 * Create a log message based on the provided log data.
 * @param logData - The data object containing log information.
 * @returns The generated log message as a string.
 */
function createLog(logData): string {
    // Parse JSON log
    const { type, host, caller, payload } = logData;

    // Generate timestamp for log
    const timestamp: string = new Date().toISOString();

    // Define general log message
    let logMessage: string = `${timestamp},${host.id},`;

    // Generate logs according to the type
    switch (type) {
        case 'property_called': {
            logMessage += `property "${payload.name}" with a value of ${payload.value} was accessed by: ${caller.ip}:${caller.port}`;
            break;
        }
        case 'action_called': {
            logMessage += `action "${payload.name}" was called by: ${caller.ip}:${caller.port}`;
            break;
        }
        case 'event_called': {
            logMessage += `event "${payload.name}" was registered to by: ${caller.ip}:${caller.port}`;
            break;
        }
        case 'event_triggered': {
            logMessage += `event "${payload.name}" was triggered`;
            break;
        }
        case 'created': {
            logMessage += `created successfully`;
            break;
        }
        case 'deleted': {
            logMessage += `deleted successfully`;
            break;
        }
        default: {
            logMessage = '';
        }
    }

    return logMessage;
}

module.exports = createLog;
