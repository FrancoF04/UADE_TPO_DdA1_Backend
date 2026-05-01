const { Router } = require('express');
const { success, error } = require('../utils/response');
const { getPagination, paginate } = require('../utils/pagination');
const { news } = require('../data/data');

const router = Router();

router.get('/', (_req, res) => {
  const pagination = getPagination(_req.query, 10, 100);
  const orderedNews = [...news].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  const items = paginate(
    orderedNews.map((item) => ({
      id: item.id,
      category: item.category || 'noticia',
      image: item.imageUrl,
      title: item.title,
      description: item.description,
      activityId: item.activityId || null,
      createdAt: item.createdAt,
    })),
    pagination,
  );

  return success(res, items, {
    total: orderedNews.length,
    page: pagination.page,
    page_size: pagination.pageSize,
    limit: pagination.limit,
  });
});

router.get('/:id', (req, res) => {
  const item = news.find((entry) => entry.id === req.params.id);

  if (!item) {
    return error(res, 'Noticia no encontrada', 404);
  }

  return success(res, {
    news: {
      id: item.id,
      category: item.category || 'noticia',
      image: item.imageUrl,
      title: item.title,
      description: item.description,
      content: item.content || item.description,
      activityId: item.activityId || null,
      createdAt: item.createdAt,
    },
  });
});

module.exports = router;