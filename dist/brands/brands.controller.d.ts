import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
export declare class BrandsController {
    private readonly brandsService;
    constructor(brandsService: BrandsService);
    create(createBrandDto: CreateBrandDto): Promise<{
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<({
        products: {
            description: string;
            id: string;
            code: string | null;
        }[];
    } & {
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(updateBrandDto: UpdateBrandDto): Promise<{
        available: boolean;
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
