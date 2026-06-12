import { IsNotEmpty, IsString } from 'class-validator';

export class UnlockVaultDto {
  @IsNotEmpty()
  @IsString()
  password!: string;
}
