require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const morgan = require('morgan');
const expenseRoutes = require('./routes/expenseRoutes');
const authRoutes = require('./routes/authRoutes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((request, response, next) => {
  for (const source of [request.body, request.query, request.params]) {
    if (!source || typeof source !== 'object') continue;
    for (const key of Object.keys(source)) source[key] = mongoSanitize.sanitize(source[key]);
  }
  next();
});
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (request, response) => {
  response.status(200).json({
    success: true,
    message: 'Expense API is running',
    data: { environment: process.env.NODE_ENV || 'development' }
  });
});

app.use('/api/expenses', expenseRoutes);
app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, 'client', 'dist');
  app.use(express.static(clientDistPath));
  app.get('/{*splat}', (request, response, next) => {
    if (request.path.startsWith('/api/')) return next();
    response.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
