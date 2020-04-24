import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class TelemetryStatusGateway implements OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    clients = new Map();

    async handleDisconnect(client) {
        console.log("Client disconnected", client.id)
        this.clients.delete(client.id);
    }

    @SubscribeMessage('UPDATE_DEVICE_SELECTION')
    async onUpdate(client, data: any) {
        console.log(`UPDATE DEVICE SELECTION by client id ${client.id} for device ${data.deviceId}`);
        data.prop === "ADD" && this.clients.set(client.id, data.deviceId);
        data.prop === "REMOVE" && this.clients.delete(client.id);
    }

    sendDeviceData = function(currentDevice, data) {
        for (const [socketId, deviceId] of this.clients.entries()) {
            if (deviceId === currentDevice) {
                console.log('SENDING DEVICE DATA of', currentDevice);
                this.server.to(socketId).emit('DEVICE_DATA', data);
            }
        }
    }
}
