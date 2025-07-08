// import { Type } from 'class-transformer';
import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsString()
  public code: string;

  @IsString()
  public description: string;

  @IsString()
  @IsOptional()
  public brandId: string;

  @IsBoolean()
  @IsOptional()
  public available: boolean;

  // @IsNumber({
  //   maxDecimalPlaces: 4,
  // })
  // @Type(() => Number)
  // public price: number;
}
