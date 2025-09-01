import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common';
import { PrintQrDto } from './dto/print-qr.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<{
        id: string;
        code: number;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
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
    generatePdfWithProducts(productsWithQty: PrintQrDto): Promise<string>;
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
            id: string;
            code: number;
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
        id: string;
        code: number;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
    } | {
        message: string;
        status: import("@nestjs/common").HttpStatus;
    }>;
    update(updateProductDto: UpdateProductDto): Promise<{
        id: string;
        code: number;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
    }>;
    validateProducts(ids: string[]): Promise<{
        id: string;
        code: number;
        description: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        qrCode: string | null;
        brandId: string | null;
    }[]>;
    deleteAll(): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
