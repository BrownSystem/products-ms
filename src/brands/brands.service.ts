import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { EBrand, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class BrandsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(BrandsService.name);

  onModuleInit() {
    this.logger.log('Connecting to the database...');
    void this.$connect();
  }

  async create(createBrandDto: CreateBrandDto) {
    const { name, products } = createBrandDto;

    const existingBrand = await this.findOneByName(name);

    if (existingBrand) {
      throw new RpcException({
        message: `Brand with name ${name} already exists`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return this.eBrand.create({
      data: {
        name,
        products: {
          create: products?.map((product) => ({
            ...product,
          })),
        },
      },
    });
  }

  async findOneByName(name: string) {
    return this.eBrand.findFirst({
      where: { name, available: true },
    });
  }

  async findOne(id: string) {
    const brand = this.eBrand.findFirst({
      where: { id, available: true },
      include: {
        products: {
          select: {
            id: true,
            code: true,
            description: true,
          },
          where: { available: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!brand) {
      throw new RpcException({
        message: `Not Found brand ${id}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const isUpdateBrand = await this.findOne(id);

    if (!isUpdateBrand) {
      throw new RpcException({
        message: `Not Found brand ${id}`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const { name, available } = updateBrandDto;
    return this.eBrand.update({
      where: { id },
      data: {
        name,
        available,
      },
    });
  }
}
