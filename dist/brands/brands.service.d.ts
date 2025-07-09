import { OnModuleInit } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PrismaClient } from '@prisma/client';
export declare class BrandsService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    create(createBrandDto: CreateBrandDto): Promise<{
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOneByName(name: string): Promise<{
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findOne(id: string): Promise<({
        products: {
            code: string | null;
            description: string;
            id: string;
        }[];
    } & {
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(id: string, updateBrandDto: UpdateBrandDto): Promise<{
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
