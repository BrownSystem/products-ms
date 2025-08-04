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
        message: string;
        status: HttpStatus;
        error?: undefined;
    } | {
        message: string;
        error: any;
        status: HttpStatus;
    })[]>;
    create(createProductDto: CreateProductDto): Promise<{
        description: string;
        brandId: string | null;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: number;
        qrCode: string | null;
    }>;
    generateQrsPdf(productsWithQty: {
        code: number;
        quantity: number;
    }[]): Promise<string>;
    generatePdfWithProductsTable(productsWithQty: {
        code: number;
        quantity: number;
    }[]): Promise<string>;
    findAll(paginationDto: PaginationDto): Promise<{
        data: {
            stock: number;
            description: string;
            available: boolean;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            code: number;
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
        description: string;
        brandId: string | null;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: number;
        qrCode: string | null;
    } | {
        message: string;
        status: HttpStatus;
    }>;
    findByCode(code: number, throwIfNotFound?: boolean): Promise<{
        description: string;
        brandId: string | null;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: number;
        qrCode: string | null;
    } | null>;
    update(id: string, updateProductDto: UpdateProductDto): Promise<{
        description: string;
        brandId: string | null;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: number;
        qrCode: string | null;
    }>;
    searchProducts(paginationDto: PaginationDto): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            lastPage: number;
        };
    }>;
    searchProductsWithAllBranchInventory(paginationDto: PaginationDto): Promise<{
        data: any[];
        meta: {
            total: any;
            page: number;
            lastPage: number;
        };
    }>;
    validateProducts(ids: string[]): Promise<{
        description: string;
        brandId: string | null;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: number;
        qrCode: string | null;
    }[]>;
    deleteProducts(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
