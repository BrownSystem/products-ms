import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @IsString()
  @IsOptional()
  id: string;
}

export class UpdateBrandDataDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;
}
