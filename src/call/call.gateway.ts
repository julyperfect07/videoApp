import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface MessageBodyData {
  roomId: string;
  peerId: string;
}

@WebSocketGateway()
export class CallGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;
  private activeUsers = new Map<string, MessageBodyData>();

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageBodyData,
  ) {
    const { roomId, peerId } = data;

    client.join(roomId);
    client.to(roomId).emit('user-connected', { peerId });
    this.activeUsers.set(client.id, data);
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userData = this.activeUsers.get(client.id);

    if (userData) {
      const { roomId, peerId } = userData;
      this.activeUsers.delete(client.id);
      this.server.to(roomId).emit('user-disconnected', { peerId });
    }
  }
}
