// Teste do arquivo simples
console.log('🧪 Testando validation-simple.js');

try {
  const validationSimple = require('./middleware/validation-simple.js');
  
  console.log('📦 Módulo importado:', validationSimple);
  console.log('🔑 Chaves:', Object.keys(validationSimple));
  console.log('🔧 validateRegister:', typeof validationSimple.validateRegister);
  console.log('🔧 validateLogin:', typeof validationSimple.validateLogin);
  
  if (typeof validationSimple.validateRegister === 'function') {
    console.log('✅ Arquivo simples funcionou!');
  } else {
    console.log('❌ Arquivo simples também falhou');
  }
  
} catch (error) {
  console.error('❌ Erro:', error.message);
}
