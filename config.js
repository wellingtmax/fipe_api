require('dotenv').config();

module.exports = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },

  // Configurações JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'sua_chave_secreta_muito_forte_aqui_123456789',
    expiresIn: '24h'
  },

  // Configurações da API FIPE
  fipe: {
    baseUrl: 'https://brasilapi.com.br/api/fipe',
    cacheTime: parseInt(process.env.FIPE_CACHE_TIME) || 3600, // 1 hora
    requestTimeout: parseInt(process.env.FIPE_REQUEST_TIMEOUT) || 10000,
    maxRetries: parseInt(process.env.FIPE_MAX_RETRIES) || 3,
    tiposPermitidos: ['carros', 'motos', 'caminhoes'],
    maxSearchResults: parseInt(process.env.FIPE_MAX_SEARCH_RESULTS) || 100
  },

  // Configurações de rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000 // máximo de requests por IP (aumentado para FIPE)
  },

  // Configurações de CORS
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://seudominio.com'] 
      : ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:8080'],
    credentials: true
  },

  // Configurações de cache
  cache: {
    stdTTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hora
    checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600, // 10 minutos
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS) || 1000
  },

  // Configurações da aplicação FIPE
  app: {
    maxFavorites: parseInt(process.env.MAX_FAVORITES) || 100,
    maxHistoryItems: parseInt(process.env.MAX_HISTORY_ITEMS) || 1000,
    maxComparisons: parseInt(process.env.MAX_COMPARISONS) || 5,
    defaultPagination: {
      page: 1,
      limit: 20,
      maxLimit: 100
    }
  },

  // Configurações de validação
  validation: {
    password: {
      minLength: 6,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    },
    name: {
      minLength: 2,
      maxLength: 50
    }
  },

  // Configurações de log
  logging: {
    format: 'combined', // 'combined', 'common', 'short', 'tiny'
    enabled: process.env.NODE_ENV !== 'test'
  }
};
