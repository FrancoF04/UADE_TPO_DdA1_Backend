const getPagination = (query = {}, defaultPageSize = 10, maxPageSize = 100) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const pageSizeInput = query.page_size ?? query.limit ?? defaultPageSize;
  const pageSize = Math.max(1, Math.min(maxPageSize, parseInt(pageSizeInput, 10) || defaultPageSize));

  return {
    page,
    pageSize,
    limit: pageSize,
  };
};

const paginate = (items, pagination) => {
  const { page, pageSize } = pagination;
  const start = (page - 1) * pageSize;

  return items.slice(start, start + pageSize);
};

module.exports = { getPagination, paginate };