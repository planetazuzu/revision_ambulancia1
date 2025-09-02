import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class TestEmailDto {
  @ApiProperty({ example: 'test@ambureview.local' })
  @IsEmail()
  email: string;
}
