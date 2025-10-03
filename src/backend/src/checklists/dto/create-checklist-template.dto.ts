import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateChecklistTemplateDto {
  @IsString()
  name: string;

  @IsString()
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  periodicity: string;

  @IsOptional()
  active?: boolean;
}
