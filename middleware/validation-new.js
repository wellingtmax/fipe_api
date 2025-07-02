const Joi = require('joi');

// Schema para registro de usuário
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 50 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'string.pattern.base': 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
    'any.required': 'Senha é obrigatória'
  })
});

// Schema para login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Senha é obrigatória'
  })
});

// Schema para parâmetros da FIPE
const fipeParamsSchema = Joi.object({
  tipo: Joi.string().valid('carros', 'motos', 'caminhoes').required().messages({
    'any.only': 'Tipo deve ser: carros, motos ou caminhoes',
    'any.required': 'Tipo de veículo é obrigatório'
  }),
  marca: Joi.string().when('$isRequired', {
    is: true,
    then: Joi.required(),
    otherwise: Joi.optional()
  }).messages({
    'any.required': 'Código da marca é obrigatório'
  })
});

// Schema para favoritos
const favoriteSchema = Joi.object({
  codigoFipe: Joi.string().min(6).required().messages({
    'string.min': 'Código FIPE deve ter pelo menos 6 caracteres',
    'any.required': 'Código FIPE é obrigatório'
  }),
  marca: Joi.string().required().messages({
    'any.required': 'Marca é obrigatória'
  }),
  modelo: Joi.string().required().messages({
    'any.required': 'Modelo é obrigatório'
  }),
  anoModelo: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required().messages({
    'number.min': 'Ano do modelo deve ser maior que 1900',
    'number.max': `Ano do modelo deve ser menor que ${new Date().getFullYear() + 1}`,
    'any.required': 'Ano do modelo é obrigatório'
  }),
  valor: Joi.string().required().messages({
    'any.required': 'Valor é obrigatório'
  }),
  tipo: Joi.string().valid('carros', 'motos', 'caminhoes').required().messages({
    'any.only': 'Tipo deve ser: carros, motos ou caminhoes',
    'any.required': 'Tipo de veículo é obrigatório'
  }),
  combustivel: Joi.string().optional(),
  anotacoes: Joi.string().max(500).optional().messages({
    'string.max': 'Anotações devem ter no máximo 500 caracteres'
  }),
  tags: Joi.array().items(Joi.string().max(30)).max(10).optional().messages({
    'array.max': 'Máximo de 10 tags permitidas',
    'string.max': 'Cada tag deve ter no máximo 30 caracteres'
  })
});

// Middleware de validação para registro
const validateRegister = (req, res, next) => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Dados de registro inválidos',
      details: errors
    });
  }
  
  next();
};

// Middleware de validação para login
const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Dados de login inválidos',
      details: errors
    });
  }
  
  next();
};

// Middleware de validação para parâmetros da FIPE
const validateFipeParams = (req, res, next) => {
  const { error } = fipeParamsSchema.validate(req.params, { 
    abortEarly: false,
    context: { isRequired: !!req.params.marca }
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Parâmetros inválidos',
      details: errors
    });
  }
  
  // Validar tabela_referencia se fornecida
  if (req.query.tabela_referencia) {
    const tabelaRef = parseInt(req.query.tabela_referencia);
    if (isNaN(tabelaRef) || tabelaRef < 1) {
      return res.status(400).json({
        success: false,
        error: 'Tabela de referência deve ser um número inteiro positivo'
      });
    }
  }
  
  next();
};

// Middleware de validação para favoritos
const validateFavorite = (req, res, next) => {
  const { error } = favoriteSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path[0],
      message: detail.message
    }));
    
    return res.status(400).json({
      success: false,
      error: 'Dados do favorito inválidos',
      details: errors
    });
  }
  
  next();
};

// Middleware de validação para query de busca
const validateSearch = (req, res, next) => {
  const { q, tipo } = req.query;
  
  // Validar query mínima
  if (q && q.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Query de busca deve ter pelo menos 2 caracteres'
    });
  }
  
  // Validar tipo se fornecido
  if (tipo && !['carros', 'motos', 'caminhoes'].includes(tipo)) {
    return res.status(400).json({
      success: false,
      error: 'Tipo deve ser: carros, motos ou caminhoes'
    });
  }
  
  next();
};

// Middleware de validação para paginação
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      error: 'Página deve ser um número inteiro positivo'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limite deve ser um número entre 1 e 100'
    });
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum
  };
  
  next();
};

// Middleware de sanitização para prevenir XSS
const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remover tags HTML e scripts
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<[^>]*>/g, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) {
    sanitize(req.body);
  }
  
  if (req.query) {
    sanitize(req.query);
  }
  
  if (req.params) {
    sanitize(req.params);
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateFipeParams,
  validateFavorite,
  validateSearch,
  validatePagination,
  sanitizeInput
};
