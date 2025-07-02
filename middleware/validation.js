// Middleware de validação básico
function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      error: 'Nome, email e senha são obrigatórios'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Senha deve ter pelo menos 6 caracteres'
    });
  }
  
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email e senha são obrigatórios'
    });
  }
  
  next();
}

function validateFipeParams(req, res, next) {
  const { tipo } = req.params;
  
  if (!['carros', 'motos', 'caminhoes'].includes(tipo)) {
    return res.status(400).json({
      error: 'Tipo deve ser: carros, motos ou caminhoes'
    });
  }
  
  next();
}

function validateFavorite(req, res, next) {
  const { codigoFipe, marca, modelo, tipo } = req.body;
  
  if (!codigoFipe || !marca || !modelo || !tipo) {
    return res.status(400).json({
      error: 'Campos obrigatórios: codigoFipe, marca, modelo, tipo'
    });
  }
  
  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateFipeParams,
  validateFavorite
};
