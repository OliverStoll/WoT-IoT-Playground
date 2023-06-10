import { ProtocolInterface } from '../interfaces/protocolInterface';
import { Application } from 'express';
const http = require('http')

export class HttpProtocol implements ProtocolInterface {
    /**
     * Express server instance
     */
    private server: Application;

    /**
     * Port for the HTTP server
     */
    port: string | 5001;

    /**
     * Constructs a new HttpProtocol instance.
     * @param server - The Express server instance.
     * @param port - The port for the HTTP server.
     */
    constructor(server: Application, port: string | 5001) {
        this.server = server;
        this.port = port;
    }



    /**
     * Connects to the HTTP protocol by starting the server.
     */
    connect(): void {
        this.server.listen(this.port, () => {
            console.log(`HTTP Server running on port: ${this.port}`);
        });
    }

    /**
     * Sends data via the HTTP protocol.
     * @param url - The destination URL.
     * @param data - The data to send.
     */
    send(url: string, data: any): void {
        console.log('Sending data via HTTP:', data);
    }

    /**
     * Receives data via the HTTP protocol.
     * @param url - The URL to make the HTTP GET request.
     * @returns A Promise that resolves with the received data.
     */
    receive(url: string): Promise<any> {
        console.log('Receiving data via HTTP');

        return new Promise((resolve, reject) => {
            http.get(url, res => {
                let data: string = '';

                console.log('Status Code', res.statusCode);

                res.on('data', chunk => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve(data);
                });

                res.on('error', error => {
                    reject(error);
                });
            });
        });
    }

}
