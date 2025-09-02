import { IsString, IsOptional, IsInt, IsDateString, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @IsString()
  ambulanceId: string;

  @IsString()
  materialId: string;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsInt()
  @Min(0)
  qty: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
