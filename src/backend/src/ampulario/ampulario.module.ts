import { Module } from '@nestjs/common';
import { AmpularioService } from './ampulario.service';
import { AmpularioController } from './ampulario.controller';

@Module({
  providers: [AmpularioService],
  controllers: [AmpularioController],
  exports: [AmpularioService],
})
export class AmpularioModule {}

