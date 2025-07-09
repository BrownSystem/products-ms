import { PaginationDto } from './pagination.dto';
export declare function applyPagination<T>(query: {
    model: any;
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
    pagination: PaginationDto;
}): any;
export declare function PaginateWithMeta<T>({ model, where, include, select, orderBy, pagination, }: {
    model: any;
    where?: any;
    include?: any;
    select?: any;
    orderBy?: any;
    pagination: PaginationDto;
}): Promise<{
    data: any;
    meta: {
        total: any;
        page: number;
        lastPage: number;
    };
}>;
