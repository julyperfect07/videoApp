import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';

interface MessageBodyData {
  roomId: string;
  peerId: string;
}

@WebSocketGateway()
export class CallGateway {
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: MessageBodyData,
  ) {
    const { roomId, peerId } = data;
    client.join(roomId);
    client.to(roomId).emit('user-connected', { peerId });
  }
}
