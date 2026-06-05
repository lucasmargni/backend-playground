import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TitanGeneration } from '../titan.entity';

export class CreateTitanDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEnum(TitanGeneration)
  @IsNotEmpty()
  generation!: TitanGeneration;

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
