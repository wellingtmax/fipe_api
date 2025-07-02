// Teste simples de sintaxe
console.log('🧪 Testando sintaxe do arquivo validation.js');

try {
  // Tentar importar o arquivo diretamente
  delete require.cache[require.resolve('./middleware/validation.js')];
  const validationModule = require('./middleware/validation.js');
  
  console.log('📦 Módulo importado:', validationModule);
  console.log('🔑 Chaves:', Object.keys(validationModule));
  console.log('🔧 validateRegister:', validationModule.validateRegister);
  console.log('🔧 validateLogin:', validationModule.validateLogin);
  
} catch (error) {
  console.error('❌ Erro na importação:', error.message);
  console.error('📍 Stack:', error.stack);
}

// Teste da sintaxe diretamente
console.log('🔍 Verificando sintaxe...');
try {
  require('./middleware/validation.js');
  console.log('✅ Sintaxe do arquivo está correta');
} catch (syntaxError) {
  console.error('❌ Erro de sintaxe:', syntaxError.message);
}
