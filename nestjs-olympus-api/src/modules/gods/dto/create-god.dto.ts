import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GodDomain } from '../god.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGodDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the god', example: 'Zeus' })
  name!: string;

  @IsEnum(GodDomain)
  @IsNotEmpty()
  @ApiProperty({
    enum: GodDomain,
    description: 'The domain that is responsible the god',
    example: 'sky',
  })
  domain!: GodDomain;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'A description of the god',
    example: 'rules them all',
  })
  description!: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Something that represent the god',
    example: 'lightning bolt',
  })
  symbol!: string | null;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'The name of the god in the Roman Empire',
    example: 'Jupiter',
  })
  romanName!: string | null;
}
