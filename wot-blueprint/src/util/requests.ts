// function that logs any incoming request, or device logs such as creation, deletion, etc.
export function sendLog(log_type: string, request: any, payload: any, logging_info: any): void {
    // create a log object that includes my device id, the type of log, and the time
    const log = {
        type: log_type,
        host: {
            id: logging_info.device_id,
            // TODO: get own devices ip
            ip: logging_info.ip,
            port: logging_info.port
        },
        payload: payload,
    }

    // check if the request is a device log or a property call (by checking if _called is in type)
    if (log_type.includes('_called')) {
        // add the caller to the log
        log['caller'] = {
            ip: request.headers['x-forwarded-for'] || request.connection.remoteAddress,
            port: request.headers['x-forwarded-port'] || request.connection.remotePort
        }
    }
    console.log(log);

    // send the log to the log server
    sendPostRequest(logging_info.log_server, log);
}

async function sendPostRequest(url: string, payload: any): Promise<void> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        console.log(response.status, response.statusText);
    }
}