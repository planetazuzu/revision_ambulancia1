import { PartialType } from '@nestjs/mapped-types';
import { CreateInventoryItemDto } from './create-inventory-item.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateInventoryItemDto extends PartialType(CreateInventoryItemDto) {
  @IsOptional()
  @IsString()
  reason?: string;
}
