import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { AmbulanceType } from '@prisma/client';

export class CreateAmbulanceDto {
  @ApiProperty({ example: 'AMB001' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Ambulancia 01' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'XYZ 123' })
  @IsString()
  plate: string;

  @ApiProperty({ example: 'Mercedes Sprinter', required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ example: 2022, required: false })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiProperty({ example: 'SVB', enum: AmbulanceType })
  @IsEnum(AmbulanceType)
  type: AmbulanceType;

  @ApiProperty({ example: 'OK', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 10500, required: false })
  @IsOptional()
  @IsNumber()
  lastKnownKilometers?: number;
}
