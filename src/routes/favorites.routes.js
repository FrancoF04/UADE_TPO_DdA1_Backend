const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/response');
const { getPagination, paginate } = require('../utils/pagination');
const { serializeActivity } = require('../utils/activityView');
const {
  addFavorite,
  removeFavorite,
  getFavoritesByUser,
  getDynamicActivityById,
} = require('../data/data');

const router = Router();

const mapFavorite = (favorite) => {
  const activity = getDynamicActivityById(favorite.activityId);
  if (!activity) {
    return null;
  }

  return {
    ...serializeActivity(activity),
    favoriteCreatedAt: favorite.createdAt,
    priceAtFavorite: favorite.priceAtFavorite,
    spotsAtFavorite: favorite.spotsAtFavorite,
    priceChanged: activity.price !== favorite.priceAtFavorite,
    spotsChanged: activity.availableSpots !== favorite.spotsAtFavorite,
  };
};

router.post('/', authenticate, (req, res) => {
  const { activity_id, activityId } = req.body;
  const resolvedActivityId = activityId || activity_id;

  if (!resolvedActivityId || typeof resolvedActivityId !== 'string') {
    return error(res, 'activity_id es requerido', 400);
  }

  const favorite = addFavorite(req.user.id, resolvedActivityId);
  if (!favorite) {
    return error(res, 'Actividad no encontrada', 404);
  }

  return success(res, { favorite: mapFavorite(favorite) }, null, 201);
});

router.delete('/:activityId', authenticate, (req, res) => {
  const removed = removeFavorite(req.user.id, req.params.activityId);
  if (!removed) {
    return error(res, 'Favorito no encontrado', 404);
  }

  return success(res, { message: 'Favorito eliminado' });
});

router.get('/', authenticate, (req, res) => {
  const pagination = getPagination(req.query, 10, 100);
  const favorites = getFavoritesByUser(req.user.id)
    .map(mapFavorite)
    .filter(Boolean)
    .sort((left, right) => new Date(right.favoriteCreatedAt).getTime() - new Date(left.favoriteCreatedAt).getTime());

  return success(res, paginate(favorites, pagination), {
    total: favorites.length,
    page: pagination.page,
    page_size: pagination.pageSize,
    limit: pagination.limit,
  });
});

module.exports = router;