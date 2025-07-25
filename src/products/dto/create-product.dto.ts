// import { Type } from 'class-transformer';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public description: string;

  @IsString()
  @IsOptional()
  public brandId: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;
}
