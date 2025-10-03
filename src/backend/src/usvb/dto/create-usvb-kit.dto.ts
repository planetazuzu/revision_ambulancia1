import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateUSVBKitDto {
  @IsInt()
  @Min(1)
  number: number;

  @IsString()
  name: string;

  @IsString()
  iconName: string;

  @IsOptional()
  @IsString()
  genericImageHint?: string;
}
