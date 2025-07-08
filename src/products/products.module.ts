import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { BrandsModule } from 'src/brands/brands.module';
import { ProductsController } from './products.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  imports: [BrandsModule, NatsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
