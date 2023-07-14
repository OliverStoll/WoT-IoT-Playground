import {ProtocolInterface} from '../interfaces/protocolInterface';
import {Application, Response} from 'express';

const http = require('http')

export class HttpProtocol implements ProtocolInterface {
    /**
     * Express server instance
     */
    private server: Application

    /**
     * Port for the HTTP server
     */
    port: string | 5001

    /**
     * Constructs a new HttpProtocol instance.
     * @param server - The Express server instance.
     * @param port - The port for the HTTP server.
     */
    constructor(server: Application, port: string | 5001) {
        this.server = server
        this.port = port
    }


    /**
     * Connects to the HTTP protocol by starting the server.
     */
    connect(): void {
        this.server.listen(this.port, (): void => {
            console.log(`HTTP Server running on port: ${this.port}`)
        });
    }

    /**
     * Sends data via the HTTP protocol.
     * @param url to send request to
     * @param data - The data to send.
     */
    async send(url: string, data: any): Promise<string> {
        let responseValue: string = ''
        const {contentType, value} = data
        const method = data['htv:methodName']
        const urlCleaned: string = url.replace(/localhost/gi, 'host.docker.internal');
        console.log(`Sending data via HTTP to url ${urlCleaned} using content type: ${contentType}, value ${value} and method: ${method}`)

        try {
            const response: Response = await fetch(urlCleaned, {
                method: method,
                headers: { 'Content-Type': contentType },
                body: value
            })
            if (response.status === 200) {
                // wait until the body is loaded
                const responseBody = await response.text()
                const parsedBody = JSON.parse(responseBody)
                responseValue = JSON.stringify(parsedBody)
                console.log("Action/Event/Property successfully called");
            } else {
                console.log("Action/Event/Property call failed with status:", response.status);
            }
        } catch (error) {
            console.error("An error occurred during the HTTP request:", error);
        }
        return responseValue

    }

    /**
     * Receives data via the HTTP protocol.
     * @param url - The URL to make the HTTP GET request.
     * @returns A Promise that resolves with the received data.
     */
    async receive(url: string): Promise<any> {
        return new Promise((resolve, reject): void => {
            // TODO: remove, when href sends the correct IP
            const urlCleaned: string = url.replace(/localhost/gi, 'host.docker.internal');
            console.log('Receiving data via HTTP for URL: ', urlCleaned);

            const req = http.get(urlCleaned, res => {
                let data: string = ''

                res.on('data', chunk => {
                    data += chunk;
                });

                res.on('end', (): void => {
                    console.log(data)
                    resolve(data);
                });

                res.on('error', error => {
                    reject(error);
                });
            });

            req.on('error', error => {
                reject(error);
            });
        }).catch(error => {
            console.error('An error occurred during the HTTP request:', error);
            return '' // Return an empty string when an error occurs
        });
    }
}
