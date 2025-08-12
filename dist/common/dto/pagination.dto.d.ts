export declare class PaginationDto {
    branchId?: string;
    limit: number;
    offset: number;
    search?: string;
    orderPrice: 'asc' | 'desc' | undefined;
    filterbystock: boolean;
    constructor(partial?: Partial<PaginationDto>);
}
