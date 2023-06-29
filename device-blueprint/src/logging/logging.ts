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
    caller?: {
        ip: string;
        port: string;
    }
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

export function sendLog(log_type: LogType, payload: any, logging_info: LoggingInfo): void {
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

    // check if the request is of type that has a caller
    const caller_log_types = [LogType.PROPERTY_READ, LogType.ACTION_CALLED, LogType.EVENT_SUBSCRIBED]
    if (caller_log_types.includes(log_type)) {
        console.log("Adding caller to log");
        log['caller'] = {
            ip: "Unknown",
            port: ""
        }
    }
    console.log(`Sending Log ${log_type} with payload: ${JSON.stringify(log)}`);

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

export async function fetchData(url: string) {
    try {
        const response = await fetch(url);
        // console.log(response);
        // console.log(response.json());
        return await response.json();
    } catch (error) {
        console.error(error);
    }
}
