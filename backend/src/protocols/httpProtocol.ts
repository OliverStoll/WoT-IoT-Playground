import { ProtocolInterface } from '../interfaces/protocolInterface';

export class HttpProtocol implements ProtocolInterface {
    private server: any
    port: string | 5001
    constructor(server: any, port: string | 5001) {
        this.server = server
        this.port = port
    }
    connect(): void {
        // Connect to the HTTP protocol
        this.server.listen(this.port, () => {
            console.log(`HTTP Server running on port: ${this.port}`);
        });
    }

    send(url: string, data: any) {
        // Implement sending data via HTTP
        console.log('Sending data via HTTP', data);
    }

    receive() {
        // Implement receiving data via HTTP
        console.log('Receiving data via HTTP');
        return 'HTTP Data';
    }
}
