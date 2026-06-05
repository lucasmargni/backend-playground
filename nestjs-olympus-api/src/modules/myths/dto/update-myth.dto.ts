import { PartialType } from '@nestjs/mapped-types';
import { CreateMythDto } from './create-myth.dto';

export class UpdateMythDto extends PartialType(CreateMythDto) {}
