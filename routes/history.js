const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Simulação de banco de dados em memória para histórico
let history = [];
let nextId = 1;

/**
 * @route GET /api/history
 * @desc Lista o histórico de consultas do usuário
 * @access Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, tipo, marca } = req.query;
    
    let userHistory = history.filter(item => item.userId === userId);
    
    // Filtros opcionais
    if (tipo) {
      userHistory = userHistory.filter(item => item.tipo === tipo);
    }
    if (marca) {
      userHistory = userHistory.filter(item => 
        item.marca && item.marca.toLowerCase().includes(marca.toLowerCase())
      );
    }
    
    // Ordenar por data (mais recente primeiro)
    userHistory.sort((a, b) => new Date(b.consultadoEm) - new Date(a.consultadoEm));
    
    // Paginação
    const offset = (page - 1) * limit;
    const paginatedHistory = userHistory.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(userHistory.length / limit),
        totalItems: userHistory.length,
        itemsPerPage: parseInt(limit)
      },
      message: `${paginatedHistory.length} itens do histórico recuperados`
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar histórico'
    });
  }
});

/**
 * @route POST /api/history
 * @desc Adiciona uma consulta ao histórico (usado internamente pela API)
 * @access Private
 */
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      tipo, 
      acao, 
      codigoFipe, 
      marca, 
      modelo, 
      anoModelo, 
      valor, 
      detalhes 
    } = req.body;
    
    const newHistoryItem = {
      id: nextId++,
      userId,
      tipo, // 'consulta_preco', 'busca_marca', 'busca_veiculo', etc.
      acao,
      codigoFipe,
      marca,
      modelo,
      anoModelo,
      valor,
      detalhes: detalhes || {},
      consultadoEm: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || 'Desconhecido'
    };
    
    history.push(newHistoryItem);
    
    // Manter apenas os últimos 1000 registros por usuário
    const userHistoryCount = history.filter(item => item.userId === userId).length;
    if (userHistoryCount > 1000) {
      const userHistoryItems = history
        .filter(item => item.userId === userId)
        .sort((a, b) => new Date(a.consultadoEm) - new Date(b.consultadoEm));
      
      // Remover os mais antigos
      const toRemove = userHistoryItems.slice(0, userHistoryCount - 1000);
      toRemove.forEach(item => {
        const index = history.findIndex(h => h.id === item.id);
        if (index > -1) {
          history.splice(index, 1);
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: newHistoryItem,
      message: 'Item adicionado ao histórico'
    });
  } catch (error) {
    console.error('Erro ao adicionar ao histórico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao adicionar ao histórico'
    });
  }
});

/**
 * @route DELETE /api/history/:id
 * @desc Remove um item específico do histórico
 * @access Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const historyIndex = history.findIndex(item => 
      item.id === parseInt(id) && item.userId === userId
    );
    
    if (historyIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item do histórico não encontrado'
      });
    }
    
    const removedItem = history.splice(historyIndex, 1)[0];
    
    res.json({
      success: true,
      data: removedItem,
      message: 'Item removido do histórico com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover do histórico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao remover do histórico'
    });
  }
});

/**
 * @route DELETE /api/history
 * @desc Limpa todo o histórico do usuário
 * @access Private
 */
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { tipo } = req.query;
    
    const initialLength = history.length;
    
    if (tipo) {
      // Remover apenas itens de um tipo específico
      history = history.filter(item => 
        !(item.userId === userId && item.tipo === tipo)
      );
    } else {
      // Remover todos os itens do usuário
      history = history.filter(item => item.userId !== userId);
    }
    
    const removedCount = initialLength - history.length;
    
    res.json({
      success: true,
      message: `${removedCount} itens removidos do histórico`,
      removedCount
    });
  } catch (error) {
    console.error('Erro ao limpar histórico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao limpar histórico'
    });
  }
});

