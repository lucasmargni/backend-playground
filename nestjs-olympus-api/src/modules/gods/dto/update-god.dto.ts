import { PartialType } from '@nestjs/mapped-types';
import { CreateGodDto } from './create-god.dto';

export class UpdateGodDto extends PartialType(CreateGodDto) {}
