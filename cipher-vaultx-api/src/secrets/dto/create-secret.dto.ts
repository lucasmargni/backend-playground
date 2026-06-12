import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSecretDto {
  @ApiProperty({ example: 'MySuperSecret', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  name!: string;

  @ApiProperty({ example: 'The secret nobody must know' })
  @IsOptional()
  @IsString()
  description!: string | null;

  @ApiProperty({ example: 'I am Batman' })
  @IsNotEmpty()
  @IsString()
  value!: string;

  @ApiProperty({ example: 'MyP@ssw0rd' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
