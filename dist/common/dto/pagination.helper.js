"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPagination = applyPagination;
exports.PaginateWithMeta = PaginateWithMeta;
function applyPagination(query) {
    const { model, where, include, select, orderBy, pagination } = query;
    const { offset, limit } = pagination;
    return model.findMany({
        where,
        include,
        select,
        orderBy,
        skip: (offset - 1) * limit,
        take: limit,
    });
}
async function PaginateWithMeta({ model, where = {}, include, select, orderBy, pagination, }) {
    const total = await model.count({ where });
    const results = await applyPagination({
        model,
        where,
        include,
        select,
        orderBy,
        pagination,
    });
    const totalPages = Math.ceil(total / pagination.limit);
    return {
        data: results,
        meta: {
            total,
            page: pagination.offset,
            lastPage: totalPages,
        },
    };
}
//# sourceMappingURL=pagination.helper.js.map