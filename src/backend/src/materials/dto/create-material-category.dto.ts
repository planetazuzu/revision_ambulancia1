import { IsString, IsOptional } from 'class-validator';

export class CreateMaterialCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  color?: string;
}
