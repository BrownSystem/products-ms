import { OnModuleInit, HttpStatus } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy } from '@nestjs/microservices';
import { BrandsService } from 'src/brands/brands.service';
import { PaginationDto } from 'src/common';
export declare class ProductsService extends PrismaClient implements OnModuleInit {
    private readonly client;
    private readonly brandService;
    private readonly logger;
    private _buildSearchQuery;
    private _filterProductsByBranch;
    constructor(client: ClientProxy, brandService: BrandsService);
    onModuleInit(): void;
    bulkCreate(createProductDtos: CreateProductDto[]): Promise<({
        code: string;
        message: string;
        status: HttpStatus;
        error?: undefined;
    } | {
        code: string;
        message: string;
        error: any;
        status: HttpStatus;
    })[]>;
    create(createProductDto: CreateProductDto): Promise<any>;
    generateQrsPdf(productsWithQty: {
        code: string;
        quantity: number;
    }[]): Promise<string>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: {
            stock: number;
            code: string | null;
            id: string;
            description: string;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
            qrCode: string | null;
            brand: {
                name: string;
            } | null;
        }[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    findProductForBranch(data: {
        page: number;
        pageSize: number;
    }): Promise<{
        data: {
            id: string;
        }[];
        page: number;
        pageSize: number;
    }>;
    findOne(id: string): Promise<{
        code: string | null;
        id: string;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
    } | {
        message: string;
        status: HttpStatus;
    }>;
    findByCode(code: string, throwIfNotFound?: boolean): Promise<{
        code: string | null;
        id: string;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
    } | null>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<any>;
    searchProducts(paginationDto: PaginationDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            lastPage: number;
        };
    }>;
    validateProducts(ids: string[]): Promise<{
        code: string | null;
        id: string;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
    }[]>;
}
