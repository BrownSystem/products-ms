import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  EventPattern,
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';
import { PaginationDto } from 'src/common';
import { PrintQrDto } from './dto/print-qr.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @MessagePattern({ cmd: 'create_product' })
  create(@Payload() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @MessagePattern({ cmd: 'upload_products_with_file' })
  uploadWithFile(@Payload() rows: CreateProductDto[]) {
    try {
      return this.productsService.bulkCreate(rows);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @MessagePattern({ cmd: 'generate_pdf_file_with_qrs' })
  generatePdfFileWithQrs(
    @Payload() productsWithQty: { code: number; quantity: number }[],
  ) {
    return this.productsService.generateQrsPdf(productsWithQty);
  }

  @MessagePattern({ cmd: 'generate_pdf_with_products' })
  generatePdfWithProducts(
    @Payload()
    productsWithQty: PrintQrDto,
  ) {
    return this.productsService.generatePdfWithProductsTable(productsWithQty);
  }

  @MessagePattern({ cmd: 'search_products' })
  search(@Payload() paginationDto: PaginationDto) {
    return this.productsService.searchProducts(paginationDto);
  }

  @MessagePattern({ cmd: 'search_products_with_all_branch_inventory' })
  searchProductsWithAllBranchInventory(
    @Payload() paginationDto: PaginationDto,
  ) {
    return this.productsService.searchProductsWithAllBranchInventory(
      paginationDto,
    );
  }

  @MessagePattern({ cmd: 'find_all_product' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.productsService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_product_for_branch' })
  findProductForBranch(@Payload() payload: { page: number; pageSize: number }) {
    return this.productsService.findProductForBranch(payload);
  }

  @MessagePattern({ cmd: 'find_one_product' })
  findOne(@Payload('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_product' })
  update(@Payload() updateProductDto: UpdateProductDto) {
    return this.productsService.update(updateProductDto.id, updateProductDto);
  }

  // @MessagePattern({ cmd: 'update_stock' })
  // updateStock(@Payload() updateStock: UpdateStockDto) {
  //   return this.productsService.updateStock(updateStock);
  // }

  @MessagePattern({ cmd: 'validate_products' })
  validateProducts(@Payload() ids: string[]) {
    return this.productsService.validateProducts(ids);
  }

  @MessagePattern({ cmd: 'delete-all-products' })
  deleteAll() {
    return this.productsService.deleteProducts();
  }
}
