import {
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQrItemDto {
  @IsNumber()
  code: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

export class PrintQrDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductQrItemDto)
  products: ProductQrItemDto[];

  @IsBoolean()
  @IsOptional()
  removeStockZero: boolean;

  @IsArray()
  @IsOptional()
  branchOrder?: {
    id: string;
    name: string;
    location: string;
  }[];
}
