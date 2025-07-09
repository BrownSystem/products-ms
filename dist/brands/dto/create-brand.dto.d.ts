import { CreateProductDto } from 'src/products/dto/create-product.dto';
export declare class CreateBrandDto {
    name: string;
    products?: CreateProductDto[];
    available: boolean;
}
