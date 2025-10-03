import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateIncidentDto {
  @IsString()
  ambulanceId: string;

  @IsOptional()
  @IsString()
  inventoryItemId?: string;

  @IsString()
  @IsEnum(['MISSING', 'EXPIRED', 'DAMAGE', 'MAINTENANCE'])
  type: string;

  @IsString()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status?: string;

  @IsOptional()
  @IsString()
  responsibleId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