/**
 * @route GET /api/history/stats
 * @desc Estatísticas do histórico de consultas
 * @access Private
 */
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userHistory = history.filter(item => item.userId === userId);
    
    const stats = {
      total: userHistory.length,
      ultimaConsulta: null,
      primeiraConsulta: null,
      consultasPorTipo: {},
      consultasPorMarca: {},
      consultasPorDia: {},
      marcasMaisConsultadas: [],
      tiposMaisConsultados: []
    };
    
    if (userHistory.length > 0) {
      // Ordenar por data
      const sortedHistory = userHistory.sort((a, b) => 
        new Date(b.consultadoEm) - new Date(a.consultadoEm)
      );
      
      stats.ultimaConsulta = sortedHistory[0];
      stats.primeiraConsulta = sortedHistory[sortedHistory.length - 1];
      
      // Contadores
      userHistory.forEach(item => {
        // Por tipo
        stats.consultasPorTipo[item.tipo] = (stats.consultasPorTipo[item.tipo] || 0) + 1;
        
        // Por marca
        if (item.marca) {
          stats.consultasPorMarca[item.marca] = (stats.consultasPorMarca[item.marca] || 0) + 1;
        }
        
        // Por dia
        const data = new Date(item.consultadoEm).toISOString().split('T')[0];
        stats.consultasPorDia[data] = (stats.consultasPorDia[data] || 0) + 1;
      });
      
      // Top marcas e tipos
      stats.marcasMaisConsultadas = Object.entries(stats.consultasPorMarca)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([marca, count]) => ({ marca, count }));
      
      stats.tiposMaisConsultados = Object.entries(stats.consultasPorTipo)
        .sort(([,a], [,b]) => b - a)
        .map(([tipo, count]) => ({ tipo, count }));
    }
    
    res.json({
      success: true,
      data: stats,
      message: 'Estatísticas do histórico calculadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao calcular estatísticas do histórico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao calcular estatísticas'
    });
  }
});

/**
 * @route GET /api/history/recent
 * @desc Últimas consultas do usuário (para sugestões)
 * @access Private
 */
router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    const userHistory = history
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.consultadoEm) - new Date(a.consultadoEm))
      .slice(0, parseInt(limit));
    
    // Extrair dados únicos para sugestões
    const uniqueMarks = [...new Set(userHistory
      .filter(item => item.marca)
      .map(item => item.marca))];
    
    const uniqueModels = [...new Set(userHistory
      .filter(item => item.modelo)
      .map(item => item.modelo))];
    
    res.json({
      success: true,
      data: {
        consultas: userHistory,
        sugestoes: {
          marcas: uniqueMarks.slice(0, 5),
          modelos: uniqueModels.slice(0, 5)
        }
      },
      message: `${userHistory.length} consultas recentes recuperadas`
    });
  } catch (error) {
    console.error('Erro ao buscar consultas recentes:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao buscar consultas recentes'
    });
  }
});

/**
 * @route GET /api/history/export
 * @desc Exporta o histórico do usuário em formato JSON
 * @access Private
 */
router.get('/export', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userHistory = history.filter(item => item.userId === userId);
    
    const exportData = {
      usuario: req.user.name || 'Usuário',
      exportadoEm: new Date().toISOString(),
      totalConsultas: userHistory.length,
      historico: userHistory.sort((a, b) => 
        new Date(b.consultadoEm) - new Date(a.consultadoEm)
      )
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="historico-fipe-${userId}-${Date.now()}.json"`);
    
    res.json({
      success: true,
      data: exportData,
      message: 'Histórico exportado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao exportar histórico:', error.message);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao exportar histórico'
    });
  }
});

// Middleware para adicionar consultas automaticamente ao histórico
const addToHistory = (req, res, next) => {
  // Este middleware pode ser usado em outras rotas para registrar consultas automaticamente
  const originalSend = res.send;
  
  res.send = function(data) {
    // Se a resposta foi bem-sucedida e há um usuário logado
    if (res.statusCode === 200 && req.user) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        
        if (parsedData.success && parsedData.data) {
          // Determinar o tipo de consulta baseado na URL
          let tipo = 'consulta_geral';
          if (req.path.includes('/preco')) {
            tipo = 'consulta_preco';
          } else if (req.path.includes('/marcas')) {
            tipo = 'busca_marca';
          } else if (req.path.includes('/veiculos')) {
            tipo = 'busca_veiculo';
          }
          
          // Adicionar ao histórico de forma assíncrona
          setImmediate(() => {
            const historyItem = {
              id: nextId++,
              userId: req.user.id,
              tipo,
              acao: req.method,
              url: req.originalUrl,
              detalhes: {
                userAgent: req.headers['user-agent'],
                ip: req.ip
              },
              consultadoEm: new Date().toISOString()
            };
            
            history.push(historyItem);
          });
        }
      } catch (error) {
        // Ignorar erros no middleware de histórico
        console.warn('Erro ao adicionar ao histórico automaticamente:', error.message);
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Exportar o middleware também
router.addToHistory = addToHistory;

module.exports = router;
