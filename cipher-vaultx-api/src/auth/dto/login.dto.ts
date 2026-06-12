import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'lucas@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MyP@assw0rd' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
