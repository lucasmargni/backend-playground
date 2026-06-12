import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateVaultDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  name!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
