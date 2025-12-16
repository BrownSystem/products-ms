// src/products/dto/update-stock.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateStockDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  stock: number;

  @IsString()
  branchId: string;
}
