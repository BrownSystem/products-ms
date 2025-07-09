import { CreateBrandDto } from './create-brand.dto';
declare const UpdateBrandDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateBrandDto>>;
export declare class UpdateBrandDto extends UpdateBrandDto_base {
    id: string;
}
export declare class UpdateBrandDataDto {
    name: string;
    available: boolean;
}
export {};
