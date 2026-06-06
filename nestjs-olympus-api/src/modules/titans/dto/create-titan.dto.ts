import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TitanGeneration } from '../titan.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTitanDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the titan', example: 'Chronos' })
  name!: string;

  @IsEnum(TitanGeneration)
  @IsNotEmpty()
  @ApiProperty({
    enum: TitanGeneration,
    description: 'The generation correspondig to the titan',
    example: 'primordial',
  })
  generation!: TitanGeneration;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'A description of the titan',
    example: 'master of time',
  })
  description!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Something that represent the titan',
    example: 'hourglass',
  })
  symbol!: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The name of the titan in the Roman Empire',
    example: 'Saturn',
  })
  romanName!: string | null;
}
