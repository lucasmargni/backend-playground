import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnlockVaultDto {
  @ApiProperty({ example: 'MyP@ssw0rd' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
