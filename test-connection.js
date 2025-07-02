// Script para testar se o servidor está funcionando
const http = require('http');

function testServer() {
  console.log('🔍 Testando se o servidor FIPE está funcionando...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/health',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Servidor respondeu com status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('📋 Resposta do servidor:', response);
        console.log('🎉 FIPE API está funcionando perfeitamente!');
      } catch (e) {
        console.log('📄 Resposta:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Erro ao conectar com o servidor:', error.message);
    console.log('💡 Verifique se o servidor está rodando na porta 3000');
  });

  req.on('timeout', () => {
    console.log('⏰ Timeout - Servidor não respondeu em 5 segundos');
    req.destroy();
  });

  req.end();
}

// Testar agora
testServer();

// Testar novamente em 3 segundos
setTimeout(testServer, 3000);
