import { Module } from '@nestjs/common';
import { USVBService } from './usvb.service';
import { USVBController } from './usvb.controller';

@Module({
  providers: [USVBService],
  controllers: [USVBController],
  exports: [USVBService],
})
export class USVBModule {}

