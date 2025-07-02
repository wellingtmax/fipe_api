const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const fipeRoutes = require('./routes/fipe');
const favoritesRoutes = require('./routes/favorites');
const historyRoutes = require('./routes/history');
const uploadRoutes = require('./routes/upload');

const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

// Middlewares de segurança
app.use(helmet());
app.use(compression());
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://seudominio.com'] 
    : ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FIPE API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/fipe', fipeRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/upload', uploadRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'FIPE Backend API - Consulta da Tabela FIPE de Veículos',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      fipe: '/api/fipe',
      favorites: '/api/favorites',
      history: '/api/history',
      upload: '/api/upload',
      health: '/health'
    },
    documentation: {
      marcas: 'GET /api/fipe/marcas/:tipo',
      veiculos: 'GET /api/fipe/veiculos/:tipo/:marca',
      preco: 'GET /api/fipe/preco/:codigoFipe',
      tabelas: 'GET /api/fipe/tabelas'
    }
  });
});

// Middleware de erro 404
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`� FIPE API rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔍 FIPE endpoint: http://localhost:${PORT}/api/fipe`);
  });
}

module.exports = app;
