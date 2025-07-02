// Teste com try/catch granular
console.log('🔍 Iniciando análise detalhada...');

try {
  console.log('📥 Importando Joi...');
  const Joi = require('joi');
  console.log('✅ Joi importado com sucesso');

  console.log('🏗️ Criando schema de registro...');
  const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  console.log('✅ Schema de registro criado');

  console.log('🔧 Definindo função validateRegister...');
  function validateRegister(req, res, next) {
    console.log('🎯 Executando validateRegister');
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
  }
  console.log('✅ validateRegister definida');

  console.log('🔧 Definindo função validateLogin...');
  function validateLogin(req, res, next) {
    console.log('🎯 Executando validateLogin');
    // Implementação simples para teste
    next();
  }
  console.log('✅ validateLogin definida');

  console.log('📤 Criando exports...');
  const exports = {
    validateRegister,
    validateLogin
  };
  console.log('📋 Exports:', Object.keys(exports));
  console.log('🔧 validateRegister type:', typeof exports.validateRegister);
  console.log('🔧 validateLogin type:', typeof exports.validateLogin);
  
  console.log('✅ Teste concluído com sucesso!');

} catch (error) {
  console.error('❌ Erro durante o teste:', error.message);
  console.error('📍 Stack:', error.stack);
}
