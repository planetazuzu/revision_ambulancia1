import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  actorId?: string;

  @IsString()
  action: string;

  @IsString()
  tableName: string;

  @IsOptional()
  @IsString()
  recordId?: string;

  @IsOptional()
  @IsObject()
  payload?: any;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
