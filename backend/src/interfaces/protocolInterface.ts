export interface ProtocolInterface {
    /**
     * Connects to the protocol.
     */
    connect(): void;

    /**
     * Sends data via the protocol.
     * @param url - The destination URL.
     * @param data - The data to send.
     */
    send(url: string, data: any): void;

    /**
     * Receives data via the protocol.
     * @returns The received data.
     */
    receive(url: string): any;
}
