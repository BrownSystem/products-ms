import { PaginationDto } from './pagination.dto';

export function applyPagination<T>(query: {
  model: any;
  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
  pagination: PaginationDto;
}) {
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

export async function PaginateWithMeta<T>({
  model,
  where = {},
  include,
  select,
  orderBy,
  pagination,
}: {
  model: any;
  where?: any;
  include?: any;
  select?: any;
  orderBy?: any;
  pagination: PaginationDto;
}) {
  const total = await model.count({ where });
  const results = await applyPagination<T>({
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
