import { Module } from '@nestjs/common';
import { AmbuReviewWebSocketGateway } from './websocket.gateway';

@Module({
  providers: [AmbuReviewWebSocketGateway],
  exports: [AmbuReviewWebSocketGateway],
})
export class WebSocketModule {}
