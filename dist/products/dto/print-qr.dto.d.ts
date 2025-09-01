export declare class ProductQrItemDto {
    code: number;
    quantity?: number;
}
export declare class PrintQrDto {
    products: ProductQrItemDto[];
    branchOrder?: {
        id: string;
        name: string;
        location: string;
    }[];
}
