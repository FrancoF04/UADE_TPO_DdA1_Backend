const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const activityRoutes = require('./routes/activity.routes');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const bookingsRoutes = require('./routes/bookings.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const ratingsRoutes = require('./routes/ratings.routes');
const newsRoutes = require('./routes/news.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/health', healthRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/activities', '/activities'], activityRoutes);
app.use('/api/users', userRoutes);
app.use(['/profile', '/api/profile'], profileRoutes);
app.use(['/api/users/reservations', '/reservations'], bookingsRoutes);
app.use(['/bookings', '/api/bookings'], bookingsRoutes);
app.use(['/favorites', '/api/favorites'], favoritesRoutes);
app.use(['/ratings', '/api/ratings'], ratingsRoutes);
app.use(['/news', '/api/news'], newsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use(errorHandler);

module.exports = app;
