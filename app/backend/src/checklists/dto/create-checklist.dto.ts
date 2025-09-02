import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateChecklistDto {
  @IsString()
  ambulanceId: string;

  @IsString()
  templateId: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
