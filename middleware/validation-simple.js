// Middleware de validação simples - versão de teste
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

module.exports = {
  validateRegister,
  validateLogin
};
