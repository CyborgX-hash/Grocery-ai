const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const groceryRoutes = require('./routes/grocery.routes');
const preferencesRoutes = require('./routes/preferences.routes');

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'MessyList Backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/grocery/preferences', preferencesRoutes);
app.use('/api/grocery', groceryRoutes);

// Catch 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
