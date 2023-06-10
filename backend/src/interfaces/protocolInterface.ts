export interface ProtocolInterface {
    connect(): void;
    send(url: string, data: any): void;
    receive(): any;
}