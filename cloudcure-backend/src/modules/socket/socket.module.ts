import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule { }
