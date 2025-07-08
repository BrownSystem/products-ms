import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [ProductsModule, BrandsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
