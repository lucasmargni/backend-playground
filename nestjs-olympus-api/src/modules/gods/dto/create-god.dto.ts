import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GodDomain } from '../god.entity';

export class CreateGodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(GodDomain)
  @IsNotEmpty()
  domain!: GodDomain;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  symbol!: string | null;

  @IsString()
  @IsOptional()
  romanName!: string | null;
}
