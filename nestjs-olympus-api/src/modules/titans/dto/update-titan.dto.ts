import { PartialType } from '@nestjs/mapped-types';
import { CreateTitanDto } from './create-titan.dto';

export class UpdateTitanDto extends PartialType(CreateTitanDto) {}
