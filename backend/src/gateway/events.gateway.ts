import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'events',
  transports: ['websocket', 'polling'],
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: any) {
    console.log('[WS] client connected', client.id);
  }

  handleDisconnect(client: any) {
    console.log('[WS] client disconnected', client.id);
  }

  broadcast(event: string, payload: any) {
    this.server?.emit(event, payload);
  }

  @SubscribeMessage('ping')
  onPing(@MessageBody() data: any): { event: string; data: any } {
    return { event: 'pong', data };
  }
}