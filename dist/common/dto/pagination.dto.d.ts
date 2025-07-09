export declare class PaginationDto {
    branchId?: string;
    limit: number;
    offset: number;
    search?: string;
    orderPrice: 'asc' | 'desc' | undefined;
    constructor(partial?: Partial<PaginationDto>);
}
