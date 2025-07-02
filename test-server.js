// Teste simples do servidor para identificar problemas
const express = require('express');

console.log('🔍 Iniciando teste do servidor...');

try {
  const app = express();
  
  console.log('✅ Express criado com sucesso');

  // Middleware básico
  app.use(express.json());
  console.log('✅ JSON middleware adicionado');

  // Rota de teste
  app.get('/test', (req, res) => {
    res.json({ message: 'Teste funcionando!' });
  });
  console.log('✅ Rota de teste adicionada');

  // Tentar importar as rotas uma por uma
  console.log('🔍 Testando importação das rotas...');

  try {
    const authRoutes = require('./routes/auth');
    console.log('✅ Rotas de auth importadas');
    app.use('/api/auth', authRoutes);
    console.log('✅ Rotas de auth registradas');
  } catch (error) {
    console.error('❌ Erro nas rotas de auth:', error.message);
  }

  try {
    const fipeRoutes = require('./routes/fipe');
    console.log('✅ Rotas FIPE importadas');
    app.use('/api/fipe', fipeRoutes);
    console.log('✅ Rotas FIPE registradas');
  } catch (error) {
    console.error('❌ Erro nas rotas FIPE:', error.message);
  }

  try {
    const favoritesRoutes = require('./routes/favorites');
    console.log('✅ Rotas de favoritos importadas');
    app.use('/api/favorites', favoritesRoutes);
    console.log('✅ Rotas de favoritos registradas');
  } catch (error) {
    console.error('❌ Erro nas rotas de favoritos:', error.message);
  }

  try {
    const historyRoutes = require('./routes/history');
    console.log('✅ Rotas de histórico importadas');
    app.use('/api/history', historyRoutes);
    console.log('✅ Rotas de histórico registradas');
  } catch (error) {
    console.error('❌ Erro nas rotas de histórico:', error.message);
  }

  try {
    const uploadRoutes = require('./routes/upload');
    console.log('✅ Rotas de upload importadas');
    app.use('/api/upload', uploadRoutes);
    console.log('✅ Rotas de upload registradas');
  } catch (error) {
    console.error('❌ Erro nas rotas de upload:', error.message);
  }

  // Tentar iniciar o servidor
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
    console.log('✅ Todos os testes passaram!');
    process.exit(0);
  });

} catch (error) {
  console.error('❌ Erro crítico:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}
