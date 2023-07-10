let ip = require("ip");

// function that logs any incoming request, or device logs such as creation, deletion, etc.
export enum LogType {
    PROPERTY_READ = 'property_read',
    PROPERTY_CHANGED = 'property_changed',
    ACTION_CALLED = 'action_called',
    EVENT_SUBSCRIBED = 'event_subscribed',
    EVENT_EMITTED = 'event_emitted',
    CREATED = 'created',
    DELETED = 'deleted'
}

interface Log {
    type: LogType;
    host: {
        id: string;
        ip: string;
        port: number;
    }
    payload: any;
    caller?: string;
}

export interface LoggingInfo {
    log_server: string;
    device_id: string;
    ip: string;
    port: number;
}

export function initializeLoggingInfo(description_json: any, device_port: number): LoggingInfo {
    return {
        log_server: process.env.LOG_SERVER || 'http://host.docker.internal:5001/api/logs',
        device_id: description_json.id || description_json.title.toLowerCase().replace(" ", "_"),
        ip: process.env.IP || ip.address(),
        port: device_port
    }
}

export function sendLog(log_type: LogType, payload: any, logging_info: LoggingInfo, caller?: string): void {
    // create a log object that includes my device id, the type of log, and the time
    let log: Log = {
        type: log_type,
        host: {
            id: logging_info.device_id,
            ip: logging_info.ip,
            port: logging_info.port
        },
        payload: payload,
    }

    // if a caller is provided, add it to the log
    if (caller) {
        log['caller'] = caller;
    }

    // console.log(`LOG [${log.type}] with payload: ${JSON.stringify(log)} ...`);

    // send the log to the log server
    sendRequest(logging_info.log_server, 'POST', log).catch((error) => {
        console.log(`Error while sending log to ${JSON.stringify(logging_info)}: ${error}`);
    });
}

async function sendRequest(url: string, method: string, body: any): Promise<void> {
    if (body === undefined) {
        body = {};
    }
    const response = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        // console.log(response.status, response.statusText);
    }
}
