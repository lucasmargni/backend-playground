import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMythDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;
}
