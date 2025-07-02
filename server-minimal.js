// Teste final - servidor mínimo
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FIPE API está funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'FIPE Backend API - Consulta da Tabela FIPE de Veículos',
    version: '1.0.0',
    status: '✅ Servidor funcionando!'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 FIPE API rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`✅ Teste final: http://localhost:${PORT}/health`);
});

module.exports = app;
