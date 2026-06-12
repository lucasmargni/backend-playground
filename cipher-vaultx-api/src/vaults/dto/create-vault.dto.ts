import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateVaultDto {
  @ApiProperty({ example: 'SuperSecretVault', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  name!: string;

  @ApiProperty({ example: 'MyP@ssw0rd' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
