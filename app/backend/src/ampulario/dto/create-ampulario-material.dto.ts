import { IsString, IsOptional, IsInt, IsDateString, IsEnum, Min } from 'class-validator';

export class CreateAmpularioMaterialDto {
  @IsString()
  spaceId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  dose?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsInt()
  @Min(0)
  quantity: number;

  @IsString()
  @IsEnum(['IV/IM', 'Nebulizador', 'Oral'])
  route: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minStockLevel?: number;
}
