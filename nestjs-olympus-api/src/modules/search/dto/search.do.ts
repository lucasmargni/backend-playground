import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum SearchType {
  GOD = 'god',
  TITAN = 'titan',
  MYTH = 'myth',
}

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  q!: string;

  @IsEnum(SearchType)
  @IsOptional()
  type!: SearchType | null;
}
