import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateSecretDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  name!: string;

  @IsOptional()
  @IsString()
  description!: string | null;

  @IsNotEmpty()
  @IsString()
  value!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
