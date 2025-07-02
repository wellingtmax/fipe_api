// Teste de importação dos middlewares
console.log('🔍 Testando importação dos middlewares...');

try {
  const validation = require('./middleware/validation');
  console.log('✅ Middleware de validação importado');
  console.log('📋 Funções disponíveis:', Object.keys(validation));

  const { validateRegister, validateLogin } = validation;
  console.log('📋 validateRegister:', typeof validateRegister);
  console.log('📋 validateLogin:', typeof validateLogin);

  if (typeof validateRegister === 'function' && typeof validateLogin === 'function') {
    console.log('✅ Funções de validação estão corretas');
  } else {
    console.log('❌ Funções de validação não estão corretas');
  }

} catch (error) {
  console.error('❌ Erro na importação:', error.message);
  console.error('Stack:', error.stack);
}

try {
  const auth = require('./middleware/auth');
  console.log('✅ Middleware de auth importado');
  console.log('📋 Funções de auth:', Object.keys(auth));
} catch (error) {
  console.error('❌ Erro na importação do auth:', error.message);
}

try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Rotas de auth importadas com sucesso');
} catch (error) {
  console.error('❌ Erro nas rotas de auth:', error.message);
  console.error('Stack:', error.stack);
}
