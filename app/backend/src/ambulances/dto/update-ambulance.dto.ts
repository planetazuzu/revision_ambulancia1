import { PartialType } from '@nestjs/swagger';
import { CreateAmbulanceDto } from './create-ambulance.dto';
import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateAmbulanceDto extends PartialType(CreateAmbulanceDto) {
  @IsOptional()
  @IsBoolean()
  dailyCheckCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  mechanicalReviewCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  cleaningCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  inventoryCompleted?: boolean;

  @IsOptional()
  @IsDateString()
  lastDailyCheck?: string;

  @IsOptional()
  @IsDateString()
  lastMechanicalReview?: string;

  @IsOptional()
  @IsDateString()
  lastCleaning?: string;

  @IsOptional()
  @IsDateString()
  lastInventoryCheck?: string;
}
