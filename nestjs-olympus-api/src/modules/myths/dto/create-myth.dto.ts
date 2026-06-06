import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMythDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The title of the myth', example: 'The Odyssey' })
  title!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'A a brief summary of the myth',
    example:
      'It follows the hero Odysseus (or Ulysses) struggling to return home to Ithaca after the Trojan War. His journey takes 10 years and is filled with mythical challenges, while his wife Penelope and son Telemachus fight off suitors trying to take over his kingdom',
  })
  summary!: string;
}
