import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
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
    uploadWithFile(rows: CreateProductDto[]): Promise<({
        message: string;
        status: import("@nestjs/common").HttpStatus;
        error?: undefined;
    } | {
        message: string;
        error: any;
        status: import("@nestjs/common").HttpStatus;
    })[]>;
    generatePdfFileWithQrs(productsWithQty: {
        code: number;
        quantity: number;
    }[]): Promise<string>;
    generatePdfWithProducts(productsWithQty: {
        code: number;
        quantity: number;
    }[]): Promise<string>;
    search(paginationDto: PaginationDto): Promise<{
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
    findProductForBranch(payload: {
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
        status: import("@nestjs/common").HttpStatus;
    }>;
    update(updateProductDto: UpdateProductDto): Promise<{
        description: string;
        brandId: string | null;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: number;
        qrCode: string | null;
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
    deleteAll(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
