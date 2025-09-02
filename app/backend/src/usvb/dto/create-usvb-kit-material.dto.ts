import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateUSVBKitMaterialDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsInt()
  @Min(0)
  targetQuantity: number;

  @IsOptional()
  @IsString()
  status?: string;
}
